import type { IsoTimestamp } from '@aegisclear/core';
import type { IClock } from '@aegisclear/ports';

export class ManualClock implements IClock {
  private epochMs: number;

  public constructor(initialIso = '2026-11-24T09:00:00.000Z') {
    this.epochMs = Date.parse(initialIso);
  }

  public now(): IsoTimestamp {
    return new Date(this.epochMs).toISOString() as IsoTimestamp;
  }

  public advanceSeconds(seconds: number): IsoTimestamp {
    this.epochMs += seconds * 1000;
    return this.now();
  }
}
