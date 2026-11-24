# AegisClear — Backend Implementation Roadmap (100 Tickets)

> **Estimated Effort:** 3–4 hours per ticket for an AI programmer (including implementation, strict TypeScript types, automated tests, and documentation).
> **Design Standards:** Pure backend TypeScript monorepo, Hexagonal Architecture (Ports & Adapters), strict SOLID principles, and **100% testable offline**.

## Phase Overview

| Phase | Tickets | Focus Area |
| :--- | :--- | :--- |
| Phase 1 | T001 – T008 | Monorepo Foundation, Build Graph & Deterministic Harness |
| Phase 2 | T009 – T018 | Double-Entry Ledger, Chart of Accounts & Audit Proofs |
| Phase 3 | T019 – T028 | RTGS Queue Management & Multilateral Netting Algorithms |
| Phase 4 | T029 – T038 | Cross-Currency FX & Atomic PvP Settlement |
| Phase 5 | T039 – T048 | Risk Management, Collateral & Compliance Engine |
| Phase 6 | T049 – T060 | Distributed Consensus, Partitioning & Event Streaming |
| Phase 7 | T061 – T080 | Production Storage Adapters, Chaos Scenarios & Telemetry |
| Phase 8 | T081 – T100 | Settlement Operations, Treasury Automation & Release Hardening |

---

## Phase 1: Monorepo Foundation, Build Graph & Deterministic Harness

### Ticket T001

1. **Title:** T001 — Harden TypeScript Project References and Circular Dependency Checks
2. **Description:** Configure all 11 workspace manifests and composite TypeScript project references so `tsc -b` compiles cleanly, and add a dependency graph script blocking circular imports.
3. **Acceptance criteria:**
   - Every package declares explicit ESM `exports` and `.d.ts` paths.
   - `npm run typecheck` and `npm run build` succeed with zero diagnostics.
   - Dependency check script fails immediately if any circular workspace import is introduced.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please tidy up every workspace package.json and tsconfig.json so `tsc -b` builds all 11 packages cleanly in order, and add a small Node script that fails if anyone introduces a circular dependency between packages."
5. **Tests to run to prove completion:**
   - Run `npm run typecheck && npm run build` with exit code 0.
   - Run `node scripts/check-dep-graph.mjs` and confirm 0 circular dependencies.

---

### Ticket T002

1. **Title:** T002 — Enforce SOLID Architectural Boundaries with ESLint
2. **Description:** Add a monorepo ESLint flat config enforcing strict TypeScript rules and module import boundaries so pure engines never import storage or HTTP layers.
3. **Acceptance criteria:**
   - `@aegisclear/core` is blocked from importing any other workspace.
   - `@aegisclear/ledger-engine`, `netting-engine`, `fx-engine`, and `risk-engine` cannot import `storage-offline` or `apps/*`.
   - `npm run lint` passes completely offline.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please configure ESLint across the monorepo with strict TypeScript rules and module import boundary checks matching docs/ARCHITECTURE.md."
5. **Tests to run to prove completion:**
   - Run `npm run lint` and confirm exit code 0.

---

### Ticket T003

1. **Title:** T003 — Expand Offline Network Guard Across All Runtime Network Primitives
2. **Description:** Upgrade `OfflineNetworkGuard` to intercept `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, and `navigator.sendBeacon`, and wire it into Vitest globally.
3. **Acceptance criteria:**
   - All five network APIs throw `OFFLINE_NETWORK_BLOCKED` when active.
   - `uninstall()` restores original globals cleanly.
   - Vitest setup file activates the guard automatically for all offline test runs.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please expand OfflineNetworkGuard in @aegisclear/storage-offline to block fetch, XMLHttpRequest, WebSocket, EventSource, and sendBeacon when installed, and attach it to Vitest via a setup file."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/storage-offline/src/network-guard.test.ts` verifying all 5 primitives are blocked.

---

### Ticket T004

1. **Title:** T004 — Create `@aegisclear/test-fixtures` with Multi-Bank Clearing Scenarios
2. **Description:** Build a shared fixtures workspace with repeatable UK/EU/US clearing member setups, multi-currency liquidity pools, and gridlock test graphs.
3. **Acceptance criteria:**
   - Includes deterministic ID generator and seeded clearing house builders.
   - Seeds 4-currency accounts (`GBP`, `EUR`, `USD`, `JPY`) cleanly.
   - Zero external runtime dependencies.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please create @aegisclear/test-fixtures with deterministic multi-bank, multi-currency clearing house seeders for unit and chaos tests."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/test-fixtures` and confirm identical snapshots across repeated runs.

---

### Ticket T005

1. **Title:** T005 — Add Pure Financial Value Objects and Safe Integer Math Utilities
2. **Description:** Add checked `addMinorUnits`, `subtractMinorUnits`, `allocateProRata` (remainder-safe penny splitting), and currency formatting helpers in `@aegisclear/core`.
3. **Acceptance criteria:**
   - Overflow and unsafe integer checks throw `RangeError` immediately.
   - `allocateProRata` distributes leftover minor units deterministically without losing a single penny.
   - 100% branch coverage on all arithmetic helpers.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add overflow-safe integer money math helpers and a pro-rata fee splitter in @aegisclear/core so no penny is ever lost to rounding."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/core/src/money-math.test.ts`.

---

### Ticket T006

1. **Title:** T006 — Build Write-Ahead File-Backed Local Storage Adapter (Node FS)
2. **Description:** Create a file-backed `IUnitOfWork` and `IRepositoryRegistry` adapter using append-only newline-delimited JSON write-ahead logs (WAL) so local clearing nodes survive process restarts offline.
3. **Acceptance criteria:**
   - Appends atomic WAL frames before acknowledging transactions.
   - Replays WAL cleanly on startup to reconstruct exact account and ledger state.
   - Passes shared repository contract tests identically to `InMemoryClearingStore`.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build a local file-backed WAL storage adapter in @aegisclear/storage-offline that replays transactions cleanly after a process restart and passes the same contract tests as InMemoryClearingStore."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/storage-offline/src/wal-store.test.ts` testing crash-restart recovery.

---

### Ticket T007

1. **Title:** T007 — Implement Periodic State Snapshotting and WAL Compaction
2. **Description:** Add checkpoint snapshotting to the local WAL store so long-running simulations can truncate old WAL segments while keeping full hash-chain auditability.
3. **Acceptance criteria:**
   - Writes checksummed snapshot checkpoints at configurable event intervals.
   - Recovery loads latest snapshot plus trailing WAL entries cleanly.
   - Checksum mismatch on corrupted snapshot fails safely.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add checksummed state snapshotting and WAL compaction to the local storage adapter in @aegisclear/storage-offline."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/storage-offline/src/compaction.test.ts`.

---

### Ticket T008

1. **Title:** T008 — Build Portable Clearing State Export and Import Bundle
2. **Description:** Create a `ClearingSnapshotService` that exports all accounts, ledger journals, queued payments, batches, and FX quotes into a single SHA-256 verified JSON bundle for offline debugging.
3. **Acceptance criteria:**
   - Exports canonical JSON with top-level SHA-256 digest.
   - Import validates schema and digest before replacing local state atomically.
   - Corrupted files are rejected without affecting existing data.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build ClearingSnapshotService to export and import complete clearing house snapshots with SHA-256 integrity verification."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/snapshot.test.ts`.

---

## Phase 2: Double-Entry Ledger, Chart of Accounts & Audit Proofs

### Ticket T009

1. **Title:** T009 — Add Multi-Leg Split Journal Postings (Fees, Levies & Tax Splits)
2. **Description:** Extend `buildBalancedJournalEntry` to support 3+ posting legs (e.g., principal transfer plus clearing fee credit) while strictly enforcing zero-sum per currency.
3. **Acceptance criteria:**
   - Supports arbitrary N-leg postings in a single journal entry.
   - Rejects mixed-currency postings inside a single single-currency journal.
   - Enforces `sum(DEBIT) === sum(CREDIT)` strictly.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please extend @aegisclear/ledger-engine to support multi-leg split postings (such as principal plus clearing fee) while enforcing zero-sum invariants."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/ledger-engine/src/multi-leg.test.ts`.

---

### Ticket T010

1. **Title:** T010 — Build Per-Account Running Balance Statement Projection
2. **Description:** Create a pure ledger statement projector that reconstructs chronological account movements with running balances and opening/closing reconciliations.
3. **Acceptance criteria:**
   - Computes exact running balance after every debit and credit posting.
   - Closing statement balance matches `account.balanceMinor` 100% of the time.
   - Supports date-range filtering.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build a pure account statement projector in @aegisclear/ledger-engine that calculates running balances and verifies reconciliation against account balances."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/ledger-engine/src/statements.test.ts`.

