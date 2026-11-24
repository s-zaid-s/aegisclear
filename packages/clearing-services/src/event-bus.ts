import type { DomainEvent, DomainEventListener, IEventBus } from '@aegisclear/core';

export class SynchronousEventBus implements IEventBus {
  private readonly listeners = new Set<DomainEventListener>();

  public publish(event: DomainEvent): void {
    for (const listener of this.listeners) listener(event);
  }

  public subscribe(listener: DomainEventListener): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
}
