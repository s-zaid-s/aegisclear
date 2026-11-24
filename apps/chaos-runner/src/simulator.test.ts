import { describe, expect, it } from 'vitest';
import { runDeterministicChaosSimulation } from './simulator.js';

describe('Deterministic Chaos & Gridlock Simulator', () => {
  it('conserves 100% of system cash and maintains hash-chain integrity across 250 chaotic instructions', async () => {
    const report1 = await runDeterministicChaosSimulation(42, 250);
    const report2 = await runDeterministicChaosSimulation(42, 250);

    expect(report1.ledgerValid).toBe(true);
    expect(report1.totalSystemCashConserved).toBe(true);
    expect(report1.liquiditySavedMinor).toBeGreaterThan(0);
    expect(report1).toEqual(report2);
  });
});
