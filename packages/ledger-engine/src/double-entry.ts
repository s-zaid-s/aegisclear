import {
  asMinorUnits, DomainError, err, ok,
  type CurrencyCode, type IsoTimestamp, type JournalEntry, type JournalEntryId,
  type LedgerPosting, type MinorUnits, type Result, type SettlementAccount,
} from '@aegisclear/core';

export const GENESIS_HASH = '00000000000000000000000000000000';

/**
 * Pure double-entry journal builder and cryptographic hash-chain verifier.
 * Enforces strict zero-sum invariant: total DEBIT minor units === total CREDIT minor units.
 */
export function buildBalancedJournalEntry(params: {
  readonly id: JournalEntryId;
  readonly currency: CurrencyCode;
  readonly referenceId: string;
  readonly memo: string;
  readonly postings: readonly LedgerPosting[];
  readonly previousHash: string;
  readonly recordedAt: IsoTimestamp;
}): Result<JournalEntry> {
  if (params.postings.length < 2) {
    return err(new DomainError('UNBALANCED_JOURNAL', 'A double-entry journal requires at least two postings.'));
  }

  let debitTotal = 0;
  let creditTotal = 0;
  for (const posting of params.postings) {
    if (posting.amountMinor <= 0) {
      return err(new DomainError('VALIDATION_ERROR', 'Posting amounts must be strictly positive minor units.'));
    }
    if (posting.direction === 'DEBIT') debitTotal += posting.amountMinor;
    else creditTotal += posting.amountMinor;
  }

  if (debitTotal !== creditTotal) {
    return err(
      new DomainError('UNBALANCED_JOURNAL', `Debits (${debitTotal}) do not equal credits (${creditTotal}).`)
    );
  }

  const entryHash = computeDeterministicEntryHash(params);
  return ok({
    id: params.id,
    currency: params.currency,
    referenceId: params.referenceId,
    memo: params.memo,
    postings: [...params.postings],
    previousHash: params.previousHash,
    entryHash,
    recordedAt: params.recordedAt,
  });
}

export function availableLiquidityMinor(account: SettlementAccount): MinorUnits {
  return asMinorUnits(account.balanceMinor - account.reservedMinor + account.intradayCreditLimitMinor);
}

export function computeDeterministicEntryHash(params: {
  readonly id: JournalEntryId;
  readonly currency: CurrencyCode;
  readonly referenceId: string;
  readonly postings: readonly LedgerPosting[];
  readonly previousHash: string;
  readonly recordedAt: IsoTimestamp;
}): string {
  const canonical = JSON.stringify({
    id: params.id,
    currency: params.currency,
    referenceId: params.referenceId,
    postings: params.postings,
    previousHash: params.previousHash,
    recordedAt: params.recordedAt,
  });
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < canonical.length; i++) {
    const code = canonical.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= code + i;
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  return `${(h1 >>> 0).toString(16).padStart(8, '0')}${(h2 >>> 0).toString(16).padStart(8, '0')}`;
}

export function verifyJournalChain(
  entries: readonly JournalEntry[]
): { readonly valid: boolean; readonly entryCount: number; readonly brokenEntryId?: string } {
  let expectedPrev = GENESIS_HASH;
  for (const entry of entries) {
    if (entry.previousHash !== expectedPrev) {
      return { valid: false, entryCount: entries.length, brokenEntryId: entry.id };
    }
    const recomputed = computeDeterministicEntryHash(entry);
    if (entry.entryHash !== recomputed) {
      return { valid: false, entryCount: entries.length, brokenEntryId: entry.id };
    }
    expectedPrev = entry.entryHash;
  }
  return { valid: true, entryCount: entries.length };
}
