import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskService } from './task-service.js';
import { TaskNotFoundError } from './errors.js';
import type { Task } from '../../storage/types.js';

// Mock the storage module
vi.mock('../../storage/index.js', () => ({
  addTask: vi.fn(),
  markDone: vi.fn(),
  listTasks: vi.fn(),
}));

import { addTask, markDone, listTasks } from '../../storage/index.js';

describe('unit: TaskService', () => {
  let service: TaskService;

  const mockTask: Task = {
    id: 'test-id-123',
    text: 'Test task',
    status: 'pending',
    energy: 'medium',
    createdAt: '2025-12-13T00:00:00.000Z',
    skipCount: 0,
    history: [],
  };

  beforeEach(() => {
    service = new TaskService();
    vi.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create task with default energy', async () => {
      vi.mocked(addTask).mockResolvedValue(mockTask);

      const task = await service.createTask('Test task');

      expect(addTask).toHaveBeenCalledWith('Test task', 'medium');
      expect(task).toEqual(mockTask);
    });

    it('should create task with specified energy', async () => {
      const highEnergyTask = { ...mockTask, energy: 'high' as const };
      vi.mocked(addTask).mockResolvedValue(highEnergyTask);

      const task = await service.createTask('High energy task', 'high');

      expect(addTask).toHaveBeenCalledWith('High energy task', 'high');
      expect(task.energy).toBe('high');
    });
  });

  describe('completeTask', () => {
    it('should complete task by ID', async () => {
      const completedTask = { ...mockTask, status: 'done' as const, completedAt: '2025-12-13T01:00:00.000Z' };
      vi.mocked(markDone).mockResolvedValue(completedTask);

      const task = await service.completeTask('test-id-123');

      expect(markDone).toHaveBeenCalledWith('test-id-123');
      expect(task.status).toBe('done');
      expect(task.completedAt).toBeDefined();
    });

    it('should throw TaskNotFoundError when task not found', async () => {
      vi.mocked(markDone).mockResolvedValue(null);

      await expect(service.completeTask('invalid-id')).rejects.toThrow(TaskNotFoundError);
      expect(markDone).toHaveBeenCalledWith('invalid-id');
    });
  });

  describe('completeTaskByIndex', () => {
    it('should complete task by index', async () => {
      const tasks = [
        { ...mockTask, id: '1', text: 'Task 1' },
        { ...mockTask, id: '2', text: 'Task 2' },
        { ...mockTask, id: '3', text: 'Task 3' },
      ];
      const completedTask = { ...tasks[1], status: 'done' as const };

      vi.mocked(listTasks).mockResolvedValue(tasks);
      vi.mocked(markDone).mockResolvedValue(completedTask);

      const task = await service.completeTaskByIndex(1);

      expect(listTasks).toHaveBeenCalled();
      expect(markDone).toHaveBeenCalledWith('2');
      expect(task.text).toBe('Task 2');
    });

    it('should throw TaskNotFoundError for invalid index', async () => {
      vi.mocked(listTasks).mockResolvedValue([mockTask]);

      await expect(service.completeTaskByIndex(10)).rejects.toThrow(TaskNotFoundError);
    });

    it('should handle zero index', async () => {
      const completedTask = { ...mockTask, status: 'done' as const };
      vi.mocked(listTasks).mockResolvedValue([mockTask]);
      vi.mocked(markDone).mockResolvedValue(completedTask);

      const task = await service.completeTaskByIndex(0);

      expect(markDone).toHaveBeenCalledWith(mockTask.id);
      expect(task.id).toBe(mockTask.id);
    });
  });

  describe('getAllTasks', () => {
    it('should return empty array when no tasks', async () => {
      vi.mocked(listTasks).mockResolvedValue([]);

      const tasks = await service.getAllTasks();

      expect(tasks).toEqual([]);
      expect(listTasks).toHaveBeenCalled();
    });

    it('should return all tasks', async () => {
      const tasks = [
        { ...mockTask, id: '1', text: 'Task 1' },
        { ...mockTask, id: '2', text: 'Task 2' },
      ];
      vi.mocked(listTasks).mockResolvedValue(tasks);

      const result = await service.getAllTasks();

      expect(result).toHaveLength(2);
      expect(listTasks).toHaveBeenCalled();
    });
  });

  describe('getPendingTasks', () => {
    it('should return only pending tasks', async () => {
      const tasks = [
        { ...mockTask, id: '1', status: 'pending' as const },
        { ...mockTask, id: '2', status: 'done' as const },
        { ...mockTask, id: '3', status: 'pending' as const },
      ];
      vi.mocked(listTasks).mockResolvedValue(tasks);

      const pending = await service.getPendingTasks();

      expect(pending).toHaveLength(2);
      expect(pending.every(t => t.status === 'pending')).toBe(true);
      expect(listTasks).toHaveBeenCalled();
    });

    it('should return empty array when all tasks completed', async () => {
      const tasks = [
        { ...mockTask, id: '1', status: 'done' as const },
        { ...mockTask, id: '2', status: 'done' as const },
      ];
      vi.mocked(listTasks).mockResolvedValue(tasks);

      const pending = await service.getPendingTasks();

      expect(pending).toEqual([]);
    });
  });

  describe('getTaskCount', () => {
    it('should return correct counts', async () => {
      const tasks = [
        { ...mockTask, id: '1', status: 'pending' as const },
        { ...mockTask, id: '2', status: 'pending' as const },
        { ...mockTask, id: '3', status: 'done' as const },
      ];
      vi.mocked(listTasks).mockResolvedValue(tasks);

      const counts = await service.getTaskCount();

      expect(counts.total).toBe(3);
      expect(counts.pending).toBe(2);
      expect(counts.done).toBe(1);
      expect(listTasks).toHaveBeenCalled();
    });

    it('should return zeros for empty task list', async () => {
      vi.mocked(listTasks).mockResolvedValue([]);

      const counts = await service.getTaskCount();

      expect(counts.total).toBe(0);
      expect(counts.pending).toBe(0);
      expect(counts.done).toBe(0);
    });
  });
});
