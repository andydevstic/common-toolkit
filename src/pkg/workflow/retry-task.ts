import { TaskFn } from "../../interfaces";

type TaskErrorHandler = (err: Error) => void | Promise<void>;
type DoneFn<T = any> = (err: Error, data: T) => void;

interface RetryTaskOptions {
  taskName: string;
  retryCount?: number;
  retryIntervalInMs?: number;
  returnOperationResult?: boolean;
}

export class RetryTask {
  constructor(task: TaskFn, protected opts: RetryTaskOptions) {
    this._task = task;
    this._retryCount = opts?.retryCount || 3;
    this._retryIntervalInMs = opts?.retryIntervalInMs || 500;
    this._currentRetryCount = this._retryCount;
    this.taskName = opts?.taskName;
  }

  protected _task: TaskFn;
  protected _retryCount: number;
  protected _currentRetryCount: number;
  protected _retryIntervalInMs: number;

  public taskName: string;

  public get maxRetryCount(): number {
    return this._retryCount;
  }

  public get retryCount(): number {
    return this._currentRetryCount;
  }

  public get retryIntervalInMs(): number {
    return this._retryIntervalInMs;
  }

  public async run<T = any>(eachErrorHandler?: TaskErrorHandler): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const doneFn = (err: Error, data: T) => {
        if (err) {
          reject(err);

          return;
        }

        resolve(data);
      };

      this.execTask(doneFn, eachErrorHandler);
    });
  }

  protected async execTask<T = any>(
    done: DoneFn<T>,
    eachErrorHandler: TaskErrorHandler
  ): Promise<void> {
    if (this._currentRetryCount === 0) {
      // Reset retry count back to normal
      this._currentRetryCount = this._retryCount;

      if (this.opts?.returnOperationResult) {
        done(null, {
          success: false,
          message: `retry task ${this.taskName} failed after ${this.maxRetryCount} retries`,
        } as any);

        return;
      }

      done(
        new Error(
          `retry task ${this.taskName} failed after ${this.maxRetryCount} retries`
        ),
        null
      );

      return;
    }

    try {
      const result = await this._task();

      // If operation result is returned
      if (result?.success === false) {
        throw new Error(result.message || "execution failed");
      }

      if (this.opts?.returnOperationResult && !result?.success) {
        done(null, {
          success: true,
          data: result,
        } as any);

        return;
      }

      done(null, result);
    } catch (error: any) {
      eachErrorHandler?.(error);

      setTimeout(
        () => this.execTask(done, eachErrorHandler),
        this.retryIntervalInMs
      );
    } finally {
      this._currentRetryCount--;
    }
  }
}
