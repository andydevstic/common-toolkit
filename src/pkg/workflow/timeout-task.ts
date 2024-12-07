import { TaskFn } from "../../interfaces";

export class TimeoutTask {
  constructor() {}

  public async run<T = any>(handler: TaskFn, timeoutInMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("task timed out")),
        timeoutInMs
      );

      handler()
        .then((result: T) => {
          clearTimeout(timeout);

          resolve(result);
        })
        .catch((error: Error) => {
          clearTimeout(timeout);

          reject(error);
        });
    });
  }
}
