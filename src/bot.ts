import 'dotenv/config';
import { TelegramTransport } from './messaging/adapters/telegram/client.js';
import { TaskService } from './messaging/core/task-service.js';
import { MessageFormatter } from './messaging/core/formatter.js';
import {
  MessagingError,
  MissingArgumentError,
} from './messaging/core/errors.js';

export async function startBot() {
  // Validate environment
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
  }

  console.log('🤖 Initializing Daily Intent Engine Bot...\n');

  // Initialize services
  const bot = new TelegramTransport(token);
  const taskService = new TaskService();

  // Command: /start
  bot.onCommand('start', async (msg) => {
    await bot.sendMessage(msg.chatId, MessageFormatter.welcome());
  });

  // Command: + add task
  bot.onCommand('add', async (msg, args) => {
    try {
      const text = args.join(' ').trim();
      if (!text) {
        throw new MissingArgumentError('task text');
      }

      const task = await taskService.createTask(text);
      await bot.sendMessage(msg.chatId, MessageFormatter.taskAdded(task));
    } catch (error) {
      if (error instanceof MessagingError) {
        await bot.sendMessage(msg.chatId, MessageFormatter.error(error.message));
      } else {
        throw error;
      }
    }
  });

  // Command: /alltasks
  bot.onCommand('alltasks', async (msg) => {
    try {
      const tasks = await taskService.getPendingTasks();
      await bot.sendMessage(msg.chatId, MessageFormatter.taskList(tasks));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Bot] Error listing tasks:', errorMessage);
      await bot.sendMessage(
        msg.chatId,
        MessageFormatter.error('Failed to load tasks')
      );
    }
  });

  // Command: /done <number>
  bot.onCommand('done', async (msg, args) => {
    try {
      const firstArg = args[0];
      if (!firstArg) {
        throw new MissingArgumentError('task number (e.g., /done 1)');
      }

      const taskNum = parseInt(firstArg);
      if (isNaN(taskNum) || taskNum < 1) {
        throw new MissingArgumentError('valid task number (e.g., /done 1)');
      }

      const task = await taskService.completeTaskByIndex(taskNum - 1);
      await bot.sendMessage(msg.chatId, MessageFormatter.taskCompleted(task));
    } catch (error) {
      if (error instanceof MessagingError) {
        await bot.sendMessage(msg.chatId, MessageFormatter.error(error.message));
      } else {
        console.error('[Bot] Error completing task:', error);
        await bot.sendMessage(
          msg.chatId,
          MessageFormatter.error('Failed to complete task')
        );
      }
    }
  });

  // Command: /help
  bot.onCommand('help', async (msg) => {
    await bot.sendMessage(msg.chatId, MessageFormatter.help());
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Shutting down bot gracefully...');
    await bot.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Start bot
  await bot.start();

  console.log('✅ Bot is running!');
  console.log('📱 Platform:', bot.getPlatformName());
  console.log('⏱️  Press Ctrl+C to stop\n');
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  startBot().catch((error) => {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  });
}