---

### Ticket T011

1. **Title:** T011 — Implement Merkle-Tree Batch Audit Proofs for Settled Journals
2. **Description:** Build a pure Merkle-tree generator and inclusion-proof verifier in `@aegisclear/ledger-engine` so any clearing member can cryptographically verify a journal entry was included in a settlement batch.
3. **Acceptance criteria:**
   - Computes deterministic Merkle roots over settled journal entry hashes.
   - Generates compact sibling proof paths per entry.
   - `verifyMerkleInclusion(entryHash, proof, root)` detects any bit-flip.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add a pure Merkle-tree audit proof generator and inclusion verifier inside @aegisclear/ledger-engine."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/ledger-engine/src/merkle-proof.test.ts`.

---

### Ticket T012

1. **Title:** T012 — Add Reversal & Compensating Journal Entries (Immutable Corrections)
2. **Description:** Enforce strict ledger immutability by implementing `createReversalJournal(originalEntry, reason)` that generates exact inverse postings linked to `originalEntryId`.
3. **Acceptance criteria:**
   - Never mutates or deletes existing journal entries.
   - Prevents reversing the same journal entry twice.
   - Maintains unbroken hash-chain linkage.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add immutable reversal journal generation in @aegisclear/ledger-engine and @aegisclear/clearing-services, blocking duplicate reversals."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/reversals.test.ts`.

---

### Ticket T013

1. **Title:** T013 — Build System-Wide Trial Balance & Conservation-of-Cash Auditor
2. **Description:** Create an automated reconciliation service that verifies across every currency that total member balances plus treasury/fee accounts equal zero net unbacked money.
3. **Acceptance criteria:**
   - Verifies every currency independently (`GBP`, `EUR`, `USD`, `JPY`).
   - Detects any discrepancy down to 1 minor unit.
   - Runs in O(Accounts + Journals) time.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build a system-wide TrialBalanceAuditor in @aegisclear/ledger-engine that proves total debits equal total credits across every currency."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/ledger-engine/src/trial-balance.test.ts`.

---

### Ticket T014

1. **Title:** T014 — Add Account Lifecycle Controls (Freeze, Unfreeze, Intraday Credit Adjustments & Close)
2. **Description:** Extend `AccountService` to freeze/unfreeze accounts under investigation, adjust approved intraday credit limits, and close accounts only when balance and reserved funds are zero.
3. **Acceptance criteria:**
   - Blocks closing accounts with non-zero balance, active reserves, or queued payments.
   - Freezing immediately prevents new outgoing settlements while preserving audit history.
   - Emits domain events for every status or credit-limit change.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please expand AccountService with account freeze/unfreeze, intraday credit limit updates, and zero-balance closure checks."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/account-lifecycle.test.ts`.

---

### Ticket T015

1. **Title:** T015 — Add Liquidity Reservation Holds and Expiry Release
2. **Description:** Implement explicit `reservedMinor` holds on settlement accounts for pending instructions, ensuring `availableLiquidityMinor` never double-counts reserved cash.
3. **Acceptance criteria:**
   - Reserving funds increases `reservedMinor` and reduces `availableLiquidityMinor`.
   - Releasing or settling decrements `reservedMinor` accurately.
   - Prevents `reservedMinor` from ever exceeding `balanceMinor + intradayCreditLimitMinor`.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add explicit liquidity reservation holds and release logic in AccountService and PaymentSettlementService."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/liquidity-reserves.test.ts`.

---

### Ticket T016

1. **Title:** T016 — Build Tiered Clearing Fee Engine (Volume Discounts & Fee Split Postings)
2. **Description:** Create a pluggable `IFeeSchedule` strategy that calculates basis-point or flat minor-unit clearing fees and posts them automatically to a clearing house fee revenue account.
3. **Acceptance criteria:**
   - Supports flat fees, basis-point fees, and monthly volume tiers.
   - Posts fee leg inside the exact same balanced journal entry as the principal transfer.
   - Zero fee leakage or rounding drift.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build a pluggable IFeeSchedule strategy in @aegisclear/clearing-services that computes clearing fees and posts them inside the same atomic journal entry."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/fee-schedule.test.ts`.

---

### Ticket T017

1. **Title:** T017 — Add Out-of-Order Event Replay & Projection Rebuilder
2. **Description:** Build a `ProjectionRebuilder` that wipes read-model account balances and reconstructs them purely from the append-only `JournalEntry` stream to prove event-sourced determinism.
3. **Acceptance criteria:**
   - Reconstructed account balances match live balances 100% identically.
   - Detects any missing or corrupted journal sequence.
   - Runs completely offline.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build a ProjectionRebuilder in @aegisclear/clearing-services that reconstructs all account balances purely from stored journal entries."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/projection-rebuild.test.ts`.

---

### Ticket T018

1. **Title:** T018 — Add Multi-Institution Sub-Account Hierarchy ( Nostro / Vostro & Client Segregation )
2. **Description:** Allow an `InstitutionId` to operate segregated `HOUSE` and `CLIENT_SEGREGATED` settlement accounts per currency, preventing client funds from covering house obligations.
3. **Acceptance criteria:**
   - Enforces strict segregation rules between `HOUSE` and `CLIENT_SEGREGATED` accounts.
   - Rejects cross-pool co-mingling transfers unless explicitly authorised.
   - Supports institutional consolidated exposure queries.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add HOUSE vs CLIENT_SEGREGATED account types to @aegisclear/core and @aegisclear/risk-engine to prevent illegal co-mingling of funds."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/risk-engine/src/segregation.test.ts`.

---

## Phase 3: RTGS Queue Management & Multilateral Netting Algorithms

### Ticket T019

1. **Title:** T019 — Implement Priority Queue Ordering, Re-Prioritisation & Queue Cancellation
2. **Description:** Enhance the liquidity queue so institutions can promote a queued payment from `NORMAL` to `URGENT`, reorder within priority tiers, or cancel un-settled queued payments cleanly.
3. **Acceptance criteria:**
   - Cancelling a `QUEUED_LIQUIDITY` payment marks it `CANCELLED` and releases any hold.
   - Already `SETTLED` payments cannot be cancelled (`CONFLICT`).
   - `URGENT` instructions always evaluate ahead of `NORMAL` instructions.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add queue re-prioritisation and safe cancellation of un-settled queued payments in PaymentSettlementService."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/queue-management.test.ts`.

---

### Ticket T020

1. **Title:** T020 — Build Bilateral Offset Netting Solver (Fast Two-Party Pre-Pass)
2. **Description:** Implement a fast `BilateralNettingSolver` in `@aegisclear/netting-engine` that offsets reciprocal payments between pairs of banks (`A -> B` and `B -> A`) in O(N) time before running full multilateral graph resolution.
3. **Acceptance criteria:**
   - Offsets opposing A<->B obligations cleanly.
   - Implements `INettingSolver` interface (OCP).
   - Demonstrates measurable speedup on dense bilateral traffic.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build BilateralNettingSolver implementing INettingSolver in @aegisclear/netting-engine as a fast O(N) two-party offset solver."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/netting-engine/src/bilateral-solver.test.ts`.

---

### Ticket T021

1. **Title:** T021 — Build Strongly Connected Components (Tarjan) Cycle-Finding Netting Solver
2. **Description:** Create a graph-theoretic `TarjanCycleNettingSolver` in `@aegisclear/netting-engine` that isolates strongly connected obligation loops so deadlocked rings settle even when unrelated banks in the queue are illiquid.
3. **Acceptance criteria:**
   - Uses Tarjan's SCC algorithm to isolate closed liquidity loops.
   - Settles feasible cycles without being blocked by non-cycle illiquid accounts.
   - Verified on complex 10-bank multi-ring graphs.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build TarjanCycleNettingSolver in @aegisclear/netting-engine using strongly connected components to isolate and settle circular payment rings."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/netting-engine/src/tarjan-solver.test.ts`.

---

### Ticket T022

1. **Title:** T022 — Build Composite Hybrid Netting Pipeline (Bilateral -> Tarjan -> Iterative)
2. **Description:** Compose the bilateral, Tarjan cycle, and iterative pruning solvers into a configurable `HybridNettingSolver` strategy that maximises settled volume while respecting `URGENT` payment priorities.
3. **Acceptance criteria:**
   - Implements `INettingSolver` cleanly.
   - Reports per-stage liquidity savings telemetry.
   - Outperforms single-pass solvers on mixed gridlock workloads.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build HybridNettingSolver in @aegisclear/netting-engine chaining bilateral offset, Tarjan cycle resolution, and iterative pruning."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/netting-engine/src/hybrid-solver.test.ts`.

---

### Ticket T023

