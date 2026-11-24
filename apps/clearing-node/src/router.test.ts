import { describe, expect, it } from 'vitest';
import {
  asMinorUnits, asScaledFxRate,
  type IdempotencyKey, type InstitutionId,
} from '@aegisclear/core';
import { ClearingHttpClient, createOfflineClearingClient, type HttpResponse } from '@aegisclear/client';
import { ManualClock, OfflineNetworkGuard } from '@aegisclear/storage-offline';
import { createClearingRouter } from './router.js';

describe('AegisClear Full-Stack Backend Offline Suite (HTTP Client -> Clearing Router)', () => {
  it('executes RTGS, gridlock multilateral netting, atomic PvP FX settlement, and hash-chain verification offline', async () => {
    const guard = new OfflineNetworkGuard();
    guard.install();
    try {
      const clock = new ManualClock('2026-11-24T10:00:00.000Z');
      const router = createClearingRouter(createOfflineClearingClient({ clock }));
      const client = new ClearingHttpClient({
        request: async <T>(method: 'GET' | 'POST', path: string, body?: unknown) =>
          (await router({ method, url: path, body })) as HttpResponse<T>,
      });

      // Open 3 GBP accounts with £100 each (10,000p) and 2 EUR accounts
      const aGbp = await client.openAccount({ institutionId: 'bank_a' as InstitutionId, institutionName: 'Albion Bank', currency: 'GBP', initialFundingMinor: asMinorUnits(10_000), intradayCreditLimitMinor: asMinorUnits(0) });
      const bGbp = await client.openAccount({ institutionId: 'bank_b' as InstitutionId, institutionName: 'Britannia Clearing', currency: 'GBP', initialFundingMinor: asMinorUnits(10_000), intradayCreditLimitMinor: asMinorUnits(0) });
      const cGbp = await client.openAccount({ institutionId: 'bank_c' as InstitutionId, institutionName: 'Caledonia Trust', currency: 'GBP', initialFundingMinor: asMinorUnits(10_000), intradayCreditLimitMinor: asMinorUnits(0) });
      const aEur = await client.openAccount({ institutionId: 'bank_a' as InstitutionId, institutionName: 'Albion Bank', currency: 'EUR', initialFundingMinor: asMinorUnits(0), intradayCreditLimitMinor: asMinorUnits(0) });
      const bEur = await client.openAccount({ institutionId: 'bank_b' as InstitutionId, institutionName: 'Britannia Clearing', currency: 'EUR', initialFundingMinor: asMinorUnits(50_000), intradayCreditLimitMinor: asMinorUnits(0) });

      expect(aGbp.ok && bGbp.ok && cGbp.ok && aEur.ok && bEur.ok).toBe(true);
      if (!aGbp.ok || !bGbp.ok || !cGbp.ok || !aEur.ok || !bEur.ok) return;

      // Queue £1,000 circular gridlock (A -> B -> C -> A)
      const p1 = await client.submitPayment({ idempotencyKey: 'k1' as IdempotencyKey, debtorAccountId: aGbp.value.id, creditorAccountId: bGbp.value.id, currency: 'GBP', amountMinor: asMinorUnits(100_000) });
      const p2 = await client.submitPayment({ idempotencyKey: 'k2' as IdempotencyKey, debtorAccountId: bGbp.value.id, creditorAccountId: cGbp.value.id, currency: 'GBP', amountMinor: asMinorUnits(100_000) });
      const p3 = await client.submitPayment({ idempotencyKey: 'k3' as IdempotencyKey, debtorAccountId: cGbp.value.id, creditorAccountId: aGbp.value.id, currency: 'GBP', amountMinor: asMinorUnits(100_000) });
      expect(p1.ok && p1.value.status === 'QUEUED_LIQUIDITY').toBe(true);
      expect(p2.ok && p3.ok).toBe(true);

      // Run multilateral netting solver -> resolves all £3,000 of payments using £0 net liquidity!
      const batch = await client.runMultilateralNetting('GBP');
      expect(batch.ok).toBe(true);
      if (batch.ok) {
        expect(batch.value.settledPaymentIds).toHaveLength(3);
        expect(batch.value.liquiditySavedMinor).toBe(300_000);
      }

      // Execute atomic PvP FX Swap: Albion sells £50 (5,000p) for €60 (6,000c at 1.200000)
      const quote = await client.createFxQuote('GBP', 'EUR', asScaledFxRate(1_200_000), 60);
      expect(quote.ok).toBe(true);
      if (!quote.ok) return;

      const swap = await client.executePvpFxSettlement({
        quoteId: quote.value.id,
        partyASellAccountId: aGbp.value.id,
        partyABuyAccountId: aEur.value.id,
        partyBSellAccountId: bEur.value.id,
        partyBBuyAccountId: bGbp.value.id,
        baseAmountMinor: asMinorUnits(5_000),
      });
      expect(swap.ok).toBe(true);
      if (swap.ok) expect(swap.value.quoteAmountMinor).toBe(6_000);

      // Verify cryptographic ledger hash chain
      const audit = await client.verifyLedgerIntegrity();
      expect(audit.valid).toBe(true);
      expect(audit.entryCount).toBe(5);
    } finally {
      guard.uninstall();
    }
  });
});
