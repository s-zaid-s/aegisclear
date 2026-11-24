import {
  asMinorUnits, DomainError, err, ok,
  type FxQuote, type IsoTimestamp, type MinorUnits, type Result,
} from '@aegisclear/core';

const RATE_SCALE = 1_000_000n;

/**
 * Converts integer minor units using BigInt scaled FX rates so no floating-point
 * precision loss ever occurs on large institutional settlements.
 */
export function convertMinorUnitsWithQuote(
  baseAmountMinor: MinorUnits,
  quote: FxQuote,
  now: IsoTimestamp
): Result<MinorUnits> {
  if (Date.parse(now) > Date.parse(quote.expiresAt)) {
    return err(new DomainError('QUOTE_EXPIRED', `FX quote ${quote.id} expired at ${quote.expiresAt}.`));
  }
  if (baseAmountMinor <= 0) {
    return err(new DomainError('VALIDATION_ERROR', 'FX conversion amount must be positive.'));
  }

  const raw = (BigInt(baseAmountMinor) * BigInt(quote.scaledRate)) / RATE_SCALE;
  const converted = Number(raw);
  if (!Number.isSafeInteger(converted) || converted <= 0) {
    return err(new DomainError('VALIDATION_ERROR', 'Converted FX amount is out of safe integer range.'));
  }
  return ok(asMinorUnits(converted));
}
