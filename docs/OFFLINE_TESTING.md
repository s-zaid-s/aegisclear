# Offline & Deterministic Chaos Testing Guide

1. **Zero-Network Enforcement:** `OfflineNetworkGuard` blocks outbound `fetch` calls during offline test suites and chaos runs.
2. **In-Process Backend HTTP Router:** `apps/clearing-node/src/router.ts` handles requests directly in memory so `ClearingHttpClient` can test the full REST contract with zero TCP sockets.
3. **Seeded PRNG Chaos Runner:** `apps/chaos-runner` drives hundreds of payments, duplicate idempotent retries, and netting batches deterministically using `ManualClock` and Mulberry32 PRNG, asserting conservation of cash and unbroken hash chains at the end.
