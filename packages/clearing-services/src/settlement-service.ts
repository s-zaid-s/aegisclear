import {
  asMinorUnits, DomainError, err, ok,
  type AccountId, type BatchId, type CurrencyCode, type IEventBus,
  type JournalEntryId, type NettingBatch, type PaymentId, type PaymentInstruction,
  type Result, type SettlementAccount,
} from '@aegisclear/core';
import type {
  IClock, IIdGenerator, INettingSolver, IRiskPolicy, IUnitOfWork, SubmitPaymentInput,
} from '@aegisclear/ports';
import { availableLiquidityMinor, buildBalancedJournalEntry } from '@aegisclear/ledger-engine';

export class PaymentSettlementService {
  public constructor(
    private readonly uow: IUnitOfWork,
    private readonly riskPolicy: IRiskPolicy,
    private readonly nettingSolver: INettingSolver,
    private readonly clock: IClock,
    private readonly ids: IIdGenerator,
    private readonly events: IEventBus
  ) {}

  public async submitPayment(input: SubmitPaymentInput): Promise<Result<PaymentInstruction>> {
    return this.uow.runInTransaction(async (repos) => {
      const existing = await repos.payments.findByIdempotencyKey(input.idempotencyKey);
      if (existing) return ok(existing);

      const [debtor, creditor] = await Promise.all([
        repos.accounts.findById(input.debtorAccountId),
        repos.accounts.findById(input.creditorAccountId),
      ]);
      if (!debtor || !creditor) {
        return err(new DomainError('NOT_FOUND', 'Both debtor and creditor accounts must exist.'));
      }
      if (debtor.currency !== input.currency || creditor.currency !== input.currency) {
        return err(new DomainError('VALIDATION_ERROR', 'Account currencies must match instruction currency.'));
      }

      const riskCheck = this.riskPolicy.evaluatePayment(debtor, creditor, input.amountMinor);
      if (!riskCheck.ok) return riskCheck;

      const now = this.clock.now();
      const paymentId = this.ids.nextId('pay') as PaymentId;
      const avail = availableLiquidityMinor(debtor);

      // If immediate liquidity is insufficient, park in liquidity queue for multilateral netting!
      if (avail < input.amountMinor) {
        const queued: PaymentInstruction = {
          id: paymentId,
          idempotencyKey: input.idempotencyKey,
          debtorAccountId: debtor.id,
          creditorAccountId: creditor.id,
          currency: input.currency,
          amountMinor: input.amountMinor,
          priority: input.priority ?? 'NORMAL',
          status: 'QUEUED_LIQUIDITY',
          createdAt: now,
        };
        await repos.payments.save(queued);
        this.events.publish({ type: 'PaymentQueued', paymentId, reason: 'INSUFFICIENT_IMMEDIATE_LIQUIDITY', at: now });
        return ok(queued);
      }

      // Real-Time Gross Settlement (RTGS) path
      const prevHash = await repos.ledger.getLastHash();
      const journal = buildBalancedJournalEntry({
        id: this.ids.nextId('jrnl') as JournalEntryId,
        currency: input.currency,
        referenceId: paymentId,
        memo: `RTGS Settlement ${debtor.institutionName} -> ${creditor.institutionName}`,
        postings: [
          { accountId: debtor.id, direction: 'DEBIT', amountMinor: input.amountMinor },
          { accountId: creditor.id, direction: 'CREDIT', amountMinor: input.amountMinor },
        ],
        previousHash: prevHash,
        recordedAt: now,
      });
      if (!journal.ok) return journal;

      await repos.accounts.save({
        ...debtor,
        balanceMinor: asMinorUnits(debtor.balanceMinor - input.amountMinor),
      });
      await repos.accounts.save({
        ...creditor,
        balanceMinor: asMinorUnits(creditor.balanceMinor + input.amountMinor),
      });
      await repos.ledger.append(journal.value);

      const settled: PaymentInstruction = {
        id: paymentId,
        idempotencyKey: input.idempotencyKey,
        debtorAccountId: debtor.id,
        creditorAccountId: creditor.id,
        currency: input.currency,
        amountMinor: input.amountMinor,
        priority: input.priority ?? 'NORMAL',
        status: 'SETTLED',
        createdAt: now,
        settledAt: now,
      };
      await repos.payments.save(settled);
      this.events.publish({ type: 'PaymentSettled', paymentId, journalEntryId: journal.value.id, at: now });
      return ok(settled);
    });
  }

  public async runMultilateralNetting(currency: CurrencyCode): Promise<Result<NettingBatch>> {
    return this.uow.runInTransaction(async (repos) => {
      const queued = await repos.payments.listQueuedByCurrency(currency);
      const allAccounts = await repos.accounts.listAll();
      const accountMap = new Map<AccountId, SettlementAccount>(
        allAccounts.filter((a) => a.currency === currency).map((a) => [a.id, a])
      );

      const solution = this.nettingSolver.solve(accountMap, queued);
      const now = this.clock.now();
      const batchId = this.ids.nextId('batch') as BatchId;
      const settledSet = new Set(solution.settledPaymentIds);
      const toSettle = queued.filter((p) => settledSet.has(p.id));

      for (const payment of toSettle) {
        const debtor = accountMap.get(payment.debtorAccountId)!;
        const creditor = accountMap.get(payment.creditorAccountId)!;
        const prevHash = await repos.ledger.getLastHash();

        const journal = buildBalancedJournalEntry({
          id: this.ids.nextId('jrnl') as JournalEntryId,
          currency,
          referenceId: `${batchId}:${payment.id}`,
          memo: `Multilateral Netting Batch ${batchId}`,
          postings: [
            { accountId: debtor.id, direction: 'DEBIT', amountMinor: payment.amountMinor },
            { accountId: creditor.id, direction: 'CREDIT', amountMinor: payment.amountMinor },
          ],
          previousHash: prevHash,
          recordedAt: now,
        });
        if (!journal.ok) return journal;

        const updatedDebtor: SettlementAccount = {
          ...debtor,
          balanceMinor: asMinorUnits(debtor.balanceMinor - payment.amountMinor),
        };
        const updatedCreditor: SettlementAccount = {
          ...creditor,
          balanceMinor: asMinorUnits(creditor.balanceMinor + payment.amountMinor),
        };
        accountMap.set(updatedDebtor.id, updatedDebtor);
        accountMap.set(updatedCreditor.id, updatedCreditor);

        await repos.accounts.save(updatedDebtor);
        await repos.accounts.save(updatedCreditor);
        await repos.ledger.append(journal.value);
        await repos.payments.save({
          ...payment,
          status: 'SETTLED',
          settledByBatchId: batchId,
          settledAt: now,
        });
      }

      const batch: NettingBatch = {
        id: batchId,
        currency,
        settledPaymentIds: solution.settledPaymentIds,
        grossVolumeMinor: solution.grossVolumeMinor,
        netLiquidityUsedMinor: solution.netLiquidityUsedMinor,
        liquiditySavedMinor: solution.liquiditySavedMinor,
        executedAt: now,
      };
      await repos.batches.save(batch);
      this.events.publish({
        type: 'NettingBatchExecuted',
        batchId,
        settledCount: toSettle.length,
        liquiditySavedMinor: solution.liquiditySavedMinor,
        at: now,
      });
      return ok(batch);
    });
  }
}
