import { createId } from "@paralleldrive/cuid2";

import dayjs from "dayjs";

import {
  DelayFn,
  DelayedTaskOps,
  ITask,
  Subscription,
  TaskRescheduleOps,
} from "../../interfaces";

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
    this.subscription = this.delayFn(() => {
      // run the task
      this.options.callback();

      // set last run to the moment
      this._lastRun = new Date();
    }, this.options.timeout);

    this.isRunning = true;
  }

  public cancel(): Promise<void> {
    this.isCancelled = true;
    this.isRunning = false;

    return this.subscription.unsubscribe();
  }

  public async reschedule(options: TaskRescheduleOps): Promise<void> {
    if (!options?.msFromNow && !options?.runTime) {
      throw new Error("must pass either msFromNow or runTime");
    }

    await this.cancel();

    if (options.msFromNow && options.runTime) {
      throw new Error("only accept either msFromNow or runTime.");
    }

    if (options.msFromNow) {
      this.options.timeout = options.msFromNow;

      return this._start();
    }

    if (options.runTime) {
      const timeDiff = dayjs(options.runTime).diff(new Date());
      if (timeDiff <= 0) {
        throw new Error("new run time must be after now");
      }

      this.options.timeout = timeDiff;

      return this._start();
    }
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
