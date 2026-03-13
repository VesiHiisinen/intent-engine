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
    return [
      '🌅 *Good morning!* Here\'s your focus for today:',
      '',
      ...tasks.map((t, i) => `${i + 1}. ${t.text} (${t.energy} energy)`),
      '',
      'Reply `/done 1` when you complete a task!',
    ].join('\n');
  }

  static taskAdded(task: Task): string {
    const energy = { low: '🟢', medium: '🟡', high: '🔴' }[task.energy];
    return `✅ *Added:* ${energy} "${task.text}"`;
  }

  static taskCompleted(task: Task): string {
    return `🎉 *Completed:* "${task.text}"\n\nGreat work! Keep it up!`;
  }

  static error(message: string): string {
    return `❌ ${message}\n\nType /help for available commands.`;
  }

  static help(): string {
    return [
      '🤖 *Daily Intent Engine Commands:*',
      '',
      '`+ task description` - Add a new task',
      '`/alltasks` - Show all pending tasks',
      '`/done <number>` - Mark task as complete',
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
      '• View tasks: `/alltasks`',
      '• Complete task: `/done 1`',
      '',
      'Need help? Type `/help`',
    ].join('\n');
  }
}
