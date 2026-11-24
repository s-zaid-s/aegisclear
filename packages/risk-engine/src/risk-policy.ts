import {
  DomainError, err, ok,
  type MinorUnits, type Result, type SettlementAccount,
} from '@aegisclear/core';
import type { IRiskPolicy } from '@aegisclear/ports';

export class StandardClearingRiskPolicy implements IRiskPolicy {
  public constructor(private readonly maxSinglePaymentMinor: MinorUnits) {}

  public evaluatePayment(
    debtor: SettlementAccount,
    creditor: SettlementAccount,
    amountMinor: MinorUnits
  ): Result<void> {
    if (debtor.id === creditor.id) {
      return err(new DomainError('VALIDATION_ERROR', 'Debtor and creditor accounts must be distinct.'));
    }
    if (debtor.status !== 'ACTIVE' || creditor.status !== 'ACTIVE') {
      return err(new DomainError('UNAUTHORIZED', 'Both settlement accounts must be ACTIVE.'));
    }
    if (debtor.currency !== creditor.currency) {
      return err(new DomainError('VALIDATION_ERROR', 'Same-currency payment accounts must match currency.'));
    }
    if (amountMinor <= 0) {
      return err(new DomainError('VALIDATION_ERROR', 'Payment amount must be strictly positive.'));
    }
    if (amountMinor > this.maxSinglePaymentMinor) {
      return err(
        new DomainError(
          'RISK_LIMIT_EXCEEDED',
          `Payment ${amountMinor} exceeds single-instruction risk cap ${this.maxSinglePaymentMinor}.`
        )
      );
    }
    return ok(undefined);
  }
}