1. **Title:** T023 — Add Automatic Queue Drain Trigger on Incoming Liquidity
2. **Description:** When Bank A receives an incoming RTGS payment or top-up, automatically check whether Bank A's queued outgoing payments can now settle immediately in priority order.
3. **Acceptance criteria:**
   - Triggered automatically after `fundAccount` or incoming RTGS credit.
   - Settles newly affordable queued payments atomically inside the transaction.
   - Prevents payments from sitting stuck in queue when cash arrives.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add automatic queue-drain evaluation in PaymentSettlementService whenever an account receives incoming funds."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/auto-drain.test.ts`.

---

### Ticket T024

1. **Title:** T024 — Add Payment Value-Date Scheduling & Cut-Off Window Enforcement
2. **Description:** Support future-dated payment instructions (`valueDate`) and currency cut-off times evaluated deterministically against `IClock`.
3. **Acceptance criteria:**
   - Future-dated instructions stay in `SCHEDULED` status until `clock.now() >= valueDate`.
   - Instructions arriving past currency cut-off roll cleanly to next settlement window.
   - Tested with `ManualClock`.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add future value-date scheduling and currency cut-off window handling to PaymentSettlementService using IClock."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/scheduling.test.ts`.

---

### Ticket T025

1. **Title:** T025 — Add Automatic End-of-Day Queue Expiry & Rejection Sweep
2. **Description:** Create an end-of-day sweep job that expires un-settled `QUEUED_LIQUIDITY` payments past their `expiresAt` deadline, marks them `REJECTED` with `LIQUIDITY_TIMEOUT`, and emits events.
3. **Acceptance criteria:**
   - Marks expired queued payments `REJECTED` cleanly.
   - Releases any reserved liquidity holds.
   - Idempotent when executed multiple times.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build an end-of-day queue expiry sweep in PaymentSettlementService that cleanly rejects timed-out instructions."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/queue-expiry.test.ts`.

---

### Ticket T026

1. **Title:** T026 — Add Idempotency Payload-Mismatch Conflict Detection
2. **Description:** Harden idempotency handling so retrying a request with the *same* `IdempotencyKey` and *identical* payload returns the cached result, whereas reusing the key with *different* amount/accounts returns `CONFLICT`.
3. **Acceptance criteria:**
   - Identical retry returns original `PaymentInstruction` without double-settling.
   - Mutated retry payload with same key returns `DomainError('CONFLICT')`.
   - Covers both settled and queued payments.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please harden idempotency verification in PaymentSettlementService so reusing an idempotency key with altered payment details returns CONFLICT."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/idempotency.test.ts`.

---

### Ticket T027

1. **Title:** T027 — Build Liquidity Efficiency & Gridlock Telemetry Analytics
2. **Description:** Create a read-only analytics service calculating gross settled volume, net liquidity consumed, liquidity savings ratio (`%`), and average queue wait duration per currency.
3. **Acceptance criteria:**
   - Computes exact savings percentages without floating-point errors.
   - Breaks metrics down by currency and institution.
   - Returns clean zeroed summaries when no batches have run.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build LiquidityAnalyticsService in @aegisclear/clearing-services reporting liquidity savings ratios and queue wait times."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/liquidity-analytics.test.ts`.

---

### Ticket T028

1. **Title:** T028 — Add Benchmark Suite for 5,000-Instruction Multilateral Netting
2. **Description:** Write an automated performance benchmark in `@aegisclear/netting-engine` verifying that solving a 5,000-payment, 50-bank gridlock graph completes in under 50ms.
3. **Acceptance criteria:**
   - Generates deterministic 50-bank dense payment graphs.
   - Asserts solver runtime < 50ms and 100% liquidity feasibility of output.
   - Documents complexity bounds in `docs/PERFORMANCE.md`.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add a 5,000-payment performance benchmark in @aegisclear/netting-engine confirming sub-50ms execution."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/netting-engine/src/netting-benchmark.test.ts`.

---

## Phase 4: Cross-Currency FX & Atomic PvP Settlement

### Ticket T029

1. **Title:** T029 — Add Inverse Quote Derivation and Cross-Rate Triangulation
2. **Description:** Extend `@aegisclear/fx-engine` with deterministic inverse rate calculation (`EUR/GBP` from `GBP/EUR`) and USD-pivot cross-rate triangulation using `BigInt` precision.
3. **Acceptance criteria:**
   - Computes inverse and cross rates with 6-decimal scaled integer accuracy.
   - Avoids division-by-zero and overflow edge cases.
   - Pure functions with zero side effects.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add BigInt inverse FX rate and cross-currency triangulation helpers to @aegisclear/fx-engine."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/fx-engine/src/triangulation.test.ts`.

---

### Ticket T030

1. **Title:** T030 — Add FX Spread Markup & Treasury Margin Calculation
2. **Description:** Allow liquidity providers to apply basis-point bid/ask spreads on FX quotes and record FX spread earnings cleanly into treasury fee accounts.
3. **Acceptance criteria:**
   - Computes bid/ask spread in basis points using integer arithmetic.
   - Posts spread revenue inside balanced double-entry journals.
   - Zero rounding loss.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add basis-point bid/ask spread calculation and treasury fee posting in @aegisclear/fx-engine and PvpFxSettlementService."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/fx-engine/src/spreads.test.ts`.

---

### Ticket T031

1. **Title:** T031 — Implement Single-Use Quote Consumption & Replay Protection
2. **Description:** Prevent double-spending an `FxQuote` by marking quotes `CONSUMED` inside the atomic PvP transaction so a second swap referencing the same quote fails with `CONFLICT`.
3. **Acceptance criteria:**
   - First PvP swap consumes the quote atomically.
   - Second attempt with the same `quoteId` fails with `CONFLICT`.
   - Failed swap (due to insufficient liquidity) rolls back so the quote remains usable until expiry.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please enforce single-use FX quote consumption inside PvpFxSettlementService with atomic rollback if either leg fails."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/pvp-quote-consumption.test.ts`.

---

### Ticket T032

1. **Title:** T032 — Build Multi-Party 3-Way Cross-Currency Ring PvP Settlement
2. **Description:** Support 3-institution currency rings (`A sells GBP -> B sells EUR -> C sells USD -> A`) settled atomically in a single all-or-nothing transaction.
3. **Acceptance criteria:**
   - Verifies all 3 currency legs and 6 accounts atomically.
   - If any single leg lacks liquidity, all 3 legs roll back completely.
   - Records 3 balanced, hash-linked journal entries.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add atomic 3-way cross-currency ring PvP settlement to PvpFxSettlementService."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/pvp-ring.test.ts`.

---

### Ticket T033

1. **Title:** T033 — Add Currency-Specific Minor Unit Exponent Handling (JPY 0-Decimal vs GBP/EUR/USD 2-Decimal)
2. **Description:** Ensure FX conversions handle `JPY` (0 decimal places) alongside `GBP`/`EUR`/`USD` (2 decimal places) accurately without off-by-100 scaling errors.
3. **Acceptance criteria:**
   - Correctly scales `GBP <-> JPY` and `USD <-> JPY` conversions.
   - Validates minimum settlement amounts per currency.
   - Covered by dedicated JPY conversion tests.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add currency exponent scaling in @aegisclear/fx-engine so 0-decimal JPY pairs convert accurately with 2-decimal GBP/EUR/USD."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/fx-engine/src/jpy-scaling.test.ts`.

---

### Ticket T034

1. **Title:** T034 — Build Automated Market Maker (AMM) Constant-Product Liquidity Pool Adapter
2. **Description:** Create an offline `OfflineFxLiquidityPool` implementing `IFxQuoteProvider` using constant-product (`x * y = k`) reserves so chaos simulations can request live deterministic FX quotes offline.
3. **Acceptance criteria:**
   - Computes deterministic quotes based on pool reserves and slippage.
   - Updates pool reserves atomically as swaps settle.
   - Runs 100% offline with zero external rate feeds.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build an offline constant-product FX liquidity pool adapter in @aegisclear/fx-engine for self-contained multi-currency simulations."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/fx-engine/src/amm-pool.test.ts`.

---

### Ticket T035

1. **Title:** T035 — Add Cross-Currency Netting Pre-Settlement Optimizer
2. **Description:** Allow two institutions with multiple pending bilateral FX swaps in opposite directions (`GBP -> EUR` and `EUR -> GBP`) to net opposing legs before PvP execution.
3. **Acceptance criteria:**
   - Reduces gross FX settlement obligations cleanly.
   - Preserves exact net economic outcome for both counterparties.
   - Records net reduction telemetry.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build a bilateral FX swap netting optimizer in @aegisclear/fx-engine."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/fx-engine/src/fx-netting.test.ts`.

