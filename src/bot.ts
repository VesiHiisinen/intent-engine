import 'dotenv/config';
import { TelegramTransport } from './messaging/adapters/telegram/client.js';
import { TaskService } from './messaging/core/task-service.js';
import { MessageFormatter } from './messaging/core/formatter.js';
import { MessagingError, MissingArgumentError } from './messaging/core/errors.js';
import {
  getTodaySelection,
  markTaskDoneInSelection,
  appendProgressEntry,
  todayDateString,
} from './daily-selection/selection-storage.js';
import { listTasks } from './storage/index.js';
import { DailyScheduler } from './scheduler/daily-scheduler.js';

export async function startBot(): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');

  const chatId = process.env.TELEGRAM_CHAT_ID ?? '';
  if (!chatId) {
    console.warn('[Bot] TELEGRAM_CHAT_ID not set — scheduled messages will not be sent.');
  }

  console.log('[Bot] Initializing Daily Intent Engine...\n');

  const bot = new TelegramTransport(token);
  const taskService = new TaskService();
  const scheduler = new DailyScheduler(bot, chatId);

  // /start
  bot.onCommand('start', async (msg) => {
    await bot.sendMessage(msg.chatId, MessageFormatter.welcome());
  });

  // /add <text>  OR  + <text>
  bot.onCommand('add', async (msg, args) => {
    try {
      const text = args.join(' ').trim();
      if (!text) throw new MissingArgumentError('task text');
      const task = await taskService.createTask(text);
      await bot.sendMessage(msg.chatId, MessageFormatter.taskAdded(task));
    } catch (error) {
      if (error instanceof MessagingError) {
        await bot.sendMessage(msg.chatId, MessageFormatter.error(error.message));
      } else throw error;
    }
  });

  // /today — show today's active mission
  bot.onCommand('today', async (msg) => {
    try {
      const selection = await getTodaySelection();
      if (!selection) {
        await bot.sendMessage(msg.chatId, MessageFormatter.noActiveMission());
        return;
      }

      const allTasks = await listTasks();
      const missionTasks = selection.taskIds
        .map(id => allTasks.find(t => t.id === id))
        .filter((t): t is NonNullable<typeof t> => t !== undefined);

      await bot.sendMessage(
        msg.chatId,
        MessageFormatter.todayMission(missionTasks, selection.completedTaskIds)
      );
    } catch (error) {
      console.error('[Bot] Error showing today:', error);
      await bot.sendMessage(msg.chatId, MessageFormatter.error('Failed to load today\'s mission.'));
    }
  });

  // /alltasks — show all pending tasks
  bot.onCommand('alltasks', async (msg) => {
    try {
      const tasks = await taskService.getPendingTasks();
      await bot.sendMessage(msg.chatId, MessageFormatter.taskList(tasks));
    } catch (error) {
      console.error('[Bot] Error listing tasks:', error);
      await bot.sendMessage(msg.chatId, MessageFormatter.error('Failed to load tasks.'));
    }
  });

  // /done <number> — mark a specific task from TODAY'S MISSION as done
  bot.onCommand('done', async (msg, args) => {
    try {
      const firstArg = args[0];
      if (!firstArg) throw new MissingArgumentError('task number (e.g., /done 1)');

      const taskNum = parseInt(firstArg, 10);
      if (isNaN(taskNum) || taskNum < 1) {
        throw new MissingArgumentError('valid task number (e.g., /done 1)');
      }

      const selection = await getTodaySelection();
      if (!selection) {
        await bot.sendMessage(msg.chatId, MessageFormatter.noActiveMission());
        return;
      }

      const taskIndex = taskNum - 1;
      const taskId = selection.taskIds[taskIndex];
      if (!taskId) {
        await bot.sendMessage(msg.chatId, MessageFormatter.taskNotInMission(taskNum));
        return;
      }

      // Mark done in storage
      const task = await taskService.completeTask(taskId);

      // Mark done in daily selection and get updated counts
      const updatedSelection = await markTaskDoneInSelection(taskId);
      const completedCount = updatedSelection?.completedTaskIds.length ?? 1;
      const totalCount = selection.taskIds.length;

      await bot.sendMessage(
        msg.chatId,
        MessageFormatter.taskCompleted(task, completedCount, totalCount)
      );

      // Append to progress log when all tasks for today are done
      if (updatedSelection && completedCount === totalCount) {
        await appendProgressEntry({
          date: todayDateString(),
          selectedTaskIds: updatedSelection.taskIds,
          completedTaskIds: updatedSelection.completedTaskIds,
          completedAt: new Date().toISOString(),
          completionCount: completedCount,
        });
      }
    } catch (error) {
      if (error instanceof MessagingError) {
        await bot.sendMessage(msg.chatId, MessageFormatter.error(error.message));
      } else {
        console.error('[Bot] Error completing task:', error);
        await bot.sendMessage(msg.chatId, MessageFormatter.error('Failed to complete task.'));
      }
    }
  });

  // /help
  bot.onCommand('help', async (msg) => {
    await bot.sendMessage(msg.chatId, MessageFormatter.help());
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n[Bot] Shutting down gracefully...');
    scheduler.stop();
    await bot.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Start the cron scheduler
  scheduler.start();

  // Start the bot
  await bot.start();
  console.log('[Bot] Running on:', bot.getPlatformName());
  console.log('[Bot] Press Ctrl+C to stop\n');
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  startBot().catch((error) => {
    console.error('[Bot] Failed to start:', error);
    process.exit(1);
  });
}
