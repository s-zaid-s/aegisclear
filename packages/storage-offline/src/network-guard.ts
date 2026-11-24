import { DomainError } from '@aegisclear/core';
import type { INetworkGuard } from '@aegisclear/ports';

/**
 * Guarantees 100% offline execution by blocking outbound network primitives.
 */
export class OfflineNetworkGuard implements INetworkGuard {
  private active = false;
  private originalFetch: typeof globalThis.fetch | undefined;

  public install(): void {
    if (this.active) return;
    this.originalFetch = globalThis.fetch;
    globalThis.fetch = (() => {
      throw new DomainError(
        'OFFLINE_NETWORK_BLOCKED',
        'Outbound network calls are forbidden in AegisClear Offline Mode.'
      );
    }) as typeof globalThis.fetch;
    this.active = true;
  }

  public uninstall(): void {
    if (!this.active) return;
    if (this.originalFetch) globalThis.fetch = this.originalFetch;
    this.active = false;
  }

  public isActive(): boolean {
    return this.active;
  }
}
