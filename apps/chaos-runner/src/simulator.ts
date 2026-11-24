import {
  asMinorUnits,
  type AccountId, type IdempotencyKey, type InstitutionId,
} from '@aegisclear/core';
import { createOfflineClearingClient } from '@aegisclear/client';
import { ManualClock, OfflineNetworkGuard } from '@aegisclear/storage-offline';

export interface ChaosSimulationReport {
  readonly totalSubmitted: number;
  readonly settledCount: number;
  readonly queuedCount: number;
  readonly liquiditySavedMinor: number;
  readonly ledgerValid: boolean;
  readonly totalSystemCashConserved: boolean;
}

/**
 * Deterministic seeded PRNG (Mulberry32) so offline chaos stress tests
 * are 100% reproducible across machines and CI runs.
 */
function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function runDeterministicChaosSimulation(
  seed = 20261124,
  instructionCount = 250
): Promise<ChaosSimulationReport> {
  const guard = new OfflineNetworkGuard();
  guard.install();

  try {
    const rng = createSeededRng(seed);
    const clock = new ManualClock('2026-11-24T08:00:00.000Z');
    const client = createOfflineClearingClient({ clock });

    const bankIds: AccountId[] = [];
    const initialPerBank = 50_000;
    const bankCount = 6;

    for (let i = 0; i < bankCount; i++) {
      const opened = await client.openAccount({
        institutionId: `inst_${i}` as InstitutionId,
        institutionName: `Clearing Member ${i + 1}`,
        currency: 'GBP',
        initialFundingMinor: asMinorUnits(initialPerBank),
        intradayCreditLimitMinor: asMinorUnits(10_000),
      });
      if (!opened.ok) throw opened.error;
      bankIds.push(opened.value.id);
    }

    let totalSaved = 0;
    for (let step = 0; step < instructionCount; step++) {
      clock.advanceSeconds(1);
      const fromIdx = Math.floor(rng() * bankCount);
      let toIdx = Math.floor(rng() * (bankCount - 1));
      if (toIdx >= fromIdx) toIdx += 1;

      const amount = (Math.floor(rng() * 40) + 5) * 1_000;
      const idem = `chaos_${seed}_${step}` as IdempotencyKey;

      await client.submitPayment({
        idempotencyKey: idem,
        debtorAccountId: bankIds[fromIdx]!,
        creditorAccountId: bankIds[toIdx]!,
        currency: 'GBP',
        amountMinor: asMinorUnits(amount),
        priority: rng() > 0.8 ? 'URGENT' : 'NORMAL',
      });

      // Inject 15% duplicate retry traffic to verify idempotency protection
      if (rng() < 0.15) {
        await client.submitPayment({
          idempotencyKey: idem,
          debtorAccountId: bankIds[fromIdx]!,
          creditorAccountId: bankIds[toIdx]!,
          currency: 'GBP',
          amountMinor: asMinorUnits(amount),
        });
      }

      if ((step + 1) % 25 === 0) {
        const netted = await client.runMultilateralNetting('GBP');
        if (netted.ok) totalSaved += netted.value.liquiditySavedMinor;
      }
    }

    const finalNetting = await client.runMultilateralNetting('GBP');
    if (finalNetting.ok) totalSaved += finalNetting.value.liquiditySavedMinor;

    const accounts = await client.listAccounts();
    const totalFinalBalance = accounts.reduce((sum, a) => sum + a.balanceMinor, 0);
    const audit = await client.verifyLedgerIntegrity();

    return {
      totalSubmitted: instructionCount,
      settledCount: audit.entryCount,
      queuedCount: instructionCount - audit.entryCount,
      liquiditySavedMinor: totalSaved,
      ledgerValid: audit.valid,
      totalSystemCashConserved: totalFinalBalance === initialPerBank * bankCount,
    };
  } finally {
    guard.uninstall();
  }
}
