import { TaskFn } from "../interfaces";

export async function runWithTimeout<T = any>(
  handler: TaskFn,
  timeoutInMs: number,
  onCompletedAfterReject?: (result: any) => any
): Promise<T> {
  return new Promise((resolve, reject) => {
    let isCompleted = false;

    const timeout = setTimeout(() => {
      if (isCompleted) return;
      isCompleted = true;

      reject(new Error("task timed out"));
    }, timeoutInMs);

    handler()
      .then((result: T) => {
        if (isCompleted) {
          onCompletedAfterReject?.(result);

          return;
        }
        isCompleted = true;

        clearTimeout(timeout);

        resolve(result);
      })
      .catch((error: Error) => {
        if (isCompleted) return;
        isCompleted = true;

        clearTimeout(timeout);

        reject(error);
      });
  });
}
