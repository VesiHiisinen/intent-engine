import type { Task } from '../../storage/types.js';

export class MessageFormatter {
  static taskList(tasks: Task[]): string {
    if (tasks.length === 0) {
      return '📋 *No tasks yet!*\n\nAdd one with: `+ your task here`';
    }

    const lines = tasks.map((task, idx) => {
      const status = task.status === 'done' ? '✅' : '⏳';
      const energy = { low: '🟢', medium: '🟡', high: '🔴' }[task.energy];
      return `${idx + 1}. ${status} ${energy} ${task.text}`;
    });

    return '📋 *Your Tasks:*\n\n' + lines.join('\n');
  }

  static dailyIntent(tasks: Task[]): string {
    const ritualName = process.env.RITUAL_NAME ?? 'Daily Directive';
    const today = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const taskLines = tasks.map((t, i) => {
      const mins = t.estimatedMinutes ? ` (${t.estimatedMinutes} min)` : '';
      return `${i + 1}. ${t.text}${mins}`;
    });

    return [
      `📜 *${ritualName} — ${today}*`,
      '',
      ...taskLines,
      '',
      'Reply `/done <number>` when you complete a task.',
    ].join('\n');
  }

  static taskAdded(task: Task): string {
    const energy = { low: '🟢', medium: '🟡', high: '🔴' }[task.energy];
    return `✅ *Added:* ${energy} "${task.text}"`;
  }

  static taskCompleted(task: Task, completedCount: number, totalCount: number): string {
    const remaining = totalCount - completedCount;
    const dopamine = (completedCount * 0.25).toFixed(2);
    const remainingLine =
      remaining > 0
        ? `${remaining} task${remaining > 1 ? 's' : ''} remaining.`
        : 'All tasks complete. Outstanding.';

    return [
      `✅ *"${task.text}"* — done.`,
      '',
      `Progress recorded. dopamine += ${dopamine} 🧠`,
      remainingLine,
    ].join('\n');
  }

  static noActiveMission(): string {
    return [
      '📭 No active mission today.',
      '',
      'The daily intent has not been sent yet, or all tasks are complete.',
      'Use `/alltasks` to see all pending tasks.',
    ].join('\n');
  }

  static taskNotInMission(taskNumber: number): string {
    return `❌ Task ${taskNumber} is not part of today's mission.\n\nUse \`/today\` to see your current tasks.`;
  }

  static todayMission(tasks: Task[], completedIds: string[]): string {
    if (tasks.length === 0) {
      return '📭 No mission active today. Check back tomorrow!';
    }

    const lines = tasks.map((t, i) => {
      const done = completedIds.includes(t.id);
      const status = done ? '✅' : '⬜';
      return `${i + 1}. ${status} ${t.text}`;
    });

    const completedCount = completedIds.length;
    const totalCount = tasks.length;

    return [
      `📜 *Today's Mission* (${completedCount}/${totalCount} complete):`,
      '',
      ...lines,
      '',
      'Reply `/done <number>` to mark a task complete.',
    ].join('\n');
  }

  static error(message: string): string {
    return `❌ ${message}\n\nType /help for available commands.`;
  }

  static help(): string {
    return [
      '🤖 *Daily Intent Engine Commands:*',
      '',
      '`+ task description` - Add a new task',
      '`/today` - Show today\'s mission',
      '`/done <number>` - Mark today\'s task as complete',
      '`/alltasks` - Show all pending tasks',
      '`/help` - Show this help message',
    ].join('\n');
  }

  static welcome(): string {
    return [
      '👋 *Welcome to Daily Intent Engine!*',
      '',
      'I help you focus on 2-3 meaningful tasks per day.',
      '',
      '📝 *Get started:*',
      '• Add a task: `+ write tests`',
      '• View today\'s mission: `/today`',
      '• Complete task: `/done 1`',
      '',
      'Need help? Type `/help`',
    ].join('\n');
  }
}
