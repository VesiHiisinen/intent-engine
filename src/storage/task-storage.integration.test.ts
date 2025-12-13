import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { loadTasks, saveTasks, addTask, markDone, listTasks } from './task-storage.js';
import type { Task } from './types.js';

describe('integration: Task Storage', () => {
  const originalDataDir = path.resolve(process.cwd(), 'data');
  const tasksFile = path.join(originalDataDir, 'tasks.json');

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    // Ensure data directory exists
    await fs.mkdir(originalDataDir, { recursive: true });
    // Clear tasks file before each test
    try {
      await fs.unlink(tasksFile);
    } catch {
      // File doesn't exist, that's fine
    }
  });

  afterEach(async () => {
    // Clean up tasks file after each test
    try {
      await fs.unlink(tasksFile);
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('loadTasks', () => {
    it('should create empty tasks.json on first run', async () => {
      const tasks = await loadTasks();

      expect(tasks).toEqual([]);
      expect(Array.isArray(tasks)).toBe(true);
    });

    it('should load existing tasks from file', async () => {
      await addTask('Task 1', 'low');
      await addTask('Task 2', 'high');

      const tasks = await loadTasks();

      expect(tasks).toHaveLength(2);
      expect(tasks[0]?.text).toBe('Task 1');
      expect(tasks[1]?.text).toBe('Task 2');
    });

    it('should return empty array when file is empty', async () => {
      await saveTasks([]);
      const tasks = await loadTasks();

      expect(tasks).toEqual([]);
    });
  });

  describe('saveTasks', () => {
    it('should save tasks to file with proper structure', async () => {
      const task: Task = {
        id: 'test-id',
        text: 'Test task',
        status: 'pending',
        energy: 'medium',
        createdAt: new Date().toISOString(),
        skipCount: 0,
        history: [],
      };

      await saveTasks([task]);

      const tasks = await loadTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.id).toBe('test-id');
      expect(tasks[0]?.text).toBe('Test task');
    });

    it('should overwrite existing tasks', async () => {
      await addTask('Task 1');
      await addTask('Task 2');

      const newTask: Task = {
        id: 'new-id',
        text: 'New task',
        status: 'pending',
        energy: 'high',
        createdAt: new Date().toISOString(),
        skipCount: 0,
        history: [],
      };

      await saveTasks([newTask]);

      const tasks = await loadTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.text).toBe('New task');
    });
  });

  describe('addTask', () => {
    it('should add a new task with generated UUID', async () => {
      const task = await addTask('Write tests');

      expect(task.id).toBeDefined();
      expect(task.id.length).toBeGreaterThan(0);
      expect(task.text).toBe('Write tests');
    });

    it('should set default energy to medium', async () => {
      const task = await addTask('Default energy task');

      expect(task.energy).toBe('medium');
    });

    it('should accept custom energy level', async () => {
      const lowTask = await addTask('Low energy task', 'low');
      const highTask = await addTask('High energy task', 'high');

      expect(lowTask.energy).toBe('low');
      expect(highTask.energy).toBe('high');
    });

    it('should set initial status to pending', async () => {
      const task = await addTask('New task');

      expect(task.status).toBe('pending');
    });

    it('should set createdAt timestamp', async () => {
      const before = new Date().toISOString();
      const task = await addTask('Task with timestamp');
      const after = new Date().toISOString();

      expect(task.createdAt).toBeDefined();
      expect(task.createdAt >= before).toBe(true);
      expect(task.createdAt <= after).toBe(true);
    });

    it('should initialize skipCount to 0', async () => {
      const task = await addTask('Task');

      expect(task.skipCount).toBe(0);
    });

    it('should add created history entry', async () => {
      const task = await addTask('Task with history');

      expect(task.history).toHaveLength(1);
      expect(task.history[0]?.action).toBe('created');
      expect(task.history[0]?.timestamp).toBeDefined();
    });

    it('should persist task to storage', async () => {
      await addTask('Persisted task');

      const tasks = await loadTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.text).toBe('Persisted task');
    });

    it('should append to existing tasks', async () => {
      await addTask('Task 1');
      await addTask('Task 2');
      await addTask('Task 3');

      const tasks = await loadTasks();
      expect(tasks).toHaveLength(3);
    });

    it('should generate unique IDs for each task', async () => {
      const task1 = await addTask('Task 1');
      const task2 = await addTask('Task 2');
      const task3 = await addTask('Task 3');

      expect(task1.id).not.toBe(task2.id);
      expect(task2.id).not.toBe(task3.id);
      expect(task1.id).not.toBe(task3.id);
    });
  });

  describe('markDone', () => {
    it('should update task status to done', async () => {
      const task = await addTask('Complete me');
      const updated = await markDone(task.id);

      expect(updated).not.toBeNull();
      expect(updated?.status).toBe('done');
    });

    it('should set completedAt timestamp', async () => {
      const task = await addTask('Task to complete');
      const before = new Date().toISOString();
      const updated = await markDone(task.id);
      const after = new Date().toISOString();

      expect(updated?.completedAt).toBeDefined();
      expect(updated!.completedAt! >= before).toBe(true);
      expect(updated!.completedAt! <= after).toBe(true);
    });

    it('should add completed history entry', async () => {
      const task = await addTask('Task');
      const updated = await markDone(task.id);

      expect(updated?.history).toHaveLength(2);
      expect(updated?.history[0]?.action).toBe('created');
      expect(updated?.history[1]?.action).toBe('completed');
    });

    it('should persist changes to storage', async () => {
      const task = await addTask('Task');
      await markDone(task.id);

      const tasks = await loadTasks();
      const found = tasks.find(t => t.id === task.id);

      expect(found?.status).toBe('done');
      expect(found?.completedAt).toBeDefined();
    });

    it('should return null for non-existent task', async () => {
      const result = await markDone('non-existent-id');

      expect(result).toBeNull();
    });

    it('should handle marking already completed task', async () => {
      const task = await addTask('Task');
      await markDone(task.id);
      const updated = await markDone(task.id);

      expect(updated?.status).toBe('done');
      expect(updated?.history).toHaveLength(3);
    });
  });

  describe('listTasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const tasks = await listTasks();

      expect(tasks).toEqual([]);
    });

    it('should return all tasks', async () => {
      await addTask('Task 1');
      await addTask('Task 2');
      await addTask('Task 3');

      const tasks = await listTasks();

      expect(tasks).toHaveLength(3);
    });

    it('should return tasks with all properties', async () => {
      const task = await addTask('Full task', 'high');
      await markDone(task.id);

      const tasks = await listTasks();
      const found = tasks.find(t => t.id === task.id);

      expect(found?.id).toBeDefined();
      expect(found?.text).toBe('Full task');
      expect(found?.status).toBe('done');
      expect(found?.energy).toBe('high');
      expect(found?.createdAt).toBeDefined();
      expect(found?.completedAt).toBeDefined();
      expect(found?.skipCount).toBe(0);
      expect(found?.history.length).toBeGreaterThan(0);
    });

    it('should return both pending and done tasks', async () => {
      await addTask('Pending task');
      const taskTwo = await addTask('Done task');
      await markDone(taskTwo.id);

      const tasks = await listTasks();

      expect(tasks).toHaveLength(2);
      expect(tasks.some(t => t.status === 'pending')).toBe(true);
      expect(tasks.some(t => t.status === 'done')).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete task lifecycle', async () => {
      const task = await addTask('Lifecycle task', 'medium');
      expect(task.status).toBe('pending');
      expect(task.history).toHaveLength(1);

      const completed = await markDone(task.id);
      expect(completed?.status).toBe('done');
      expect(completed?.history).toHaveLength(2);

      const tasks = await listTasks();
      const found = tasks.find(t => t.id === task.id);
      expect(found?.status).toBe('done');
    });

    it('should maintain data integrity across operations', async () => {
      const taskOne = await addTask('Task 1', 'low');
      const taskTwo = await addTask('Task 2', 'high');
      await markDone(taskOne.id);

      const tasks = await listTasks();

      expect(tasks).toHaveLength(2);
      expect(tasks.find(t => t.id === taskOne.id)?.status).toBe('done');
      expect(tasks.find(t => t.id === taskTwo.id)?.status).toBe('pending');
    });

    it('should preserve task order', async () => {
      const task1 = await addTask('First');
      const task2 = await addTask('Second');
      const task3 = await addTask('Third');

      const tasks = await listTasks();

      expect(tasks[0]?.id).toBe(task1.id);
      expect(tasks[1]?.id).toBe(task2.id);
      expect(tasks[2]?.id).toBe(task3.id);
    });
  });
});
