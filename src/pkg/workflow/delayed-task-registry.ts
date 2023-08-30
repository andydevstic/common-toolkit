import { DelayedTaskOps, ITask, TaskRegistry } from "../../interfaces";
import { DelayedTask } from "./delayed-task";

export class DelayedTaskRegistry implements TaskRegistry {
  protected taskRegistry = new Map<string, ITask>();

  public async register(options: DelayedTaskOps): Promise<ITask> {
    const delayedTask = new DelayedTask(options);

    this.taskRegistry.set(delayedTask.id, delayedTask);

    return delayedTask;
  }

  public async count(): Promise<number> {
    return this.taskRegistry.size;
  }

  public async getTasks(): Promise<ITask[]> {
    return Object.values(this.taskRegistry);
  }

  public async getTaskById(id: string): Promise<ITask> {
    return this.taskRegistry.get(id);
  }

  public async cancelTaskById(id: string): Promise<void> {
    const task = this.taskRegistry.get(id);
    if (!task) {
      throw new Error(`task with id ${id} not exist`);
    }

    if (!task.isRunning) {
      return;
    }

    await task.cancel();

    this.taskRegistry.delete(id);
  }

  public async startTaskById(id: string): Promise<void> {
    const task = this.taskRegistry.get(id);
    if (!task) {
      throw new Error(`task with id ${id} not exist`);
    }

    if (task.isRunning) {
      return;
    }

    return task.start();
  }
}
