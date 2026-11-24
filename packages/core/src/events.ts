import type {
  AccountId, BatchId, IsoTimestamp, JournalEntryId, MinorUnits, PaymentId, PvpSwapId,
} from './primitives.js';

export type DomainEvent =
  | { type: 'AccountOpened'; accountId: AccountId; at: IsoTimestamp }
  | { type: 'LiquidityFunded'; accountId: AccountId; amountMinor: MinorUnits; at: IsoTimestamp }
  | { type: 'PaymentQueued'; paymentId: PaymentId; reason: string; at: IsoTimestamp }
  | { type: 'PaymentSettled'; paymentId: PaymentId; journalEntryId: JournalEntryId; at: IsoTimestamp }
  | { type: 'NettingBatchExecuted'; batchId: BatchId; settledCount: number; liquiditySavedMinor: MinorUnits; at: IsoTimestamp }
  | { type: 'PvpFxSettled'; swapId: PvpSwapId; at: IsoTimestamp };

export type DomainEventListener = (event: DomainEvent) => void;

export interface IEventBus {
  publish(event: DomainEvent): void;
  subscribe(listener: DomainEventListener): () => void;
}
