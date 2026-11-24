# SOLID Principles in AegisClear

- **Single Responsibility (SRP):** Journal hash-chaining (`ledger-engine`), circular gridlock solving (`netting-engine`), integer FX scaling (`fx-engine`), and risk caps (`risk-engine`) live in isolated packages.
- **Open/Closed (OCP):** `INettingSolver`, `IRiskPolicy`, `IUnitOfWork`, and `IClearingEngineClient` allow plugging in new netting algorithms, compliance checks, or PostgreSQL/Raft adapters without editing clearing services.
- **Liskov Substitution (LSP):** `createOfflineClearingClient()` and `ClearingHttpClient` implement the exact same `IClearingEngineClient` contract.
- **Interface Segregation (ISP):** Persistence is divided into focused repositories (`IAccountRepository`, `ILedgerRepository`, `IPaymentRepository`, `INettingBatchRepository`, `IFxQuoteRepository`, `IPvpSwapRepository`).
- **Dependency Inversion (DIP):** High-level clearing services depend solely on `@aegisclear/ports` and `@aegisclear/core`.
