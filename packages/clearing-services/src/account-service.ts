import {
  asMinorUnits, DomainError, err, ok,
  type AccountId, type IEventBus, type JournalEntryId, type MinorUnits,
  type Result, type SettlementAccount,
} from '@aegisclear/core';
import type { IClock, IIdGenerator, IUnitOfWork, OpenAccountInput } from '@aegisclear/ports';
import { buildBalancedJournalEntry } from '@aegisclear/ledger-engine';

export class AccountService {
  public constructor(
    private readonly uow: IUnitOfWork,
    private readonly clock: IClock,
    private readonly ids: IIdGenerator,
    private readonly events: IEventBus
  ) {}

  public async openAccount(input: OpenAccountInput): Promise<Result<SettlementAccount>> {
    if (input.initialFundingMinor < 0 || input.intradayCreditLimitMinor < 0) {
      return err(new DomainError('VALIDATION_ERROR', 'Initial funding and credit limit must be non-negative.'));
    }

    const now = this.clock.now();
    const account: SettlementAccount = {
      id: this.ids.nextId('acc') as AccountId,
      institutionId: input.institutionId,
      institutionName: input.institutionName.trim(),
      currency: input.currency,
      balanceMinor: input.initialFundingMinor,
      reservedMinor: asMinorUnits(0),
      intradayCreditLimitMinor: input.intradayCreditLimitMinor,
      status: 'ACTIVE',
      createdAt: now,
    };

    await this.uow.runInTransaction(async (repos) => {
      await repos.accounts.save(account);
    });
    this.events.publish({ type: 'AccountOpened', accountId: account.id, at: now });
    return ok(account);
  }

  public async fundAccount(
    accountId: AccountId,
    amountMinor: MinorUnits,
    memo: string
  ): Promise<Result<SettlementAccount>> {
    if (amountMinor <= 0) {
      return err(new DomainError('VALIDATION_ERROR', 'Top-up amount must be strictly positive.'));
    }

    return this.uow.runInTransaction(async (repos) => {
      const account = await repos.accounts.findById(accountId);
      if (!account) return err(new DomainError('NOT_FOUND', `Account ${accountId} not found.`));

      const treasuryId = `treasury_${account.currency}` as AccountId;
      const now = this.clock.now();
      const prevHash = await repos.ledger.getLastHash();
      const journal = buildBalancedJournalEntry({
        id: this.ids.nextId('jrnl') as JournalEntryId,
        currency: account.currency,
        referenceId: `fund_${account.id}_${now}`,
        memo: memo.trim() || 'Central Liquidity Top-Up',
        postings: [
          { accountId: treasuryId, direction: 'DEBIT', amountMinor },
          { accountId: account.id, direction: 'CREDIT', amountMinor },
        ],
        previousHash: prevHash,
        recordedAt: now,
      });
      if (!journal.ok) return journal;

      const updated: SettlementAccount = {
        ...account,
        balanceMinor: asMinorUnits(account.balanceMinor + amountMinor),
      };
      await repos.ledger.append(journal.value);
      await repos.accounts.save(updated);
      this.events.publish({ type: 'LiquidityFunded', accountId, amountMinor, at: now });
      return ok(updated);
    });
  }
}
