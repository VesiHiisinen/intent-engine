import cron from 'node-cron';
import { listTasks } from '../storage/index.js';
import { TaskSelector } from '../llm/task-selector.js';
import {
  saveDailySelection,
  loadProgressHistory,
  todayDateString,
} from '../daily-selection/selection-storage.js';
import type { DailySelection } from '../daily-selection/types.js';
import type { IMessagingTransport } from '../messaging/core/types.js';
import { MessageFormatter } from '../messaging/core/formatter.js';

export class DailyScheduler {
  private readonly transport: IMessagingTransport;
  private readonly chatId: string;
  private readonly selector: TaskSelector;
  private cronJob: ReturnType<typeof cron.schedule> | null = null;

  constructor(transport: IMessagingTransport, chatId: string, selector?: TaskSelector) {
    this.transport = transport;
    this.chatId = chatId;
    this.selector = selector ?? new TaskSelector();
  }

  /**
   * Run the daily intent selection and send to Telegram immediately.
   * Called by the cron job and can also be triggered manually.
   */
  async runDailyIntent(): Promise<void> {
    console.log('[Scheduler] Running daily intent selection...');

    try {
      const tasks = await listTasks();
      const history = await loadProgressHistory();
      const selectedIds = await this.selector.selectTasks(tasks, history);

      if (selectedIds.length === 0) {
        await this.transport.sendMessage(
          this.chatId,
          '📋 No pending tasks found. Add some tasks first!\n\nUse `+ your task` to add a task.'
        );
        return;
      }

      const selectedTasks = selectedIds
        .map(id => tasks.find(t => t.id === id))
        .filter((t): t is NonNullable<typeof t> => t !== undefined);

      // Persist the daily selection
      const selection: DailySelection = {
        date: todayDateString(),
        taskIds: selectedIds,
        selectedAt: new Date().toISOString(),
        completedTaskIds: [],
      };
      await saveDailySelection(selection);

      // Mark tasks as selected in storage
      const now = new Date().toISOString();
      for (const task of selectedTasks) {
        task.lastSelectedAt = now;
        task.history.push({ timestamp: now, action: 'selected' });
      }
      // Re-save with updated lastSelectedAt
      const { saveTasks } = await import('../storage/index.js');
      await saveTasks(tasks);

      // Send the daily message
      const message = MessageFormatter.dailyIntent(selectedTasks);
      await this.transport.sendMessage(this.chatId, message);

      console.log(`[Scheduler] Daily intent delivered. Tasks: ${selectedIds.join(', ')}`);
    } catch (error) {
      console.error('[Scheduler] Failed to run daily intent:', error);
      await this.transport.sendMessage(
        this.chatId,
        '❌ Failed to generate daily intent. Check the logs.'
      );
    }
  }

  /**
   * Start the cron job. Fires at the time specified by DAILY_INTENT_TIME env var (default 08:00).
   * Timezone from TIMEZONE env var (default Europe/Helsinki).
   */
  start(): void {
    const timeStr = process.env.DAILY_INTENT_TIME ?? '08:00';
    const timezone = process.env.TIMEZONE ?? 'Europe/Helsinki';
    const [hour, minute] = timeStr.split(':').map(Number);

    const cronExpression = `${minute ?? 0} ${hour ?? 8} * * *`;

    console.log(`[Scheduler] Scheduling daily intent at ${timeStr} (${timezone}) — cron: ${cronExpression}`);

    this.cronJob = cron.schedule(
      cronExpression,
      async () => {
        await this.runDailyIntent();
      },
      { timezone }
    );
  }

  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log('[Scheduler] Cron job stopped.');
    }
  }
}
