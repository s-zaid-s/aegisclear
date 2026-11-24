import { describe, expect, it } from 'vitest';
import { asMinorUnits, type AccountId, type IsoTimestamp, type JournalEntryId } from '@aegisclear/core';
import { buildBalancedJournalEntry, GENESIS_HASH, verifyJournalChain } from './double-entry.js';

describe('Double-Entry Ledger Engine', () => {
  const now = '2026-11-24T12:00:00.000Z' as IsoTimestamp;

  it('rejects unbalanced journal entries where debits !== credits', () => {
    const bad = buildBalancedJournalEntry({
      id: 'jrnl_1' as JournalEntryId,
      currency: 'GBP',
      referenceId: 'pay_1',
      memo: 'Unbalanced test',
      postings: [
        { accountId: 'acc_a' as AccountId, direction: 'DEBIT', amountMinor: asMinorUnits(1000) },
        { accountId: 'acc_b' as AccountId, direction: 'CREDIT', amountMinor: asMinorUnits(999) },
      ],
      previousHash: GENESIS_HASH,
      recordedAt: now,
    });
    expect(bad.ok).toBe(false);
  });

  it('verifies intact hash chains and detects tampering immediately', () => {
    const e1 = buildBalancedJournalEntry({
      id: 'jrnl_1' as JournalEntryId,
      currency: 'GBP',
      referenceId: 'pay_1',
      memo: 'Leg 1',
      postings: [
        { accountId: 'acc_a' as AccountId, direction: 'DEBIT', amountMinor: asMinorUnits(500) },
        { accountId: 'acc_b' as AccountId, direction: 'CREDIT', amountMinor: asMinorUnits(500) },
      ],
      previousHash: GENESIS_HASH,
      recordedAt: now,
    });
    expect(e1.ok).toBe(true);
    if (!e1.ok) return;

    const e2 = buildBalancedJournalEntry({
      id: 'jrnl_2' as JournalEntryId,
      currency: 'GBP',
      referenceId: 'pay_2',
      memo: 'Leg 2',
      postings: [
        { accountId: 'acc_b' as AccountId, direction: 'DEBIT', amountMinor: asMinorUnits(250) },
        { accountId: 'acc_c' as AccountId, direction: 'CREDIT', amountMinor: asMinorUnits(250) },
      ],
      previousHash: e1.value.entryHash,
      recordedAt: now,
    });
    expect(e2.ok).toBe(true);
    if (!e2.ok) return;

    expect(verifyJournalChain([e1.value, e2.value]).valid).toBe(true);

    const tampered = {
      ...e1.value,
      postings: [
        { accountId: 'acc_a' as AccountId, direction: 'DEBIT' as const, amountMinor: asMinorUnits(99999) },
        { accountId: 'acc_b' as AccountId, direction: 'CREDIT' as const, amountMinor: asMinorUnits(99999) },
      ],
    };
    const audit = verifyJournalChain([tampered, e2.value]);
    expect(audit.valid).toBe(false);
    expect(audit.brokenEntryId).toBe('jrnl_1');
  });
});
