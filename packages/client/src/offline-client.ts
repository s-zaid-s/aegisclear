import { asMinorUnits, type IsoTimestamp } from '@aegisclear/core';
import type { IClearingEngineClient, IClock, IIdGenerator, IRiskPolicy } from '@aegisclear/ports';
import { verifyJournalChain } from '@aegisclear/ledger-engine';
import { IterativeMultilateralNettingSolver } from '@aegisclear/netting-engine';
import { StandardClearingRiskPolicy } from '@aegisclear/risk-engine';
import { InMemoryClearingStore } from '@aegisclear/storage-offline';
import {
  AccountService, PaymentSettlementService, PvpFxSettlementService, SynchronousEventBus,
} from '@aegisclear/clearing-services';

export interface OfflineClearingDependencies {
  readonly clock?: IClock;
  readonly ids?: IIdGenerator;
  readonly store?: InMemoryClearingStore;
  readonly riskPolicy?: IRiskPolicy;
}

export function createOfflineClearingClient(deps: OfflineClearingDependencies = {}): IClearingEngineClient {
  let seq = 0;
  const clock: IClock = deps.clock ?? { now: () => new Date().toISOString() as IsoTimestamp };
  const ids: IIdGenerator = deps.ids ?? { nextId: (prefix) => `${prefix}_${++seq}` };
  const store = deps.store ?? new InMemoryClearingStore();
  const risk = deps.riskPolicy ?? new StandardClearingRiskPolicy(asMinorUnits(100_000_000));
  const events = new SynchronousEventBus();

  const accounts = new AccountService(store, clock, ids, events);
  const settlement = new PaymentSettlementService(store, risk, new IterativeMultilateralNettingSolver(), clock, ids, events);
  const pvpFx = new PvpFxSettlementService(store, clock, ids, events);

  return {
    openAccount: (input) => accounts.openAccount(input),
    listAccounts: () => store.repositories.accounts.listAll(),
    fundAccount: (accountId, amountMinor, memo) => accounts.fundAccount(accountId, amountMinor, memo),
    submitPayment: (input) => settlement.submitPayment(input),
    runMultilateralNetting: (currency) => settlement.runMultilateralNetting(currency),
    createFxQuote: (base, quote, rate, ttl) => pvpFx.createQuote(base, quote, rate, ttl),
    executePvpFxSettlement: (input) => pvpFx.executePvpSwap(input),
    verifyLedgerIntegrity: async () => verifyJournalChain(await store.repositories.ledger.listAll()),
    listJournalEntries: (currency) =>
      currency ? store.repositories.ledger.listByCurrency(currency) : store.repositories.ledger.listAll(),
  };
}
