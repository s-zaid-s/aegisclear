import type {
  AccountId, BatchId, CurrencyCode, FxQuote, FxQuoteId, IdempotencyKey,
  JournalEntry, NettingBatch, PaymentId, PaymentInstruction, PvpFxSettlement,
  SettlementAccount,
} from '@aegisclear/core';

export interface IAccountRepository {
  findById(id: AccountId): Promise<SettlementAccount | null>;
  listAll(): Promise<readonly SettlementAccount[]>;
  save(account: SettlementAccount): Promise<void>;
}

export interface ILedgerRepository {
  listByCurrency(currency: CurrencyCode): Promise<readonly JournalEntry[]>;
  listAll(): Promise<readonly JournalEntry[]>;
  getLastHash(): Promise<string>;
  append(entry: JournalEntry): Promise<void>;
}

export interface IPaymentRepository {
  findById(id: PaymentId): Promise<PaymentInstruction | null>;
  findByIdempotencyKey(key: IdempotencyKey): Promise<PaymentInstruction | null>;
  listQueuedByCurrency(currency: CurrencyCode): Promise<readonly PaymentInstruction[]>;
  save(payment: PaymentInstruction): Promise<void>;
}

export interface INettingBatchRepository {
  findById(id: BatchId): Promise<NettingBatch | null>;
  listAll(): Promise<readonly NettingBatch[]>;
  save(batch: NettingBatch): Promise<void>;
}

export interface IFxQuoteRepository {
  findById(id: FxQuoteId): Promise<FxQuote | null>;
  save(quote: FxQuote): Promise<void>;
}

export interface IPvpSwapRepository {
  listAll(): Promise<readonly PvpFxSettlement[]>;
  save(swap: PvpFxSettlement): Promise<void>;
}

export interface IRepositoryRegistry {
  readonly accounts: IAccountRepository;
  readonly ledger: ILedgerRepository;
  readonly payments: IPaymentRepository;
  readonly batches: INettingBatchRepository;
  readonly fxQuotes: IFxQuoteRepository;
  readonly pvpSwaps: IPvpSwapRepository;
}

export interface IUnitOfWork {
  runInTransaction<T>(work: (repos: IRepositoryRegistry) => Promise<T>): Promise<T>;
}