---

### Ticket T036

1. **Title:** T036 — Add FX Circuit-Breaker & Stale-Rate Volatility Guard
2. **Description:** Reject FX quotes that deviate beyond a configurable percentage band from the last settled reference rate to protect participants from fat-finger or stale quotes.
3. **Acceptance criteria:**
   - Blocks quotes exceeding configurable max deviation basis points.
   - Configurable per currency pair.
   - Returns `RISK_LIMIT_EXCEEDED` with deviation details.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add an FX rate volatility circuit-breaker in @aegisclear/risk-engine to reject fat-finger quotes."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/risk-engine/src/fx-circuit-breaker.test.ts`.

---

### Ticket T037

1. **Title:** T037 — Build Multi-Currency Consolidated Exposure & Valuation Report
2. **Description:** Create a reporting service that values an institution's entire multi-currency portfolio (`GBP`, `EUR`, `USD`, `JPY`) into a single reporting currency using current reference rates.
3. **Acceptance criteria:**
   - Converts all balances and credit lines into base reporting currency.
   - Reports unencumbered liquidity and net FX exposure per currency.
   - Pure read-only query service.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build a MultiCurrencyExposureService reporting consolidated institutional positions in a chosen base currency."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/fx-exposure.test.ts`.

---

### Ticket T038

1. **Title:** T038 — Add PvP Settlement Failure Diagnostics & Rollback Verification Suite
2. **Description:** Write comprehensive fault-injection tests verifying that mid-swap database errors or expired quotes leave all 4 accounts and the ledger hash chain untouched.
3. **Acceptance criteria:**
   - Tests mid-transaction failure after leg 1 before leg 2.
   - Asserts zero partial balance changes and unbroken hash chain.
   - Verifies clear error responses.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please write a fault-injection test suite for PvpFxSettlementService proving atomic rollback on mid-swap errors."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/pvp-atomicity.test.ts`.

---

## Phase 5: Risk Management, Collateral & Compliance Engine

### Ticket T039

1. **Title:** T039 — Build Composable `CompositeRiskPolicy` Chain (OCP)
2. **Description:** Refactor `@aegisclear/risk-engine` into a composable pipeline of independent risk rules so new compliance or credit checks plug in without modifying existing rules.
3. **Acceptance criteria:**
   - Evaluates rules in order and short-circuits on the first rejection.
   - Supports adding/removing rules dynamically at composition time.
   - Implements `IRiskPolicy` cleanly.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build a composable CompositeRiskPolicy chain in @aegisclear/risk-engine following Open/Closed principles."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/risk-engine/src/composite-policy.test.ts`.

---

### Ticket T040

1. **Title:** T040 — Add Rolling Intraday Outflow Velocity Limits
2. **Description:** Implement a velocity risk rule capping total outgoing settled volume per institution over a rolling 1-hour or 24-hour window measured via `IClock`.
3. **Acceptance criteria:**
   - Sums settled outflows within trailing window accurately.
   - Rejects excess payments with `RISK_LIMIT_EXCEEDED`.
   - Automatically resets capacity as `ManualClock` advances.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add a rolling intraday outflow velocity limit rule in @aegisclear/risk-engine using IClock."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/risk-engine/src/velocity-limit.test.ts`.

---

### Ticket T041

1. **Title:** T041 — Build Collateral Haircut & Dynamic Intraday Credit Line Engine
2. **Description:** Allow institutions to pledge high-grade collateral assets (with configurable haircut percentages) to dynamically back their intraday overdraft limit.
3. **Acceptance criteria:**
   - Calculates effective credit limit = `pledgedValue * (100% - haircut%)`.
   - Prevents withdrawing collateral if doing so would breach active overdraft usage.
   - Emits collateral adjustment audit events.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build a CollateralManagementService in @aegisclear/clearing-services that dynamically computes intraday credit limits after haircuts."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/collateral.test.ts`.

---

### Ticket T042

1. **Title:** T042 — Add Counterparty Bilateral Exposure Caps
2. **Description:** Allow institutions to configure maximum net exposure limits against specific counterparties so a single bank cannot accumulate excessive bilateral risk.
3. **Acceptance criteria:**
   - Tracks net bilateral flows between institution pairs.
   - Blocks or queues payments exceeding bilateral exposure caps.
   - Configurable per counterparty pair.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add bilateral counterparty exposure cap rules in @aegisclear/risk-engine."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/risk-engine/src/bilateral-caps.test.ts`.

---

### Ticket T043

1. **Title:** T043 — Implement Sanctions & Corridor Screening Hook (`ISanctionsScreener`)
2. **Description:** Define a pluggable `ISanctionsScreener` port with an offline rule-based watchlist screener that holds suspicious instructions in `COMPLIANCE_HOLD` for manual officer review.
3. **Acceptance criteria:**
   - Runs 100% offline with deterministic watchlist fixtures.
   - Places flagged instructions into `COMPLIANCE_HOLD` without debiting funds.
   - Supports compliance officer approve/reject resolution.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add ISanctionsScreener and a compliance-hold review workflow in @aegisclear/risk-engine and @aegisclear/clearing-services."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/compliance-hold.test.ts`.

---

### Ticket T044

1. **Title:** T044 — Add Automated Liquidity Stress Alerting & Margin Call Triggers
2. **Description:** Emit structured `MarginCallTriggered` domain events whenever an institution's intraday credit utilisation exceeds 80% of its approved facility.
3. **Acceptance criteria:**
   - Triggers warning at 80% and critical margin call at 95% credit utilisation.
   - Deduplicates repeated alerts until utilisation recovers below threshold.
   - Tested via event bus subscribers.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add intraday credit utilisation monitoring and MarginCallTriggered alerts in @aegisclear/clearing-services."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/margin-alerts.test.ts`.

---

### Ticket T045

1. **Title:** T045 — Build Default Waterfall & Loss-Mutualisation Simulator
2. **Description:** Model the clearing house default waterfall (Defaulter Cash -> Defaulter Collateral -> Clearing House Skin-in-the-Game -> Surviving Member Default Fund) to resolve a simulated bank default cleanly.
3. **Acceptance criteria:**
   - Allocates losses strictly in waterfall order without creating unbacked money.
   - Produces complete loss-allocation audit breakdown.
   - Verified by conservation-of-value assertions.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build a DefaultWaterfallService in @aegisclear/clearing-services that resolves a simulated institution default across collateral and default-fund layers."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/default-waterfall.test.ts`.

---

### Ticket T046

1. **Title:** T046 — Add Role-Based Authorization Guards (Operator, Risk Officer, Auditor, Member)
2. **Description:** Enforce strict actor role permissions across all clearing operations so members can only debit their own accounts while only Risk Officers can adjust credit limits or freeze accounts.
3. **Acceptance criteria:**
   - Rejects cross-institution unauthorised payment submissions with `UNAUTHORIZED`.
   - Restricts account freezing and credit limit edits to `RISK_OFFICER`.
   - Tested across all role combinations.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add role-based authorization checks across @aegisclear/clearing-services for MEMBER, RISK_OFFICER, OPERATOR, and AUDITOR roles."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/rbac.test.ts`.

---

### Ticket T047

1. **Title:** T047 — Add End-of-Day Overdraft Interest & Fee Accrual Calculator
2. **Description:** Calculate intraday/overnight overdraft charges in minor units for institutions ending a clearing window with a negative cash balance, posting balanced interest entries.
3. **Acceptance criteria:**
   - Applies configured basis-point interest rate accurately.
   - Posts interest debit to borrower and credit to treasury cleanly.
   - Zero charges for positive balances.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build an EndOfDayInterestService calculating overdraft charges in minor units and posting balanced journal entries."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/overdraft-interest.test.ts`.

---

### Ticket T048

1. **Title:** T048 — Add Comprehensive Risk & Compliance Invariant Test Suite
2. **Description:** Author a dedicated test suite verifying every risk rule, segregation boundary, velocity cap, and default waterfall calculation under edge cases.
3. **Acceptance criteria:**
   - Covers boundary conditions (`amount === limit`, `amount === limit + 1`).
   - Verifies zero accounting drift during default waterfall execution.
   - 100% deterministic offline execution.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please write a comprehensive risk and compliance boundary test suite across @aegisclear/risk-engine."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/risk-engine`.

---

## Phase 6: Distributed Consensus, Partitioning & Event Streaming

### Ticket T049

