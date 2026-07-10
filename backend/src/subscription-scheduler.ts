import type { CantonLedger } from './canton/ledger.js';
import { PARTIES } from './types.js';

export type SchedulerRunResult = {
  checkedAt: string;
  due: number;
  executed: number;
  failed: number;
  details: { contractId: string; subscriptionId: string; ok: boolean; error?: string }[];
};

export type SchedulerStatus = {
  enabled: boolean;
  pollMs: number;
  lastRun: SchedulerRunResult | null;
  running: boolean;
};

/**
 * Polls active subscriptions and exercises Subscription_Execute when nextPaymentAt has passed.
 */
export class SubscriptionScheduler {
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;
  private lastRun: SchedulerRunResult | null = null;
  readonly pollMs: number;
  readonly enabled: boolean;

  constructor(
    private readonly canton: CantonLedger,
    opts?: { pollMs?: number; enabled?: boolean }
  ) {
    this.pollMs = opts?.pollMs ?? Number(process.env.SUBSCRIPTION_POLL_MS ?? 60_000);
    this.enabled =
      opts?.enabled ??
      (process.env.SUBSCRIPTION_SCHEDULER ?? 'true').toLowerCase() !== 'false';
  }

  start() {
    if (!this.enabled) {
      console.log('Subscription scheduler: disabled');
      return;
    }
    if (this.timer) return;
    console.log(`Subscription scheduler: every ${this.pollMs}ms`);
    void this.runOnce();
    this.timer = setInterval(() => void this.runOnce(), this.pollMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  status(): SchedulerStatus {
    return {
      enabled: this.enabled,
      pollMs: this.pollMs,
      lastRun: this.lastRun,
      running: this.running,
    };
  }

  async runOnce(): Promise<SchedulerRunResult> {
    if (this.running) {
      return (
        this.lastRun ?? {
          checkedAt: new Date().toISOString(),
          due: 0,
          executed: 0,
          failed: 0,
          details: [],
        }
      );
    }
    this.running = true;
    const details: SchedulerRunResult['details'] = [];
    const now = Date.now();
    const seen = new Set<string>();

    try {
      for (const party of PARTIES) {
        let subs;
        try {
          subs = await this.canton.subscriptionsForParty(party.id);
        } catch (e) {
          console.warn(`Scheduler: list failed for ${party.id}:`, e);
          continue;
        }

        for (const sub of subs) {
          if (seen.has(sub.contractId)) continue;
          seen.add(sub.contractId);
          if (!sub.active) continue;
          if (new Date(sub.nextPaymentAt).getTime() > now) continue;

          // Only the subscriber can execute
          if (sub.subscriber !== party.id) continue;

          try {
            await this.canton.executeSubscription(sub.contractId, sub.subscriber);
            details.push({
              contractId: sub.contractId,
              subscriptionId: sub.subscriptionId,
              ok: true,
            });
            console.log(
              `Scheduler: executed ${sub.subscriptionId} (${sub.subscriber} → ${sub.recipient})`
            );
          } catch (e) {
            const error = e instanceof Error ? e.message : String(e);
            details.push({
              contractId: sub.contractId,
              subscriptionId: sub.subscriptionId,
              ok: false,
              error,
            });
            console.warn(`Scheduler: execute failed ${sub.subscriptionId}:`, error);
          }
        }
      }
    } finally {
      this.running = false;
    }

    this.lastRun = {
      checkedAt: new Date().toISOString(),
      due: details.length,
      executed: details.filter((d) => d.ok).length,
      failed: details.filter((d) => !d.ok).length,
      details,
    };
    return this.lastRun;
  }
}
