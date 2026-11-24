import type {
  AccountId, BatchId, CurrencyCode, FxQuoteId, IdempotencyKey, InstitutionId,
  IsoTimestamp, JournalEntryId, MinorUnits, PaymentId, PvpSwapId, ScaledFxRate,
} from './primitives.js';

export type AccountStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED';

export interface SettlementAccount {
  readonly id: AccountId;
  readonly institutionId: InstitutionId;
  readonly institutionName: string;
  readonly currency: CurrencyCode;
  /** Settled cash balance in minor units. */
  readonly balanceMinor: MinorUnits;
  /** Funds earmarked for pending instructions or multilateral netting batches. */
  readonly reservedMinor: MinorUnits;
  /** Approved intraday overdraft facility in minor units (>= 0). */
  readonly intradayCreditLimitMinor: MinorUnits;
  readonly status: AccountStatus;
  readonly createdAt: IsoTimestamp;
}

export type PostingDirection = 'DEBIT' | 'CREDIT';

export interface LedgerPosting {
  readonly accountId: AccountId;
  readonly direction: PostingDirection;
  readonly amountMinor: MinorUnits;
}

export interface JournalEntry {
  readonly id: JournalEntryId;
  readonly currency: CurrencyCode;
  readonly referenceId: string;
  readonly memo: string;
  readonly postings: readonly LedgerPosting[];
  readonly previousHash: string;
  readonly entryHash: string;
  readonly recordedAt: IsoTimestamp;
}

export type PaymentStatus = 'QUEUED_LIQUIDITY' | 'SETTLED' | 'REJECTED' | 'CANCELLED';

export interface PaymentInstruction {
  readonly id: PaymentId;
  readonly idempotencyKey: IdempotencyKey;
  readonly debtorAccountId: AccountId;
  readonly creditorAccountId: AccountId;
  readonly currency: CurrencyCode;
  readonly amountMinor: MinorUnits;
  readonly priority: 'URGENT' | 'NORMAL';
  readonly status: PaymentStatus;
  readonly failureReason?: string;
  readonly settledByBatchId?: BatchId;
  readonly createdAt: IsoTimestamp;
  readonly settledAt?: IsoTimestamp;
}

export interface NettingBatch {
  readonly id: BatchId;
  readonly currency: CurrencyCode;
  readonly settledPaymentIds: readonly PaymentId[];
  readonly grossVolumeMinor: MinorUnits;
  readonly netLiquidityUsedMinor: MinorUnits;
  readonly liquiditySavedMinor: MinorUnits;
  readonly executedAt: IsoTimestamp;
}

export interface FxQuote {
  readonly id: FxQuoteId;
  readonly baseCurrency: CurrencyCode;
  readonly quoteCurrency: CurrencyCode;
  readonly scaledRate: ScaledFxRate;
  readonly createdAt: IsoTimestamp;
  readonly expiresAt: IsoTimestamp;
}

export type PvpSwapStatus = 'SETTLED' | 'FAILED';

export interface PvpFxSettlement {
  readonly id: PvpSwapId;
  readonly quoteId: FxQuoteId;
  readonly partyASellAccountId: AccountId;
  readonly partyABuyAccountId: AccountId;
  readonly partyBSellAccountId: AccountId;
  readonly partyBBuyAccountId: AccountId;
  readonly baseAmountMinor: MinorUnits;
  readonly quoteAmountMinor: MinorUnits;
  readonly status: PvpSwapStatus;
  readonly failureReason?: string;
  readonly settledAt: IsoTimestamp;
}
