import { createId } from "@paralleldrive/cuid2";

import dayjs from "dayjs";

import { DelayFn, DelayedTaskOps, ITask, Subscription } from "../../interfaces";

const nativeTimeout: DelayFn = (callback, timeout) => {
  const timeoutId = setTimeout(callback, timeout);

  return {
    async unsubscribe() {
      clearTimeout(timeoutId);
    },
  };
};

export class DelayedTask implements ITask {
  public id: string;
  public isCron: boolean = false;
  public isRunning: boolean = false;
  public isCancelled: boolean = false;

  protected _lastRun: Date;
  protected subscription: Subscription;

  constructor(
    protected options: DelayedTaskOps,
    protected delayFn: DelayFn = nativeTimeout
  ) {
    this.id = createId();

    if (options?.startOnCreate) {
      this._start();
    }
  }

  protected _start(): void {
    this.subscription = this.delayFn(
      this.options.callback,
      this.options.timeout
    );

    this.isRunning = true;
    this._lastRun = new Date();
  }

  public cancel(): Promise<void> {
    this.isCancelled = true;

    return this.subscription.unsubscribe();
  }

  public async start(): Promise<void> {
    this._start();
  }

  public async lastRun(): Promise<Date> {
    return this._lastRun;
  }

  public async nextRun(): Promise<Date> {
    if (!this.isRunning) {
      return null;
    }

    return dayjs(this._lastRun).add(this.options.timeout).toDate();
  }
}
