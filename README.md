# AegisClear — Real-Time Multi-Currency Clearing House & Liquidity Settlement Engine

**AegisClear** is a backend-only TypeScript monorepo implementing the core financial plumbing of an institutional clearing and settlement network:

- **Immutable Double-Entry Ledger:** Every movement of funds is recorded as a zero-sum debit/credit journal entry chained via cryptographic hashes.
- **Real-Time Gross Settlement (RTGS) & Liquidity Queueing:** Instructions with sufficient liquidity settle instantaneously; liquidity-constrained instructions park cleanly in an ordered queue without failing.
- **Multilateral Netting & Gridlock Resolution:** An iterative net-position solver detects circular payment loops (`A -> B -> C -> A`) and settles entire batches simultaneously while saving up to 100% of net cash liquidity.
- **Atomic Cross-Currency PvP Settlement:** Settles two currency legs together in one atomic transaction using scaled integer FX quotes—eliminating Herstatt settlement risk.
- **100% Offline & Deterministic Chaos Testing:** Runs completely offline under `OfflineNetworkGuard` with a seeded PRNG chaos simulator (`apps/chaos-runner`) and an in-process REST router (`apps/clearing-node`).

## Monorepo Workspaces

- `@aegisclear/core` — Branded primitives, integer `MinorUnits` & `ScaledFxRate`, `Result<T, E>`, double-entry entities, and domain events.
- `@aegisclear/ports` — Segregated interfaces for repositories, `IUnitOfWork`, `INettingSolver`, `IRiskPolicy`, `IClock`, and `IClearingEngineClient`.
- `@aegisclear/ledger-engine` — Zero-sum journal builder, available liquidity calculator, and hash-chain auditor.
- `@aegisclear/netting-engine` — Iterative multilateral netting & circular gridlock solver.
- `@aegisclear/fx-engine` — BigInt scaled FX conversion and quote expiry validator.
- `@aegisclear/risk-engine` — Pluggable institutional payment risk limits and account status guards.
- `@aegisclear/storage-offline` — Transactional in-memory store with full snapshot rollback, `ManualClock`, and `OfflineNetworkGuard`.
- `@aegisclear/clearing-services` — Application services (`AccountService`, `PaymentSettlementService`, `PvpFxSettlementService`) and synchronous event bus.
- `@aegisclear/client` — Dual-mode SDK (`createOfflineClearingClient` and `ClearingHttpClient`).
- `apps/clearing-node` — Node.js backend REST server (`createClearingRouter` testable in-process offline + HTTP listener).
- `apps/chaos-runner` — Deterministic seeded PRNG chaos & gridlock simulation harness.

## Documentation

- [`roadmap.md`](./roadmap.md) — 100 plain UK English engineering tickets (3–4 hours each) from this skeleton to production readiness.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — Hexagonal Architecture, atomic transaction boundaries, and dependency graph.
- [`docs/SOLID_PRINCIPLES.md`](./docs/SOLID_PRINCIPLES.md) — Concrete SOLID mapping across all 11 workspaces.
- [`docs/OFFLINE_TESTING.md`](./docs/OFFLINE_TESTING.md) — How to run zero-network integration tests, chaos simulations, and replays offline.
