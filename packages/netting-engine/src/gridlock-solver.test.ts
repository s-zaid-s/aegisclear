import { describe, expect, it } from 'vitest';
import {
  asMinorUnits, type AccountId, type IdempotencyKey, type InstitutionId,
  type IsoTimestamp, type PaymentId, type PaymentInstruction, type SettlementAccount,
} from '@aegisclear/core';
import { IterativeMultilateralNettingSolver } from './gridlock-solver.js';

describe('IterativeMultilateralNettingSolver', () => {
  const solver = new IterativeMultilateralNettingSolver();
  const now = '2026-11-24T12:00:00.000Z' as IsoTimestamp;

  const makeAccount = (id: string, balance: number): SettlementAccount => ({
    id: id as AccountId,
    institutionId: `inst_${id}` as InstitutionId,
    institutionName: `Bank ${id.toUpperCase()}`,
    currency: 'GBP',
    balanceMinor: asMinorUnits(balance),
    reservedMinor: asMinorUnits(0),
    intradayCreditLimitMinor: asMinorUnits(0),
    status: 'ACTIVE',
    createdAt: now,
  });

  const makePayment = (id: string, from: string, to: string, amount: number): PaymentInstruction => ({
    id: id as PaymentId,
    idempotencyKey: `idem_${id}` as IdempotencyKey,
    debtorAccountId: from as AccountId,
    creditorAccountId: to as AccountId,
    currency: 'GBP',
    amountMinor: asMinorUnits(amount),
    priority: 'NORMAL',
    status: 'QUEUED_LIQUIDITY',
    createdAt: now,
  });

  it('resolves a 3-bank circular gridlock (A -> B -> C -> A) with zero net cash required', () => {
    // Each bank only holds £100 (10_000p), yet they owe each other £1,000 (100_000p) in a loop!
    const accounts = new Map<AccountId, SettlementAccount>([
      ['a' as AccountId, makeAccount('a', 10_000)],
      ['b' as AccountId, makeAccount('b', 10_000)],
      ['c' as AccountId, makeAccount('c', 10_000)],
    ]);

    const queued = [
      makePayment('p1', 'a', 'b', 100_000),
      makePayment('p2', 'b', 'c', 100_000),
      makePayment('p3', 'c', 'a', 100_000),
    ];

    const solution = solver.solve(accounts, queued);
    expect(solution.settledPaymentIds).toEqual(['p1', 'p2', 'p3']);
    expect(solution.grossVolumeMinor).toBe(300_000);
    expect(solution.netLiquidityUsedMinor).toBe(0);
    expect(solution.liquiditySavedMinor).toBe(300_000);
  });

  it('prunes unpayable outlier payments while still settling the feasible loop', () => {
    const accounts = new Map<AccountId, SettlementAccount>([
      ['a' as AccountId, makeAccount('a', 10_000)],
      ['b' as AccountId, makeAccount('b', 10_000)],
      ['c' as AccountId, makeAccount('c', 10_000)],
    ]);

    const queued = [
      makePayment('p1', 'a', 'b', 100_000),
      makePayment('p2', 'b', 'c', 100_000),
      makePayment('p3', 'c', 'a', 100_000),
      makePayment('p4', 'a', 'c', 500_000), // Impossible £5,000 payment from A
    ];

    const solution = solver.solve(accounts, queued);
    expect(solution.settledPaymentIds).toEqual(['p1', 'p2', 'p3']);
  });
});
