import { addTask, markDone, listTasks } from '../../storage/index.js';
import type { Task, EnergyLevel } from '../../storage/types.js';
import { TaskNotFoundError } from './errors.js';

export class TaskService {
  async createTask(text: string, energy: EnergyLevel = 'medium'): Promise<Task> {
    return await addTask(text, energy);
  }

  async completeTask(id: string): Promise<Task> {
    const task = await markDone(id);
    if (!task) {
      throw new TaskNotFoundError(id);
    }
    return task;
  }

  async completeTaskByIndex(index: number): Promise<Task> {
    const tasks = await this.getPendingTasks();
    const task = tasks[index];

    if (!task) {
      throw new TaskNotFoundError(`index ${index}`);
    }

    return await this.completeTask(task.id);
  }

  async getAllTasks(): Promise<Task[]> {
    return await listTasks();
  }

  async getPendingTasks(): Promise<Task[]> {
    const tasks = await listTasks();
    return tasks.filter(t => t.status === 'pending');
  }

  async getTaskCount(): Promise<{ total: number; pending: number; done: number }> {
    const tasks = await listTasks();
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      done: tasks.filter(t => t.status === 'done').length,
    };
  }
}
