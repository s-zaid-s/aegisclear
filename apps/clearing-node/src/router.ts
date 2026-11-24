import type {
  AccountId, CurrencyCode, DomainError, MinorUnits, Result, ScaledFxRate,
} from '@aegisclear/core';
import type {
  ExecutePvpFxInput, IClearingEngineClient, OpenAccountInput, SubmitPaymentInput,
} from '@aegisclear/ports';

export interface ApiRequest {
  readonly method: string;
  readonly url: string;
  readonly body?: unknown;
}

export interface ApiResponse {
  readonly status: number;
  readonly body: unknown;
}

function statusForError(error: DomainError): number {
  switch (error.code) {
    case 'VALIDATION_ERROR':
    case 'QUOTE_EXPIRED': return 400;
    case 'UNAUTHORIZED': return 401;
    case 'NOT_FOUND': return 404;
    case 'CONFLICT': return 409;
    case 'INSUFFICIENT_LIQUIDITY':
    case 'RISK_LIMIT_EXCEEDED': return 422;
    default: return 500;
  }
}

function respond<T>(result: Result<T>, okStatus = 200): ApiResponse {
  if (result.ok) return { status: okStatus, body: result.value };
  return {
    status: statusForError(result.error),
    body: { error: { code: result.error.code, message: result.error.message } },
  };
}

/** Pure in-process HTTP router: testable 100% offline with zero network sockets. */
export function createClearingRouter(client: IClearingEngineClient) {
  return async function handle(req: ApiRequest): Promise<ApiResponse> {
    const parsed = new URL(req.url, 'http://localhost');
    const path = parsed.pathname;

    if (req.method === 'GET' && path === '/api/v1/health') {
      return { status: 200, body: { status: 'ok', service: 'aegisclear-node' } };
    }

    if (req.method === 'POST' && path === '/api/v1/accounts') {
      return respond(await client.openAccount(req.body as OpenAccountInput), 201);
    }

    if (req.method === 'GET' && path === '/api/v1/accounts') {
      return { status: 200, body: { accounts: await client.listAccounts() } };
    }

    const fundMatch = path.match(/^\/api\/v1\/accounts\/([^/]+)\/fund$/);
    if (req.method === 'POST' && fundMatch) {
      const b = req.body as { amountMinor: MinorUnits; memo: string };
      return respond(await client.fundAccount(fundMatch[1] as AccountId, b.amountMinor, b.memo));
    }

    if (req.method === 'POST' && path === '/api/v1/payments') {
      return respond(await client.submitPayment(req.body as SubmitPaymentInput), 201);
    }

    const nettingMatch = path.match(/^\/api\/v1\/netting\/([^/]+)$/);
    if (req.method === 'POST' && nettingMatch) {
      return respond(await client.runMultilateralNetting(nettingMatch[1] as CurrencyCode));
    }

    if (req.method === 'POST' && path === '/api/v1/fx/quotes') {
      const b = req.body as { baseCurrency: CurrencyCode; quoteCurrency: CurrencyCode; scaledRate: ScaledFxRate; ttlSeconds: number };
      return respond(await client.createFxQuote(b.baseCurrency, b.quoteCurrency, b.scaledRate, b.ttlSeconds), 201);
    }

    if (req.method === 'POST' && path === '/api/v1/fx/pvp-settle') {
      return respond(await client.executePvpFxSettlement(req.body as ExecutePvpFxInput));
    }

    if (req.method === 'GET' && path === '/api/v1/ledger/verify') {
      return { status: 200, body: await client.verifyLedgerIntegrity() };
    }

    if (req.method === 'GET' && path === '/api/v1/ledger/entries') {
      const currency = (parsed.searchParams.get('currency') ?? undefined) as CurrencyCode | undefined;
      return { status: 200, body: { entries: await client.listJournalEntries(currency) } };
    }

    return { status: 404, body: { error: { code: 'NOT_FOUND', message: 'Route not found.' } } };
  };
}
