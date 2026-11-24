import {
  asMinorUnits, DomainError, err, ok,
  type CurrencyCode, type FxQuote, type FxQuoteId, type IEventBus,
  type IsoTimestamp, type JournalEntryId, type PvpFxSettlement, type PvpSwapId,
  type Result, type ScaledFxRate,
} from '@aegisclear/core';
import type { ExecutePvpFxInput, IClock, IIdGenerator, IUnitOfWork } from '@aegisclear/ports';
import { convertMinorUnitsWithQuote } from '@aegisclear/fx-engine';
import { availableLiquidityMinor, buildBalancedJournalEntry } from '@aegisclear/ledger-engine';

export class PvpFxSettlementService {
  public constructor(
    private readonly uow: IUnitOfWork,
    private readonly clock: IClock,
    private readonly ids: IIdGenerator,
    private readonly events: IEventBus
  ) {}

  public async createQuote(
    baseCurrency: CurrencyCode,
    quoteCurrency: CurrencyCode,
    scaledRate: ScaledFxRate,
    ttlSeconds: number
  ): Promise<Result<FxQuote>> {
    if (baseCurrency === quoteCurrency) {
      return err(new DomainError('VALIDATION_ERROR', 'FX quote currencies must be distinct.'));
    }
    if (ttlSeconds <= 0) {
      return err(new DomainError('VALIDATION_ERROR', 'FX quote TTL must be positive.'));
    }

    const now = this.clock.now();
    const quote: FxQuote = {
      id: this.ids.nextId('fxq') as FxQuoteId,
      baseCurrency,
      quoteCurrency,
      scaledRate,
      createdAt: now,
      expiresAt: new Date(Date.parse(now) + ttlSeconds * 1000).toISOString() as IsoTimestamp,
    };
    await this.uow.runInTransaction(async (repos) => {
      await repos.fxQuotes.save(quote);
    });
    return ok(quote);
  }

  /**
   * Executes atomic Payment-versus-Payment (PvP) cross-currency settlement.
   * Either BOTH currency legs settle or NEITHER settles (eliminating Herstatt settlement risk).
   */
  public async executePvpSwap(input: ExecutePvpFxInput): Promise<Result<PvpFxSettlement>> {
    return this.uow.runInTransaction(async (repos) => {
      const quote = await repos.fxQuotes.findById(input.quoteId);
      if (!quote) return err(new DomainError('NOT_FOUND', `FX quote ${input.quoteId} not found.`));

      const now = this.clock.now();
      const converted = convertMinorUnitsWithQuote(input.baseAmountMinor, quote, now);
      if (!converted.ok) return converted;
      const quoteAmountMinor = converted.value;

      const [aSell, aBuy, bSell, bBuy] = await Promise.all([
        repos.accounts.findById(input.partyASellAccountId),
        repos.accounts.findById(input.partyABuyAccountId),
        repos.accounts.findById(input.partyBSellAccountId),
        repos.accounts.findById(input.partyBBuyAccountId),
      ]);
      if (!aSell || !aBuy || !bSell || !bBuy) {
        return err(new DomainError('NOT_FOUND', 'All 4 PvP settlement accounts must exist.'));
      }
      if (
        aSell.currency !== quote.baseCurrency ||
        bBuy.currency !== quote.baseCurrency ||
        bSell.currency !== quote.quoteCurrency ||
        aBuy.currency !== quote.quoteCurrency
      ) {
        return err(new DomainError('VALIDATION_ERROR', 'Account currencies do not match the FX quote pair.'));
      }

      if (availableLiquidityMinor(aSell) < input.baseAmountMinor) {
        return err(new DomainError('INSUFFICIENT_LIQUIDITY', 'Party A has insufficient base currency liquidity for PvP swap.'));
      }
      if (availableLiquidityMinor(bSell) < quoteAmountMinor) {
        return err(new DomainError('INSUFFICIENT_LIQUIDITY', 'Party B has insufficient quote currency liquidity for PvP swap.'));
      }

      const swapId = this.ids.nextId('pvp') as PvpSwapId;
      const hash1 = await repos.ledger.getLastHash();
      const baseJournal = buildBalancedJournalEntry({
        id: this.ids.nextId('jrnl') as JournalEntryId,
        currency: quote.baseCurrency,
        referenceId: `${swapId}:base`,
        memo: `PvP Base Leg (${quote.baseCurrency})`,
        postings: [
          { accountId: aSell.id, direction: 'DEBIT', amountMinor: input.baseAmountMinor },
          { accountId: bBuy.id, direction: 'CREDIT', amountMinor: input.baseAmountMinor },
        ],
        previousHash: hash1,
        recordedAt: now,
      });
      if (!baseJournal.ok) return baseJournal;

      const quoteJournal = buildBalancedJournalEntry({
        id: this.ids.nextId('jrnl') as JournalEntryId,
        currency: quote.quoteCurrency,
        referenceId: `${swapId}:quote`,
        memo: `PvP Quote Leg (${quote.quoteCurrency})`,
        postings: [
          { accountId: bSell.id, direction: 'DEBIT', amountMinor: quoteAmountMinor },
          { accountId: aBuy.id, direction: 'CREDIT', amountMinor: quoteAmountMinor },
        ],
        previousHash: baseJournal.value.entryHash,
        recordedAt: now,
      });
      if (!quoteJournal.ok) return quoteJournal;

      await repos.accounts.save({ ...aSell, balanceMinor: asMinorUnits(aSell.balanceMinor - input.baseAmountMinor) });
      await repos.accounts.save({ ...bBuy, balanceMinor: asMinorUnits(bBuy.balanceMinor + input.baseAmountMinor) });
      await repos.accounts.save({ ...bSell, balanceMinor: asMinorUnits(bSell.balanceMinor - quoteAmountMinor) });
      await repos.accounts.save({ ...aBuy, balanceMinor: asMinorUnits(aBuy.balanceMinor + quoteAmountMinor) });
      await repos.ledger.append(baseJournal.value);
      await repos.ledger.append(quoteJournal.value);

      const swap: PvpFxSettlement = {
        id: swapId,
        quoteId: quote.id,
        partyASellAccountId: aSell.id,
        partyABuyAccountId: aBuy.id,
        partyBSellAccountId: bSell.id,
        partyBBuyAccountId: bBuy.id,
        baseAmountMinor: input.baseAmountMinor,
        quoteAmountMinor,
        status: 'SETTLED',
        settledAt: now,
      };
      await repos.pvpSwaps.save(swap);
      this.events.publish({ type: 'PvpFxSettled', swapId, at: now });
      return ok(swap);
    });
  }
}
