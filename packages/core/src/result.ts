export type Result<T, E extends DomainError = DomainError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E extends DomainError>(error: E): Result<never, E> => ({ ok: false, error });

export type DomainErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'CONFLICT'
  | 'INSUFFICIENT_LIQUIDITY'
  | 'RISK_LIMIT_EXCEEDED'
  | 'QUOTE_EXPIRED'
  | 'UNBALANCED_JOURNAL'
  | 'OFFLINE_NETWORK_BLOCKED';

export class DomainError extends Error {
  public constructor(
    public readonly code: DomainErrorCode,
    message: string,
    public readonly metadata?: Readonly<Record<string, unknown>>
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
