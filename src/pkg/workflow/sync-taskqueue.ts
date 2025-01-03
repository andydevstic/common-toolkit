import { EventEmitter } from "stream";

import { PinoLogger } from "../logger";
import { TaskQueue } from "../../interfaces";

class Task {
  protected logger = new PinoLogger();
  public isDone = false;

  constructor(
    public name: string,
    protected handler: any,
    protected doneFn: any
  ) {}

  public async run() {
    try {
      const data = await this.handler();

      this.doneFn(null, data);
    } catch (error) {
      this.doneFn(error);
    } finally {
      this.isDone = true;
    }
  }
}

class Queue {
  protected logger = new PinoLogger();
  protected eventEmitter = new EventEmitter();

  public isRunning: boolean = false;
  public tasks: Task[] = [];

  protected _interval: any;

  constructor(protected queueName: string) {}

  public onExhausted(callback: any) {
    this.eventEmitter.once("exhausted", callback);
  }

  protected async runNextTask(): Promise<void> {
    try {
      const taskToRun = this.tasks.shift();
      if (!taskToRun) {
        this.isRunning = false;

        this.eventEmitter.emit("exhausted");

        return;
      }

      // Execute the task
      await taskToRun.run();

      // Run next task
      // Don't want to block the callstack.
      setTimeout(this.runNextTask.bind(this), 0);
    } catch (error: any) {
      this.logger.error(error.message, error.stack);

      setTimeout(this.runNextTask.bind(this), 0);
    }
  }

  protected async run(): Promise<void> {
    // The queue is running, don't start new loop
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;

    // Task queue is exhausted. Start new loop
    await this.runNextTask();
  }

  public add(task: Task): void {
    this.tasks.push(task);

    this.run();
  }
}

export class SyncTaskQueue implements TaskQueue {
  protected logger = new PinoLogger();
  protected queueList: Map<string, Queue> = new Map();

  public push<T>(queueName: string, name: string, handler: any): Promise<T> {
    const queue = this.queueList.get(queueName) || new Queue(queueName);

    return new Promise((resolve, reject) => {
      const doneFn = (err: Error | null, data: T) => {
        if (err) {
          reject(err);

          return;
        }

        resolve(data);
      };

      const task = new Task(name, handler, doneFn);

      queue.add(task);

      if (!this.queueList.has(queueName)) {
        this.queueList.set(queueName, queue);

        // Once the queue is exhausted, delete the queue to save memory
        queue.onExhausted(() => {
          this.queueList.delete(queueName);
        });
      }
    });
  }
}
