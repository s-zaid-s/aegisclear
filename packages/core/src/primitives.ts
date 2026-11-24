declare const brand: unique symbol;
export type Brand<T, Name extends string> = T & { readonly [brand]: Name };

export type InstitutionId = Brand<string, 'InstitutionId'>;
export type AccountId = Brand<string, 'AccountId'>;
export type PaymentId = Brand<string, 'PaymentId'>;
export type JournalEntryId = Brand<string, 'JournalEntryId'>;
export type BatchId = Brand<string, 'BatchId'>;
export type FxQuoteId = Brand<string, 'FxQuoteId'>;
export type PvpSwapId = Brand<string, 'PvpSwapId'>;
export type IdempotencyKey = Brand<string, 'IdempotencyKey'>;
export type IsoTimestamp = Brand<string, 'IsoTimestamp'>;

/** Integer minor currency units (e.g. GBP pence, USD cents, JPY yen) to prevent floating-point drift. */
export type MinorUnits = Brand<number, 'MinorUnits'>;

/** Exchange rate scaled by 1,000,000 (1.250000 = 1_250_000) for deterministic integer FX math. */
export type ScaledFxRate = Brand<number, 'ScaledFxRate'>;

export type CurrencyCode = 'GBP' | 'EUR' | 'USD' | 'JPY';

export const SUPPORTED_CURRENCIES: readonly CurrencyCode[] = ['GBP', 'EUR', 'USD', 'JPY'];

export function asMinorUnits(amount: number): MinorUnits {
  if (!Number.isSafeInteger(amount)) {
    throw new RangeError(`Amount must be a safe integer in minor units, received: ${amount}`);
  }
  return amount as MinorUnits;
}

export function asScaledFxRate(scaled: number): ScaledFxRate {
  if (!Number.isSafeInteger(scaled) || scaled <= 0) {
    throw new RangeError(`Scaled FX rate must be a positive safe integer, received: ${scaled}`);
  }
  return scaled as ScaledFxRate;
}
