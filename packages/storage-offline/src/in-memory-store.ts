import type {
  AccountId, BatchId, FxQuote, FxQuoteId, IdempotencyKey, JournalEntry,
  NettingBatch, PaymentId, PaymentInstruction, PvpFxSettlement, SettlementAccount,
} from '@aegisclear/core';
import type { IRepositoryRegistry, IUnitOfWork } from '@aegisclear/ports';
import { GENESIS_HASH } from '@aegisclear/ledger-engine';

export class InMemoryClearingStore implements IUnitOfWork {
  private accounts = new Map<AccountId, SettlementAccount>();
  private ledger: JournalEntry[] = [];
  private payments = new Map<PaymentId, PaymentInstruction>();
  private paymentByIdem = new Map<IdempotencyKey, PaymentId>();
  private batches = new Map<BatchId, NettingBatch>();
  private fxQuotes = new Map<FxQuoteId, FxQuote>();
  private pvpSwaps: PvpFxSettlement[] = [];

  public readonly repositories: IRepositoryRegistry = {
    accounts: {
      findById: async (id) => this.accounts.get(id) ?? null,
      listAll: async () => [...this.accounts.values()],
      save: async (account) => { this.accounts.set(account.id, account); },
    },
    ledger: {
      listByCurrency: async (currency) => this.ledger.filter((e) => e.currency === currency),
      listAll: async () => [...this.ledger],
      getLastHash: async () => this.ledger[this.ledger.length - 1]?.entryHash ?? GENESIS_HASH,
      append: async (entry) => { this.ledger.push(entry); },
    },
    payments: {
      findById: async (id) => this.payments.get(id) ?? null,
      findByIdempotencyKey: async (key) => {
        const id = this.paymentByIdem.get(key);
        return id ? (this.payments.get(id) ?? null) : null;
      },
      listQueuedByCurrency: async (currency) =>
        [...this.payments.values()].filter((p) => p.currency === currency && p.status === 'QUEUED_LIQUIDITY'),
      save: async (payment) => {
        this.payments.set(payment.id, payment);
        this.paymentByIdem.set(payment.idempotencyKey, payment.id);
      },
    },
    batches: {
      findById: async (id) => this.batches.get(id) ?? null,
      listAll: async () => [...this.batches.values()],
      save: async (batch) => { this.batches.set(batch.id, batch); },
    },
    fxQuotes: {
      findById: async (id) => this.fxQuotes.get(id) ?? null,
      save: async (quote) => { this.fxQuotes.set(quote.id, quote); },
    },
    pvpSwaps: {
      listAll: async () => [...this.pvpSwaps],
      save: async (swap) => { this.pvpSwaps.push(swap); },
    },
  };

  /** Executes multi-repository mutations atomically with full snapshot rollback on error. */
  public async runInTransaction<T>(work: (repos: IRepositoryRegistry) => Promise<T>): Promise<T> {
    const snapAccounts = new Map(this.accounts);
    const snapLedger = [...this.ledger];
    const snapPayments = new Map(this.payments);
    const snapIdem = new Map(this.paymentByIdem);
    const snapBatches = new Map(this.batches);
    const snapQuotes = new Map(this.fxQuotes);
    const snapSwaps = [...this.pvpSwaps];

    try {
      return await work(this.repositories);
    } catch (error) {
      this.accounts = snapAccounts;
      this.ledger = snapLedger;
      this.payments = snapPayments;
      this.paymentByIdem = snapIdem;
      this.batches = snapBatches;
      this.fxQuotes = snapQuotes;
      this.pvpSwaps = snapSwaps;
      throw error;
    }
  }
}
