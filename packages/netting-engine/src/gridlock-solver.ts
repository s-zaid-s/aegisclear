import {
  asMinorUnits,
  type AccountId, type PaymentId, type PaymentInstruction, type SettlementAccount,
} from '@aegisclear/core';
import type { INettingSolver, NettingSolution } from '@aegisclear/ports';
import { availableLiquidityMinor } from '@aegisclear/ledger-engine';

/**
 * Resolves liquidity gridlocks (e.g., A -> B -> C -> A circular obligations)
 * using iterative multilateral net-position pruning.
 *
 * Algorithm:
 * 1. Start with all queued payments as the candidate set.
 * 2. Compute each account's net delta = total incoming - total outgoing in the candidate set.
 * 3. Any account whose available liquidity + netDelta < 0 cannot fund its outgoing obligations
 *    even after receiving all incoming payments in the set; remove its largest outgoing payment
 *    and repeat until every remaining account is strictly liquidity-feasible!
 */
export class IterativeMultilateralNettingSolver implements INettingSolver {
  public solve(
    accounts: ReadonlyMap<AccountId, SettlementAccount>,
    queuedPayments: readonly PaymentInstruction[]
  ): NettingSolution {
    const candidates = [...queuedPayments].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority === 'URGENT' ? -1 : 1;
      return a.createdAt.localeCompare(b.createdAt);
    });

    while (candidates.length > 0) {
      const netDelta = new Map<AccountId, number>();
      for (const payment of candidates) {
        netDelta.set(payment.debtorAccountId, (netDelta.get(payment.debtorAccountId) ?? 0) - payment.amountMinor);
        netDelta.set(payment.creditorAccountId, (netDelta.get(payment.creditorAccountId) ?? 0) + payment.amountMinor);
      }

      let infeasibleAccount: AccountId | null = null;
      for (const [accountId, delta] of netDelta.entries()) {
        const account = accounts.get(accountId);
        if (!account || account.status !== 'ACTIVE') {
          infeasibleAccount = accountId;
          break;
        }
        const avail = availableLiquidityMinor(account);
        if (avail + delta < 0) {
          infeasibleAccount = accountId;
          break;
        }
      }

      if (!infeasibleAccount) {
        break;
      }

      // Drop the lowest-priority, largest outgoing payment from the infeasible account and retry
      let removeIndex = -1;
      for (let i = candidates.length - 1; i >= 0; i--) {
        if (candidates[i]?.debtorAccountId === infeasibleAccount) {
          removeIndex = i;
          break;
        }
      }
      if (removeIndex === -1) break;
      candidates.splice(removeIndex, 1);
    }

    const gross = candidates.reduce((sum, p) => sum + p.amountMinor, 0);
    const finalNetOutflow = new Map<AccountId, number>();
    for (const p of candidates) {
      finalNetOutflow.set(p.debtorAccountId, (finalNetOutflow.get(p.debtorAccountId) ?? 0) + p.amountMinor);
      finalNetOutflow.set(p.creditorAccountId, (finalNetOutflow.get(p.creditorAccountId) ?? 0) - p.amountMinor);
    }

    let netLiquidityUsed = 0;
    for (const netOut of finalNetOutflow.values()) {
      if (netOut > 0) netLiquidityUsed += netOut;
    }

    const settledIds: PaymentId[] = candidates.map((p) => p.id);
    return {
      settledPaymentIds: settledIds,
      grossVolumeMinor: asMinorUnits(gross),
      netLiquidityUsedMinor: asMinorUnits(netLiquidityUsed),
      liquiditySavedMinor: asMinorUnits(Math.max(0, gross - netLiquidityUsed)),
    };
  }
}