1. **Title:** T049 — Build Currency-Sharded Partition Router for Parallel Clearing
2. **Description:** Partition clearing state by `CurrencyCode` (`GBP`, `EUR`, `USD`, `JPY`) so single-currency RTGS and multilateral netting execute independently per currency shard while PvP FX coordinates across two shards.
3. **Acceptance criteria:**
   - Routes single-currency operations directly to the target currency shard.
   - Coordinates two-phase atomic locks across two shards for PvP FX swaps.
   - Eliminates cross-currency lock contention.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build a currency-sharded PartitionRouter in @aegisclear/clearing-services so GBP, EUR, USD, and JPY settle independently with two-phase coordination for PvP FX."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/sharding.test.ts`.

---

### Ticket T050

1. **Title:** T050 — Implement Deterministic Leader Election & Replicated Log (In-Memory Raft Core)
2. **Description:** Build a pure TypeScript Raft-inspired consensus state machine (`@aegisclear/consensus`) supporting leader election, term increments, append-entries log replication, and commit-index advancement across simulated cluster nodes.
3. **Acceptance criteria:**
   - Elects a single leader per term via majority quorum.
   - Replicates journal entries across follower nodes before committing.
   - Handles split votes and leader step-down cleanly.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build a pure TypeScript Raft consensus state machine in a new @aegisclear/consensus package with leader election and log replication."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/consensus/src/raft-election.test.ts`.

---

### Ticket T051

1. **Title:** T051 — Wire Deterministic Network Partition & Packet-Drop Simulator for Consensus
2. **Description:** Connect `@aegisclear/consensus` to an in-memory simulated message bus capable of dropping, delaying, reordering, and partitioning messages between 3 or 5 virtual clearing nodes offline.
3. **Acceptance criteria:**
   - Proves minority partitions cannot commit entries.
   - Proves majority partition continues settling and heals lagging followers upon reconnect.
   - 100% deterministic via seeded PRNG.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build an offline network partition and packet-chaos simulator for @aegisclear/consensus and verify safety across 3-node and 5-node clusters."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/consensus/src/partition-chaos.test.ts`.

---

### Ticket T052

1. **Title:** T052 — Implement Two-Phase Commit (2PC) Coordinator for Cross-Shard PvP FX
2. **Description:** Build a formal `TwoPhaseCommitCoordinator` orchestrating `PREPARE` (liquidity lock) and `COMMIT`/`ABORT` phases across two currency shards for PvP FX swaps, including coordinator crash recovery.
3. **Acceptance criteria:**
   - Locks liquidity on both shards during `PREPARE` before committing either leg.
   - Aborts and releases locks cleanly if either shard votes `ABORT`.
   - Recovers in-doubt transactions cleanly after simulated coordinator restart.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please implement a TwoPhaseCommitCoordinator with crash recovery for cross-shard PvP FX settlements."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/consensus/src/two-phase-commit.test.ts`.

---

### Ticket T053

1. **Title:** T053 — Build Outbox Pattern & Guaranteed At-Least-Once Event Dispatcher
2. **Description:** Persist domain events inside the exact same `IUnitOfWork` transaction as ledger writes (`TransactionalOutbox`), publishing them reliably with monotonic sequence numbers.
3. **Acceptance criteria:**
   - Zero lost events even if downstream subscribers fail temporarily.
   - Subscribers track cursor offsets and can replay missed events from any sequence number.
   - Implemented in `storage-offline`.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please implement a TransactionalOutbox in @aegisclear/storage-offline so domain events commit atomically with ledger writes and support cursor replay."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/storage-offline/src/outbox.test.ts`.

---

### Ticket T054

1. **Title:** T054 — Build NDJSON Real-Time Settlement Event Stream Endpoint
2. **Description:** Add `/api/v1/stream/events` in `apps/clearing-node` streaming real-time settlement, netting batch, and margin-call events as newline-delimited JSON with `Last-Event-ID` resume support.
3. **Acceptance criteria:**
   - Streams events in real time with monotonic sequence IDs.
   - Supports replaying missed events from `Last-Event-ID`.
   - Testable in-process offline.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add an NDJSON event streaming endpoint with Last-Event-ID replay support to apps/clearing-node."
5. **Tests to run to prove completion:**
   - Run `npx vitest run apps/clearing-node/src/event-stream.test.ts`.

---

### Ticket T055

1. **Title:** T055 — Implement ISO 20022 `pacs.008` / `camt.053` Message Parser & Serialiser
2. **Description:** Build pure TypeScript ISO 20022 financial message mappers translating `pacs.008` customer credit transfers into `SubmitPaymentInput` and generating `camt.053` bank-to-customer settlement statements.
3. **Acceptance criteria:**
   - Parses structured ISO 20022 JSON/XML payloads with strict schema validation.
   - Generates valid `camt.053` statement payloads from ledger entries.
   - Zero external XML network DTD fetches (XXE-safe).
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build pure ISO 20022 pacs.008 parser and camt.053 statement generator mappers in @aegisclear/clearing-services."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/iso20022.test.ts`.

---

### Ticket T056

1. **Title:** T056 — Add Dead-Letter Queue (DLQ) & Poison-Message Quarantine
2. **Description:** Route malformed or repeatedly failing clearing messages into a structured `DeadLetterQueue` with full error diagnostics, retry counters, and manual operator replay.
3. **Acceptance criteria:**
   - Captures failed payloads with stack-free error metadata and timestamps.
   - Supports operator inspection and controlled replay.
   - Prevents poison messages from blocking healthy queues.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please implement a DeadLetterQueue and operator replay service in @aegisclear/clearing-services."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/dlq.test.ts`.

---

### Ticket T057

1. **Title:** T057 — Build Backpressure & Token-Bucket Ingress Throttler
2. **Description:** Protect `apps/clearing-node` from burst floods with a per-institution token-bucket rate limiter returning `429 Too Many Requests` and `Retry-After` headers.
3. **Acceptance criteria:**
   - Enforces sustained rate and burst capacity per institution.
   - Evaluated deterministically via `IClock`.
   - Returns clean `RATE_LIMITED` responses.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add a token-bucket ingress rate limiter per institution in apps/clearing-node."
5. **Tests to run to prove completion:**
   - Run `npx vitest run apps/clearing-node/src/rate-limit.test.ts`.

---

### Ticket T058

1. **Title:** T058 — Implement Cryptographic Request Signing (HMAC-SHA256) Middleware
2. **Description:** Add request authentication middleware in `apps/clearing-node` verifying institution API keys, HMAC-SHA256 payload signatures, and timestamp replay windows (`±30s`).
3. **Acceptance criteria:**
   - Rejects tampered bodies, invalid signatures, and stale timestamps with `401 Unauthorized`.
   - Uses local Web Crypto / Node `node:crypto` offline.
   - Includes matching request-signer hook in `ClearingHttpClient`.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add HMAC-SHA256 request signing middleware in apps/clearing-node and a matching signer in ClearingHttpClient."
5. **Tests to run to prove completion:**
   - Run `npx vitest run apps/clearing-node/src/hmac-auth.test.ts`.

---

### Ticket T059

1. **Title:** T059 — Add Graceful Shutdown, In-Flight Drain & Liveness/Readiness Probes
2. **Description:** Harden `apps/clearing-node/src/server.ts` with `/health/live`, `/health/ready`, Prometheus-style text metrics (`/metrics`), and graceful HTTP connection draining on `SIGTERM`.
3. **Acceptance criteria:**
   - `/health/ready` verifies ledger hash-chain health before reporting ready.
   - `/metrics` exposes settled count, queue depth, and liquidity saved.
   - Drains active requests cleanly on shutdown.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add /health/live, /health/ready, /metrics, and graceful shutdown draining to apps/clearing-node."
5. **Tests to run to prove completion:**
   - Run `npx vitest run apps/clearing-node/src/health-metrics.test.ts`.

---

### Ticket T060

1. **Title:** T060 — Build Complete OpenAPI 3.1 Spec & Contract Validation Suite
2. **Description:** Document every endpoint in `apps/clearing-node/openapi.yaml` and run automated contract tests verifying `ClearingHttpClient` and `createClearingRouter` match 100%.
3. **Acceptance criteria:**
   - Covers accounts, funding, RTGS/queued payments, netting, PvP FX, ledger verification, and metrics.
   - Every error code maps consistently to documented HTTP status codes.
   - Verified via automated contract suite.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please create apps/clearing-node/openapi.yaml and expand the HTTP client-to-router contract test suite."
5. **Tests to run to prove completion:**
   - Run `npx vitest run apps/clearing-node/src/router.test.ts`.

---

## Phase 7: Production Storage Adapters, Chaos Scenarios & Telemetry

### Ticket T061

