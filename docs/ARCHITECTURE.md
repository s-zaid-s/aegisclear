# AegisClear Architecture

AegisClear enforces **Hexagonal Architecture (Ports & Adapters)** across 11 backend TypeScript workspaces:

```
apps/clearing-node & apps/chaos-runner
   └── @aegisclear/client
          └── @aegisclear/clearing-services
                 ├── @aegisclear/ledger-engine   ──► ports, core
                 ├── @aegisclear/netting-engine  ──► ledger-engine, ports, core
                 ├── @aegisclear/fx-engine       ──► core
                 ├── @aegisclear/risk-engine     ──► ports, core
                 └── @aegisclear/ports           ──► core
```

Every multi-entity mutation (RTGS settlement, multilateral batch clearing, PvP FX swaps) executes inside `IUnitOfWork.runInTransaction()` so partial failures roll back completely with zero accounting drift.
