import {
  DomainError, err, ok,
  type AccountId, type CurrencyCode, type FxQuote, type JournalEntry,
  type MinorUnits, type NettingBatch, type PaymentInstruction, type PvpFxSettlement,
  type Result, type ScaledFxRate, type SettlementAccount,
} from '@aegisclear/core';
import type {
  ExecutePvpFxInput, IClearingEngineClient, OpenAccountInput, SubmitPaymentInput,
} from '@aegisclear/ports';

export interface HttpResponse<T = unknown> {
  readonly status: number;
  readonly body: T;
}

export interface HttpTransport {
  request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<HttpResponse<T>>;
}

interface ErrorEnvelope {
  readonly error?: { readonly code?: DomainError['code']; readonly message?: string };
}

function toResult<T>(res: HttpResponse<T | ErrorEnvelope>): Result<T> {
  if (res.status >= 200 && res.status < 300) return ok(res.body as T);
  const env = res.body as ErrorEnvelope;
  return err(new DomainError(env.error?.code ?? 'VALIDATION_ERROR', env.error?.message ?? 'Clearing API error.'));
}

export class ClearingHttpClient implements IClearingEngineClient {
  public constructor(private readonly transport: HttpTransport) {}

  public async openAccount(input: OpenAccountInput): Promise<Result<SettlementAccount>> {
    return toResult(await this.transport.request('POST', '/api/v1/accounts', input));
  }

  public async listAccounts(): Promise<readonly SettlementAccount[]> {
    const res = await this.transport.request<{ accounts: readonly SettlementAccount[] }>('GET', '/api/v1/accounts');
    return res.status === 200 ? res.body.accounts : [];
  }

  public async fundAccount(accountId: AccountId, amountMinor: MinorUnits, memo: string): Promise<Result<SettlementAccount>> {
    return toResult(await this.transport.request('POST', `/api/v1/accounts/${accountId}/fund`, { amountMinor, memo }));
  }

  public async submitPayment(input: SubmitPaymentInput): Promise<Result<PaymentInstruction>> {
    return toResult(await this.transport.request('POST', '/api/v1/payments', input));
  }

  public async runMultilateralNetting(currency: CurrencyCode): Promise<Result<NettingBatch>> {
    return toResult(await this.transport.request('POST', `/api/v1/netting/${currency}`, {}));
  }

  public async createFxQuote(baseCurrency: CurrencyCode, quoteCurrency: CurrencyCode, scaledRate: ScaledFxRate, ttlSeconds: number): Promise<Result<FxQuote>> {
    return toResult(await this.transport.request('POST', '/api/v1/fx/quotes', { baseCurrency, quoteCurrency, scaledRate, ttlSeconds }));
  }

  public async executePvpFxSettlement(input: ExecutePvpFxInput): Promise<Result<PvpFxSettlement>> {
    return toResult(await this.transport.request('POST', '/api/v1/fx/pvp-settle', input));
  }

  public async verifyLedgerIntegrity(): Promise<{ readonly valid: boolean; readonly entryCount: number; readonly brokenEntryId?: string }> {
    const res = await this.transport.request<{ valid: boolean; entryCount: number; brokenEntryId?: string }>('GET', '/api/v1/ledger/verify');
    return res.body;
  }

  public async listJournalEntries(currency?: CurrencyCode): Promise<readonly JournalEntry[]> {
    const query = currency ? `?currency=${currency}` : '';
    const res = await this.transport.request<{ entries: readonly JournalEntry[] }>('GET', `/api/v1/ledger/entries${query}`);
    return res.status === 200 ? res.body.entries : [];
  }
}
