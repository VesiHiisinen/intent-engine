import { describe, it, expect } from 'vitest';
import { MessageFormatter } from './formatter.js';
import type { Task } from '../../storage/types.js';

describe('unit: Message Formatter', () => {
  const mockTask: Task = {
    id: 'test-id',
    text: 'Test task',
    status: 'pending',
    energy: 'medium',
    createdAt: '2025-12-13T00:00:00.000Z',
    skipCount: 0,
    history: [],
  };

  describe('taskList', () => {
    it('should return empty message for no tasks', () => {
      const result = MessageFormatter.taskList([]);
      expect(result).toContain('No tasks yet');
      expect(result).toContain('+ your task here');
    });

    it('should format single pending task', () => {
      const result = MessageFormatter.taskList([mockTask]);
      expect(result).toContain('1. ⏳ 🟡 Test task');
    });

    it('should format completed task', () => {
      const completedTask = { ...mockTask, status: 'done' as const };
      const result = MessageFormatter.taskList([completedTask]);
      expect(result).toContain('1. ✅ 🟡 Test task');
    });

    it('should format multiple tasks', () => {
      const tasks = [
        mockTask,
        { ...mockTask, id: '2', text: 'Second task', energy: 'high' as const },
      ];
      const result = MessageFormatter.taskList(tasks);
      expect(result).toContain('1. ⏳ 🟡 Test task');
      expect(result).toContain('2. ⏳ 🔴 Second task');
    });

    it('should show energy levels correctly', () => {
      const lowTask = { ...mockTask, energy: 'low' as const };
      const medTask = { ...mockTask, energy: 'medium' as const };
      const highTask = { ...mockTask, energy: 'high' as const };

      expect(MessageFormatter.taskList([lowTask])).toContain('🟢');
      expect(MessageFormatter.taskList([medTask])).toContain('🟡');
      expect(MessageFormatter.taskList([highTask])).toContain('🔴');
    });
  });

  describe('taskAdded', () => {
    it('should format task added message', () => {
      const result = MessageFormatter.taskAdded(mockTask);
      expect(result).toContain('Added');
      expect(result).toContain('Test task');
      expect(result).toContain('🟡');
    });

    it('should show correct energy emoji', () => {
      const highTask = { ...mockTask, energy: 'high' as const };
      const result = MessageFormatter.taskAdded(highTask);
      expect(result).toContain('🔴');
    });
  });

  describe('taskCompleted', () => {
    it('should format completion message', () => {
      const result = MessageFormatter.taskCompleted(mockTask);
      expect(result).toContain('Completed');
      expect(result).toContain('Test task');
      expect(result).toContain('🎉');
    });
  });

  describe('error', () => {
    it('should format error message', () => {
      const result = MessageFormatter.error('Something went wrong');
      expect(result).toContain('❌');
      expect(result).toContain('Something went wrong');
      expect(result).toContain('/help');
    });
  });

  describe('help', () => {
    it('should include all commands', () => {
      const result = MessageFormatter.help();
      expect(result).toContain('+ task description');
      expect(result).toContain('/alltasks');
      expect(result).toContain('/done');
      expect(result).toContain('/help');
    });
  });

  describe('welcome', () => {
    it('should include welcome message', () => {
      const result = MessageFormatter.welcome();
      expect(result).toContain('Welcome');
      expect(result).toContain('Daily Intent Engine');
      expect(result).toContain('Get started');
    });
  });

  describe('dailyIntent', () => {
    it('should format daily intent message', () => {
      const tasks = [mockTask, { ...mockTask, id: '2', text: 'Task 2' }];
      const result = MessageFormatter.dailyIntent(tasks);
      expect(result).toContain('Good morning');
      expect(result).toContain('1. Test task');
      expect(result).toContain('2. Task 2');
      expect(result).toContain('/done');
    });
  });
});
