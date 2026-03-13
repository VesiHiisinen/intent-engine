import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { Task, TaskDatabase, EnergyLevel } from './types.js';

function getDataDir(): string {
  return path.resolve(process.cwd(), process.env.TASKS_DATA_DIR ?? 'data');
}

function getTasksFile(): string {
  return path.join(getDataDir(), 'tasks.json');
}

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(getDataDir(), { recursive: true });
}

function createEmptyDatabase(): TaskDatabase {
  return {
    version: 1,
    tasks: [],
  };
}

export async function loadTasks(): Promise<Task[]> {
  await ensureDataDir();

  try {
    const data = await fs.readFile(getTasksFile(), 'utf-8');
    const db: TaskDatabase = JSON.parse(data);
    return db.tasks;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      const emptyDb = createEmptyDatabase();
      await fs.writeFile(getTasksFile(), JSON.stringify(emptyDb, null, 2));
      return [];
    }
    throw error;
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await ensureDataDir();

  const db: TaskDatabase = {
    version: 1,
    tasks,
  };

  await fs.writeFile(getTasksFile(), JSON.stringify(db, null, 2));
}

export async function addTask(
  text: string,
  energy: EnergyLevel = 'medium'
): Promise<Task> {
  const tasks = await loadTasks();

  const now = new Date().toISOString();
  const newTask: Task = {
    id: randomUUID(),
    text,
    energy,
    status: 'pending',
    createdAt: now,
    skipCount: 0,
    history: [
      {
        timestamp: now,
        action: 'created',
      },
    ],
  };

  tasks.push(newTask);
  await saveTasks(tasks);

  return newTask;
}

export async function markDone(id: string): Promise<Task | null> {
  const tasks = await loadTasks();
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return null;
  }

  const now = new Date().toISOString();
  task.status = 'done';
  task.completedAt = now;
  task.history.push({
    timestamp: now,
    action: 'completed',
  });

  await saveTasks(tasks);
  return task;
}

export async function listTasks(): Promise<Task[]> {
  return await loadTasks();
}
