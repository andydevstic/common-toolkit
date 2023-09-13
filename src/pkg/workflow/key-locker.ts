import { BehaviorSubject, Observable } from "rxjs";
import {
  KeyLockerOption,
  LockStatus,
  ObtainLockResult,
  TaskRegistry,
} from "../../interfaces";

export class KeyLocker {
  protected locker: BehaviorSubject<LockStatus>;

  constructor(
    public keyName: string,
    protected taskRegistry: TaskRegistry,
    protected options: KeyLockerOption
  ) {
    const defaultStatus = {
      isLocked: false,
      lastActionTz: new Date(),
    };

    this.locker = new BehaviorSubject(options.initStatus || defaultStatus);
  }

  protected unlock(): void {
    this.locker.next({
      isLocked: false,
      lastActionTz: new Date(),
    });
  }

  protected lock(): void {
    this.locker.next({
      isLocked: true,
      lastActionTz: new Date(),
    });
  }

  protected get isLocked(): boolean {
    return this.locker.value.isLocked;
  }

  public obtainLock(): Promise<ObtainLockResult> {
    return new Promise(async (resolve, reject) => {
      if (!this.isLocked) {
        this.lock();

        // Start the countdown and obtain the lock
        const timeoutUnlockTask = await this.taskRegistry.register({
          startOnCreate: true,
          timeout: this.options.lockTTL || 15000, // default 15 seconds
          callback: () => this.unlock(),
        });

        resolve({
          isSuccess: true,
          done: async () => {
            this.unlock();
            await timeoutUnlockTask.cancel();
          },
        });

        return;
      }

      // If locked: Wait for the lock to be released, then repeat
      const subscription = this.locker.subscribe({
        next: async (value) => {
          if (!value.isLocked) {
            subscription.unsubscribe();

            const timeoutUnlockTask = await this.taskRegistry.register({
              startOnCreate: true,
              timeout: this.options.lockTTL || 15000, // default 15 seconds
              callback: () => {
                subscription.unsubscribe();
                this.unlock();
              },
            });

            resolve({
              isSuccess: true,
              done: async () => {
                this.unlock();
                await timeoutUnlockTask.cancel();
              },
            });

            return;
          }
        },
        error: (error) => {
          subscription.unsubscribe();

          reject({
            isSuccess: false,
            message: error.message,
          });
        },
      });
    });
  }

  public obtainLockAsync(): Observable<ObtainLockResult> {}
}