1. **Title:** T061 — Create `@aegisclear/storage-postgres` with Serializable Transaction Adapter
2. **Description:** Build a PostgreSQL repository adapter using parameterised SQL, `SERIALIZABLE` isolation, `SELECT ... FOR UPDATE` account locking, and versioned SQL migrations, tested offline via an injectable SQL driver.
3. **Acceptance criteria:**
   - 100% parameterised SQL queries with zero string concatenation.
   - Versioned SQL migration files create tables, constraints, and indexes.
   - Unit-tested offline using a mock SQL query runner.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please create @aegisclear/storage-postgres implementing IRepositoryRegistry and IUnitOfWork with parameterised SQL and offline driver tests."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/storage-postgres`.

---

### Ticket T062

1. **Title:** T062 — Add Database-Level Balance & Zero-Sum Check Constraints in SQL Migrations
2. **Description:** Author PostgreSQL `CHECK` constraints and trigger functions enforcing `balance_minor + intraday_credit_limit_minor >= reserved_minor` and balanced journal postings at the database layer.
3. **Acceptance criteria:**
   - Migration SQL includes explicit check constraints and balance triggers.
   - Tested via SQL schema validation tests.
   - Documented in `packages/storage-postgres/README.md`.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add database check constraints and zero-sum journal trigger SQL in @aegisclear/storage-postgres migrations."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/storage-postgres/src/migrations.test.ts`.

---

### Ticket T063

1. **Title:** T063 — Add Structured JSON Logger with Sensitive-Field Redaction
2. **Description:** Create an `ILogger` port and structured JSON logger that records correlation IDs, latencies, and event types while redacting API secrets and institutional credentials.
3. **Acceptance criteria:**
   - Outputs valid single-line JSON logs.
   - Automatically masks secret headers and keys.
   - Injectable silent logger keeps test output clean.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add a structured JSON logger with automatic secret redaction across @aegisclear/clearing-services and apps/clearing-node."
5. **Tests to run to prove completion:**
   - Run `npx vitest run apps/clearing-node/src/logger.test.ts`.

---

### Ticket T064

1. **Title:** T064 — Build Multi-Scenario Chaos Suite: Gridlock Storm, Flash Liquidity Crunch & FX Spike
2. **Description:** Expand `apps/chaos-runner` with 5 named stress scenarios: `CIRCULAR_GRIDLOCK_STORM`, `FLASH_LIQUIDITY_CRUNCH`, `PVP_FX_VOLATILITY`, `DUPLICATE_RETRY_FLOOD`, and `NODE_CRASH_RECOVERY`.
3. **Acceptance criteria:**
   - Each scenario asserts conservation of money across all 4 currencies and unbroken ledger hash chains.
   - Prints clear tabular summary report to stdout.
   - Runs 100% offline in under 5 seconds.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please expand apps/chaos-runner with 5 named deterministic stress scenarios verifying accounting and hash-chain invariants under heavy load."
5. **Tests to run to prove completion:**
   - Run `npx vitest run apps/chaos-runner/src/scenarios.test.ts`.

---

### Ticket T065

1. **Title:** T065 — Add Regulatory End-of-Day Clearing & Liquidity Report Generator
2. **Description:** Build a `RegulatoryReportService` generating daily institution settlement summaries, peak intraday credit usage, netting efficiency ratios, and Merkle batch roots.
3. **Acceptance criteria:**
   - Generates deterministic JSON and CSV regulatory reports per clearing date.
   - Includes cryptographic Merkle root of the day's settled journals.
   - Pure read-only query service.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build RegulatoryReportService in @aegisclear/clearing-services outputting daily settlement summaries and Merkle roots."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/regulatory-report.test.ts`.

---

### Ticket T066

1. **Title:** T066 — Build Historical Time-Travel State Inspector (Point-in-Time Query)
2. **Description:** Allow auditors to query the exact state of any settlement account or trial balance at any historical timestamp `T` by replaying journal entries up to `T`.
3. **Acceptance criteria:**
   - Reconstructs exact balances at any ISO timestamp accurately.
   - Never mutates current live state.
   - Verified against `ManualClock` multi-step histories.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build a TimeTravelAuditor in @aegisclear/ledger-engine that reconstructs exact account balances and trial balances at any past timestamp."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/ledger-engine/src/time-travel.test.ts`.

---

### Ticket T067

1. **Title:** T067 — Add Liquidity Forecasting & Gridlock Risk Early-Warning Engine
2. **Description:** Analyse queued outgoing payments vs expected incoming flows to predict upcoming liquidity bottlenecks and recommend optimal top-up amounts to treasury operators.
3. **Acceptance criteria:**
   - Calculates exact shortfall amount needed to unlock a stuck queue.
   - Identifies bottleneck accounts blocking multilateral netting.
   - Pure deterministic advisory calculation.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build a LiquidityForecastService in @aegisclear/clearing-services that detects queue bottlenecks and calculates exact top-up amounts needed to unblock settlements."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/liquidity-forecast.test.ts`.

---

### Ticket T068

1. **Title:** T068 — Add Multi-Batch Netting Schedule & Auto-Trigger Policy
2. **Description:** Create an automated netting trigger policy that launches a multilateral netting batch whenever queue depth exceeds N items, oldest queued payment exceeds M seconds, or total queued value crosses a threshold.
3. **Acceptance criteria:**
   - Configurable thresholds per currency.
   - Evaluated cleanly on payment submission or clock tick.
   - Prevents queues from growing stale.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build an AutoNettingTriggerPolicy in @aegisclear/clearing-services that triggers multilateral netting based on queue depth, age, or value thresholds."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/auto-netting-trigger.test.ts`.

---

### Ticket T069

1. **Title:** T069 — Implement Standing Liquidity Facilities (Repo / Central Bank Auto-Top-Up)
2. **Description:** Allow institutions to configure an automated standing liquidity facility that pledges pre-approved collateral to top up cash automatically when an `URGENT` RTGS payment would otherwise queue.
3. **Acceptance criteria:**
   - Triggers only for `URGENT` payments when collateral headroom exists.
   - Posts balanced facility draw journal entry atomically.
   - Respects maximum facility cap.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please implement an automated StandingLiquidityFacility in @aegisclear/clearing-services for URGENT RTGS payments backed by pledged collateral."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/standing-facility.test.ts`.

---

### Ticket T070

1. **Title:** T070 — Add Bilateral & Multilateral Netting Obligation Compression
2. **Description:** Compress chains of intermediate obligations (`A -> B -> C` for £100) into direct net settlement postings (`A -> C` for £100) to minimise total ledger rows while preserving full audit linkage.
3. **Acceptance criteria:**
   - Reduces total journal posting count while keeping exact net account deltas identical.
   - Links every compressed posting back to all original `PaymentId`s.
   - Passes trial balance verification.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add obligation compression in @aegisclear/netting-engine and PaymentSettlementService while preserving full payment-to-journal audit links."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/netting-engine/src/compression.test.ts`.

---

### Ticket T071

1. **Title:** T071 — Add Cross-Border Nostro/Vostro Correspondent Banking Adapter
2. **Description:** Model correspondent settlement accounts where a domestic bank settles foreign-currency obligations through an appointed correspondent institution.
3. **Acceptance criteria:**
   - Validates active correspondent relationship before routing.
   - Posts synchronized mirror entries on correspondent accounts.
   - Prevents unauthorized correspondent routing.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add correspondent banking routing and mirror ledger postings in @aegisclear/clearing-services."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/correspondent.test.ts`.

---

### Ticket T072

1. **Title:** T072 — Build Comprehensive Security & Tamper-Resistance Audit Suite
2. **Description:** Write negative security tests attacking the clearing node and ledger: forged HMAC signatures, replay attacks, journal hash tampering, integer overflow attempts, and unauthorised account debits.
3. **Acceptance criteria:**
   - Every attack vector is blocked cleanly with expected error codes.
   - Zero stack traces leak in HTTP error payloads.
   - Security controls documented in `docs/SECURITY.md`.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please write a security and tamper-resistance test suite for apps/clearing-node and @aegisclear/ledger-engine, and document our controls in docs/SECURITY.md."
5. **Tests to run to prove completion:**
   - Run `npx vitest run apps/clearing-node/src/security-audit.test.ts`.

---

### Ticket T073

1. **Title:** T073 — Add Production Dockerfiles, Compose Stack & Startup Config Validator
2. **Description:** Add multi-stage Dockerfiles for `apps/clearing-node` and `apps/chaos-runner`, a local `docker-compose.yml` (Node + PostgreSQL), and fail-fast startup environment validation.
3. **Acceptance criteria:**
   - Missing required production env vars fail fast with clear messages.
   - Multi-stage Dockerfiles build lean non-root images.
   - `docker-compose.yml` wires clearing node and PostgreSQL cleanly.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add production Dockerfiles, docker-compose.yml, and strict startup environment config validation."
5. **Tests to run to prove completion:**
   - Run `npx vitest run apps/clearing-node/src/env-config.test.ts`.

