import { describe, it, expect } from 'vitest';
import type { Task, TaskHistoryEntry, TaskDatabase, TaskStatus, EnergyLevel, HistoryAction } from './types.js';

describe('unit: Storage Types', () => {
  describe('TaskStatus', () => {
    it('should accept valid task statuses', () => {
      const validStatuses: TaskStatus[] = ['pending', 'done', 'archived'];
      expect(validStatuses).toHaveLength(3);
    });
  });

  describe('EnergyLevel', () => {
    it('should accept valid energy levels', () => {
      const validLevels: EnergyLevel[] = ['low', 'medium', 'high'];
      expect(validLevels).toHaveLength(3);
    });
  });

  describe('HistoryAction', () => {
    it('should accept valid history actions', () => {
      const validActions: HistoryAction[] = [
        'created',
        'selected',
        'skipped',
        'completed',
        'edited',
        'archived',
      ];
      expect(validActions).toHaveLength(6);
    });
  });

  describe('TaskHistoryEntry', () => {
    it('should create valid history entry with required fields', () => {
      const entry: TaskHistoryEntry = {
        timestamp: '2025-12-13T10:00:00.000Z',
        action: 'created',
      };

      expect(entry.timestamp).toBe('2025-12-13T10:00:00.000Z');
      expect(entry.action).toBe('created');
      expect(entry.note).toBeUndefined();
    });

    it('should create valid history entry with optional note', () => {
      const entry: TaskHistoryEntry = {
        timestamp: '2025-12-13T10:00:00.000Z',
        action: 'completed',
        note: 'Felt great!',
      };

      expect(entry.note).toBe('Felt great!');
    });
  });

  describe('Task', () => {
    it('should create valid task with all required fields', () => {
      const task: Task = {
        id: 'test-uuid-123',
        text: 'Write unit tests',
        status: 'pending',
        energy: 'medium',
        createdAt: '2025-12-13T10:00:00.000Z',
        skipCount: 0,
        history: [
          {
            timestamp: '2025-12-13T10:00:00.000Z',
            action: 'created',
          },
        ],
      };

      expect(task.id).toBe('test-uuid-123');
      expect(task.text).toBe('Write unit tests');
      expect(task.status).toBe('pending');
      expect(task.energy).toBe('medium');
      expect(task.createdAt).toBe('2025-12-13T10:00:00.000Z');
      expect(task.skipCount).toBe(0);
      expect(task.history).toHaveLength(1);
    });

    it('should create valid task with optional fields', () => {
      const task: Task = {
        id: 'test-uuid-456',
        text: 'Complex task',
        status: 'pending',
        energy: 'high',
        createdAt: '2025-12-13T10:00:00.000Z',
        lastSelectedAt: '2025-12-13T11:00:00.000Z',
        lastSkippedAt: '2025-12-13T12:00:00.000Z',
        completedAt: '2025-12-13T13:00:00.000Z',
        skipCount: 2,
        estimatedMinutes: 45,
        tags: ['mental', 'creative'],
        history: [],
      };

      expect(task.lastSelectedAt).toBe('2025-12-13T11:00:00.000Z');
      expect(task.lastSkippedAt).toBe('2025-12-13T12:00:00.000Z');
      expect(task.completedAt).toBe('2025-12-13T13:00:00.000Z');
      expect(task.estimatedMinutes).toBe(45);
      expect(task.tags).toEqual(['mental', 'creative']);
    });

    it('should support task lifecycle through status changes', () => {
      const statuses: TaskStatus[] = ['pending', 'done', 'archived'];

      statuses.forEach(status => {
        const task: Task = {
          id: 'test',
          text: 'test',
          status,
          energy: 'medium',
          createdAt: new Date().toISOString(),
          skipCount: 0,
          history: [],
        };

        expect(task.status).toBe(status);
      });
    });

    it('should support all energy levels', () => {
      const energyLevels: EnergyLevel[] = ['low', 'medium', 'high'];

      energyLevels.forEach(energy => {
        const task: Task = {
          id: 'test',
          text: 'test',
          status: 'pending',
          energy,
          createdAt: new Date().toISOString(),
          skipCount: 0,
          history: [],
        };

        expect(task.energy).toBe(energy);
      });
    });
  });

  describe('TaskDatabase', () => {
    it('should create valid database with version and tasks', () => {
      const db: TaskDatabase = {
        version: 1,
        tasks: [],
      };

      expect(db.version).toBe(1);
      expect(db.tasks).toEqual([]);
    });

    it('should store multiple tasks', () => {
      const task1: Task = {
        id: '1',
        text: 'Task 1',
        status: 'pending',
        energy: 'low',
        createdAt: '2025-12-13T10:00:00.000Z',
        skipCount: 0,
        history: [],
      };

      const task2: Task = {
        id: '2',
        text: 'Task 2',
        status: 'done',
        energy: 'high',
        createdAt: '2025-12-13T11:00:00.000Z',
        skipCount: 0,
        history: [],
      };

      const db: TaskDatabase = {
        version: 1,
        tasks: [task1, task2],
      };

      expect(db.tasks).toHaveLength(2);
      expect(db.tasks[0]?.id).toBe('1');
      expect(db.tasks[1]?.id).toBe('2');
    });
  });
});
