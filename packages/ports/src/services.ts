import type {
  AccountId, CurrencyCode, FxQuote, FxQuoteId, IdempotencyKey, InstitutionId,
  IsoTimestamp, JournalEntry, MinorUnits, NettingBatch, PaymentInstruction,
  PvpFxSettlement, Result, ScaledFxRate, SettlementAccount,
} from '@aegisclear/core';

export interface IClock {
  now(): IsoTimestamp;
}

export interface IIdGenerator {
  nextId(prefix: string): string;
}

export interface INetworkGuard {
  install(): void;
  uninstall(): void;
  isActive(): boolean;
}

export interface IRiskPolicy {
  evaluatePayment(
    debtor: SettlementAccount,
    creditor: SettlementAccount,
    amountMinor: MinorUnits
  ): Result<void>;
}

export interface NettingCandidate {
  readonly payment: PaymentInstruction;
}

export interface NettingSolution {
  readonly settledPaymentIds: readonly PaymentInstruction['id'][];
  readonly grossVolumeMinor: MinorUnits;
  readonly netLiquidityUsedMinor: MinorUnits;
  readonly liquiditySavedMinor: MinorUnits;
}

export interface INettingSolver {
  solve(
    accounts: ReadonlyMap<AccountId, SettlementAccount>,
    queuedPayments: readonly PaymentInstruction[]
  ): NettingSolution;
}

export interface OpenAccountInput {
  readonly institutionId: InstitutionId;
  readonly institutionName: string;
  readonly currency: CurrencyCode;
  readonly initialFundingMinor: MinorUnits;
  readonly intradayCreditLimitMinor: MinorUnits;
}

export interface SubmitPaymentInput {
  readonly idempotencyKey: IdempotencyKey;
  readonly debtorAccountId: AccountId;
  readonly creditorAccountId: AccountId;
  readonly currency: CurrencyCode;
  readonly amountMinor: MinorUnits;
  readonly priority?: 'URGENT' | 'NORMAL';
}

export interface ExecutePvpFxInput {
  readonly quoteId: FxQuoteId;
  readonly partyASellAccountId: AccountId;
  readonly partyABuyAccountId: AccountId;
  readonly partyBSellAccountId: AccountId;
  readonly partyBBuyAccountId: AccountId;
  readonly baseAmountMinor: MinorUnits;
}

export interface IClearingEngineClient {
  openAccount(input: OpenAccountInput): Promise<Result<SettlementAccount>>;
  listAccounts(): Promise<readonly SettlementAccount[]>;
  fundAccount(accountId: AccountId, amountMinor: MinorUnits, memo: string): Promise<Result<SettlementAccount>>;
  submitPayment(input: SubmitPaymentInput): Promise<Result<PaymentInstruction>>;
  runMultilateralNetting(currency: CurrencyCode): Promise<Result<NettingBatch>>;
  createFxQuote(baseCurrency: CurrencyCode, quoteCurrency: CurrencyCode, scaledRate: ScaledFxRate, ttlSeconds: number): Promise<Result<FxQuote>>;
  executePvpFxSettlement(input: ExecutePvpFxInput): Promise<Result<PvpFxSettlement>>;
  verifyLedgerIntegrity(): Promise<{ readonly valid: boolean; readonly entryCount: number; readonly brokenEntryId?: string }>;
  listJournalEntries(currency?: CurrencyCode): Promise<readonly JournalEntry[]>;
}