---

### Ticket T074

1. **Title:** T074 — Add Admin CLI Operational Tooling (Verify Chain, Run Netting, Export Snapshot)
2. **Description:** Build a clean TypeScript CLI tool in `apps/chaos-runner/src/cli.ts` allowing operators to run offline chaos simulations, verify ledger hash chains, inspect trial balances, and export snapshots from the command line.
3. **Acceptance criteria:**
   - Supports `--scenario`, `--instructions`, `--seed`, and `--export` flags.
   - Exits non-zero if any accounting or hash-chain invariant fails.
   - 100% offline execution.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add a clean CLI runner in apps/chaos-runner supporting scenario selection, seed flags, and invariant exit codes."
5. **Tests to run to prove completion:**
   - Run `npx vitest run apps/chaos-runner/src/cli.test.ts`.

---

### Ticket T075

1. **Title:** T075 — Add Multi-Currency FX Limit Orders & Automated Matching Book
2. **Description:** Allow institutions to post standing PvP FX limit orders (`sell GBP, buy EUR at >= minRate`) that automatically match and execute atomic PvP settlements when an opposing order crosses the spread.
3. **Acceptance criteria:**
   - Matches compatible opposing orders in price-time priority.
   - Executes atomic PvP settlement immediately upon match.
   - Cancels or expires unfilled orders cleanly.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build an offline PvP FX order-book matcher in @aegisclear/fx-engine and PvpFxSettlementService."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/fx-orderbook.test.ts`.

---

### Ticket T076

1. **Title:** T076 — Add Stress Benchmark: 10,000 Mixed RTGS, Netting & PvP FX Operations
2. **Description:** Create a flagship end-to-end load benchmark executing 10,000 mixed operations across 20 institutions and 4 currencies under `OfflineNetworkGuard`, asserting sub-2-second completion and 100% trial-balance accuracy.
3. **Acceptance criteria:**
   - Runs 10,000 mixed operations in under 2 seconds.
   - Verifies unbroken hash chains across all 4 currencies.
   - Records throughput metrics in `docs/PERFORMANCE.md`.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add a 10,000-operation mixed clearing benchmark in apps/chaos-runner and document throughput results in docs/PERFORMANCE.md."
5. **Tests to run to prove completion:**
   - Run `npx vitest run apps/chaos-runner/src/load-benchmark.test.ts`.

---

### Ticket T077

1. **Title:** T077 — Add Audit Trail Export in Signed CSV & JSON-LD Formats
2. **Description:** Allow external auditors to export filtered journal entries and Merkle roots in deterministic CSV and JSON formats with a manifest signature.
3. **Acceptance criteria:**
   - Escapes CSV fields safely against formula injection.
   - Includes batch Merkle root and trial balance summary header.
   - 100% offline generation.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add CSV and JSON audit export formatters with CSV injection protection in @aegisclear/clearing-services."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/audit-export.test.ts`.

---

### Ticket T078

1. **Title:** T078 — Add Circuit-Breaker & Automatic Safe-Mode Halt on Invariant Anomaly
2. **Description:** Wire a safety supervisor that automatically places a currency shard into `HALTED_SAFE_MODE` if a storage integrity check ever detects a hash mismatch, preventing further writes until operator recovery.
3. **Acceptance criteria:**
   - Halts new settlements immediately on hash-chain anomaly.
   - Allows read-only inspection and snapshot export while halted.
   - Tested via simulated storage corruption.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add a safety supervisor that puts a shard into HALTED_SAFE_MODE if storage corruption is detected."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/safe-mode.test.ts`.

---

### Ticket T079

1. **Title:** T079 — Write Full-Stack Offline End-to-End Integration Suite Across All Packages
2. **Description:** Author a master integration test suite exercising every package together (`core`, `ledger`, `netting`, `fx`, `risk`, `consensus`, `storage-offline`, `clearing-services`, `client`, `clearing-node`) under `OfflineNetworkGuard`.
3. **Acceptance criteria:**
   - Zero mocks of domain services.
   - Covers onboarding, funding, RTGS, gridlock netting, PvP FX, risk blocks, consensus replication, and audit proofs.
   - Achieves >= 90% code coverage across core domain packages.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please write a master full-stack offline E2E integration test suite covering every clearing subsystem with zero mocks."
5. **Tests to run to prove completion:**
   - Run `npx vitest run --coverage` and verify >= 90% coverage on core packages.

---

### Ticket T080

1. **Title:** T080 — Final Documentation Pack, Architecture Decision Records & Release Gate
2. **Description:** Complete `docs/ADRS.md` (recording decisions on integer `MinorUnits`, BigInt scaled FX rates, Tarjan/iterative netting, atomic PvP, and Raft consensus), polish `README.md`, and run the full verification gate.
3. **Acceptance criteria:**
   - `docs/ADRS.md` documents all major backend design decisions and trade-offs.
   - `README.md` provides clear quickstart commands for node, tests, and chaos simulations.
   - `npm run typecheck && npm run lint && npm run build && npm test` all pass cleanly offline.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please complete docs/ADRS.md and polish README.md, then verify typecheck, lint, build, and the entire test suite pass cleanly offline."
5. **Tests to run to prove completion:**
   - Run `npm run typecheck && npm run lint && npm run build && npm test`.

---

## Phase 8: Settlement Operations, Treasury Automation & Release Hardening

### Ticket T081

1. **Title:** T081 — Build Intraday Liquidity Sweeping Between Institutional Sub-Accounts
2. **Description:** Allow an institution to configure automated sweep rules moving surplus cash from `HOUSE` accounts into settlement accounts before cut-off.
3. **Acceptance criteria:**
   - Executes balanced internal transfers cleanly.
   - Respects minimum reserve floors.
   - Emits `LiquiditySwept` events.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add automated intraday liquidity sweeping between institutional sub-accounts in AccountService."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/liquidity-sweep.test.ts`.

---

### Ticket T082

1. **Title:** T082 — Add Partial-Fill Support for Large Institutional Payments
2. **Description:** Allow opt-in instructions (`allowPartialFill: true`) to settle available liquidity immediately via RTGS while queueing only the remaining unpaid tranche.
3. **Acceptance criteria:**
   - Splits instruction into settled portion and queued remainder cleanly.
   - Maintains idempotency across retries.
   - Defaults to all-or-nothing (`false`).
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add optional partial-fill settlement support in PaymentSettlementService."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/partial-fill.test.ts`.

---

### Ticket T083

1. **Title:** T083 — Implement Automated Nostro Account Reconciliation Matcher
2. **Description:** Compare internal ledger postings against external correspondent statement entries (`camt.053`) and flag matched, timing-difference, or unmatched breaks.
3. **Acceptance criteria:**
   - Matches entries by reference, currency, and amount.
   - Produces structured break report for operators.
   - Pure deterministic matcher.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build a correspondent statement reconciliation matcher in @aegisclear/clearing-services."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/nostro-recon.test.ts`.

---

### Ticket T084

1. **Title:** T084 — Add Dynamic Haircut Stress-Testing for Pledged Collateral
2. **Description:** Simulate market stress shocks (e.g., -15% bond valuation drop) across pledged collateral pools to identify institutions requiring immediate margin top-ups.
3. **Acceptance criteria:**
   - Calculates post-shock credit headroom without mutating live collateral.
   - Lists institutions entering margin deficit.
   - Pure simulation service.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add a collateral stress-test simulator in @aegisclear/risk-engine."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/risk-engine/src/collateral-stress.test.ts`.

---

### Ticket T085

1. **Title:** T085 — Build Multi-Currency Nostro Liquidity Pooling (Notional Pooling)
2. **Description:** Allow approved banking groups to offset debit balances in one currency against credit balances in another using conservative FX haircuts.
3. **Acceptance criteria:**
   - Computes group-wide notional liquidity pool position.
   - Enforces cross-currency haircut buffers.
   - Configurable per institutional group.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add cross-currency notional liquidity pooling calculations in @aegisclear/risk-engine."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/risk-engine/src/notional-pooling.test.ts`.

---

### Ticket T086

1. **Title:** T086 — Add Payment Recall & Return-of-Funds Request Workflow
2. **Description:** Implement a structured recall workflow where a sending bank requests return of a settled payment and the receiving bank approves an atomic return journal.
3. **Acceptance criteria:**
   - Never mutates the original settled journal.
   - Requires explicit receiver approval before posting the return payment.
   - Links return journal to original `PaymentId`.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build a two-party payment recall and return-of-funds workflow in PaymentSettlementService."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/payment-recall.test.ts`.

---

### Ticket T087

1. **Title:** T087 — Build Real-Time Queue Position & Estimated Settlement Time Estimator
2. **Description:** Give institutions visibility into where their queued payments sit in the priority queue and estimated clearance based on recent netting cadence.
3. **Acceptance criteria:**
   - Computes exact queue rank and ahead-of-me volume.
   - Estimates clearance window from historical batch intervals.
   - Pure read-only query.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add queue rank and estimated settlement window queries in PaymentSettlementService."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/queue-visibility.test.ts`.

---

### Ticket T088

1. **Title:** T088 — Add Automated Holiday Calendar & Currency Settlement Days Rules
2. **Description:** Support per-currency clearing holiday calendars (`GBP` UK bank holidays, `EUR` TARGET2, `USD` Fedwire, `JPY` BoJ) so value-date scheduling skips non-settlement days.
3. **Acceptance criteria:**
   - Rolls non-business value dates forward to next valid clearing day.
   - Configurable holiday calendars per currency.
   - Tested with `ManualClock`.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add per-currency clearing holiday calendars and business-day roll rules in @aegisclear/core."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/core/src/business-days.test.ts`.

---

### Ticket T089

1. **Title:** T089 — Implement Deterministic Snapshot Diffing Tool for Incident Forensics
2. **Description:** Create a state diff utility comparing two clearing snapshots (`before.json` vs `after.json`) to list every changed account balance, settled payment, and new journal entry.
3. **Acceptance criteria:**
   - Produces concise human-readable and JSON diffs.
   - Verifies hash-chain continuity between snapshots.
   - Useful for offline chaos debugging.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build a snapshot diffing forensic utility in @aegisclear/storage-offline."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/storage-offline/src/snapshot-diff.test.ts`.

---

### Ticket T090

1. **Title:** T090 — Add Multi-Signature Governance for Clearing House Parameter Changes
2. **Description:** Require M-of-N operator approvals before changing global risk caps, fee schedules, or halting/resuming a currency shard.
3. **Acceptance criteria:**
   - Stores governance change proposals with signer approvals.
   - Applies parameter updates atomically once threshold M is reached.
   - Logs all approvals in audit trail.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add M-of-N multi-signature operator governance for global clearing parameter updates."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/operator-multisig.test.ts`.

---

### Ticket T091

1. **Title:** T091 — Build Latency Histogram & Percentile (p50/p95/p99) Metrics Collector
2. **Description:** Add a zero-dependency HDR-style latency histogram in `apps/clearing-node` tracking RTGS settlement, netting solver, and PvP FX execution times.
3. **Acceptance criteria:**
   - Computes accurate p50, p95, and p99 microsecond/millisecond latencies.
   - Exposes metrics on `/metrics`.
   - Zero external monitoring dependencies.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add a p50/p95/p99 latency histogram collector in apps/clearing-node."
5. **Tests to run to prove completion:**
   - Run `npx vitest run apps/clearing-node/src/latency-metrics.test.ts`.

---

### Ticket T092

1. **Title:** T092 — Add Batch File Ingestion Endpoint (`POST /api/v1/batches/upload`)
2. **Description:** Allow institutions to submit bulk payment files (up to 1,000 instructions per batch) with per-item validation reports and atomic or best-effort modes.
3. **Acceptance criteria:**
   - Supports `ATOMIC_ALL_OR_NOTHING` and `PARTIAL_ACCEPT` batch modes.
   - Returns per-line status and error details.
   - Enforces idempotency per instruction.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add a bulk payment batch ingestion endpoint in apps/clearing-node."
5. **Tests to run to prove completion:**
   - Run `npx vitest run apps/clearing-node/src/bulk-upload.test.ts`.

---

### Ticket T093

1. **Title:** T093 — Implement Automated Archival of Settled Payments Older Than Retention Window
2. **Description:** Move aged `SETTLED` payment records into cold archive storage while preserving summarized journal entries and hash chains.
3. **Acceptance criteria:**
   - Archives settled payments older than configured retention days via `IClock`.
   - Keeps active working set lean for fast queries.
   - Preserves full audit query access.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add aged payment archival in @aegisclear/storage-offline."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/storage-offline/src/archival.test.ts`.

---

### Ticket T094

1. **Title:** T094 — Add FX Liquidity Provider Quote Streaming & Auto-Refresh
2. **Description:** Support streaming live FX quote updates over NDJSON and auto-renewing institutional quotes safely before expiry.
3. **Acceptance criteria:**
   - Pushes new quote ticks to subscribers.
   - Prevents race conditions around quote expiry timestamps.
   - Testable offline with `ManualClock`.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add FX quote streaming and auto-refresh helpers in @aegisclear/fx-engine and apps/clearing-node."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/fx-engine/src/quote-stream.test.ts`.

---

### Ticket T095

1. **Title:** T095 — Build Cross-Shard Deadlock Detector for Concurrent PvP FX Swaps
2. **Description:** Prevent lock-ordering deadlocks when two concurrent PvP swaps lock `(GBP, EUR)` and `(EUR, GBP)` simultaneously by enforcing canonical currency lock ordering.
3. **Acceptance criteria:**
   - Always acquires shard locks in canonical alphabetical currency order.
   - Eliminates circular lock waits under concurrent PvP stress.
   - Verified with concurrent swap tests.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please enforce canonical currency lock ordering in PvpFxSettlementService and TwoPhaseCommitCoordinator to prevent cross-shard deadlocks."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/consensus/src/pvp-deadlock.test.ts`.

---

### Ticket T096

1. **Title:** T096 — Add Institutional Webhook Delivery Simulator with Exponential Backoff
2. **Description:** Build an offline webhook dispatcher queue with HMAC-signed payloads, exponential backoff retries, and delivery receipts.
3. **Acceptance criteria:**
   - Signs webhook payloads with HMAC-SHA256.
   - Retries failed deliveries with deterministic backoff intervals via `IClock`.
   - Moves exhausted deliveries to DLQ.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please build an offline webhook delivery queue with HMAC signing and exponential backoff retries in @aegisclear/clearing-services."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/clearing-services/src/webhooks.test.ts`.

---

### Ticket T097

1. **Title:** T097 — Add Memory Footprint & Allocation Profiling Gate in CI
2. **Description:** Write a memory stability benchmark running 20,000 clearing cycles and asserting heap growth stays bounded with zero listener leaks.
3. **Acceptance criteria:**
   - Verifies event bus subscriptions and caches release memory cleanly.
   - Asserts bounded heap delta after GC.
   - Runs offline via Vitest.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add a memory leak and heap stability test across 20,000 clearing operations in apps/chaos-runner."
5. **Tests to run to prove completion:**
   - Run `npx vitest run apps/chaos-runner/src/memory-stability.test.ts`.

---

### Ticket T098

1. **Title:** T098 — Build Interactive Offline CLI Dashboard (Terminal Live Monitor)
2. **Description:** Enhance `apps/chaos-runner` with a clean terminal status table displaying live account balances, queue depths, liquidity saved, and hash-chain status during simulations.
3. **Acceptance criteria:**
   - Formats clean ASCII/Unicode status tables with zero external UI deps.
   - Works in any standard terminal offline.
   - Tested with snapshot output assertions.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please add a formatted terminal summary table renderer in apps/chaos-runner."
5. **Tests to run to prove completion:**
   - Run `npx vitest run apps/chaos-runner/src/formatter.test.ts`.

---

### Ticket T099

1. **Title:** T099 — Add Multi-Region Active-Passive Failover Simulation Test
2. **Description:** Simulate primary clearing node failure and automated promotion of a passive replica node using replicated Raft logs and WAL checkpoints.
3. **Acceptance criteria:**
   - Verifies zero committed transactions are lost on failover.
   - Confirms promoted replica continues accepting payments and netting batches.
   - 100% deterministic offline test.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please write a primary-to-passive failover test in @aegisclear/consensus proving zero data loss."
5. **Tests to run to prove completion:**
   - Run `npx vitest run packages/consensus/src/failover.test.ts`.

---

### Ticket T100

1. **Title:** T100 — Final Pre-Release Verification & Operations Runbook
2. **Description:** Author `docs/OPERATIONS_RUNBOOK.md` covering incident response, safe-mode recovery, DLQ replay, and chaos testing, and sign off all 100 tickets.
3. **Acceptance criteria:**
   - Complete runbook covering backup, restore, safe-mode recovery, and key rotation.
   - All 100 roadmap tickets verified against architecture invariants.
   - Full `typecheck`, `lint`, `build`, and `test` pass 100% offline.
4. **Prompt to give the AI programmer (plain UK English):**
   > "Please write docs/OPERATIONS_RUNBOOK.md and run the final verification gate across the entire monorepo."
5. **Tests to run to prove completion:**
   - Run `npm run typecheck && npm run lint && npm run build && npm test`.

---
