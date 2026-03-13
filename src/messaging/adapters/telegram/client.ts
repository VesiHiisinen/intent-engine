import { Bot, Context } from 'grammy';
import type {
  IMessagingTransport,
  IncomingMessage,
  CommandHandler,
  MessageHandler,
  MessageOptions,
} from '../../core/types.js';

export class TelegramTransport implements IMessagingTransport {
  private bot: Bot;
  private commandHandlers: Map<string, CommandHandler> = new Map();
  private messageHandlers: MessageHandler[] = [];

  constructor(token: string) {
    this.bot = new Bot(token);
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    // Error handling
    this.bot.catch((err) => {
      console.error('[Telegram] Bot error:', err);
    });

    // Message handling
    this.bot.on('message:text', async (ctx) => {
      const msg = this.convertMessage(ctx);

      // Handle commands
      if (ctx.message.text.startsWith('/')) {
        const [command, ...args] = ctx.message.text.slice(1).split(/\s+/);
        const handler = command ? this.commandHandlers.get(command) : undefined;
        if (handler) {
          try {
            await handler(msg, args);
          } catch (error) {
            console.error(`[Telegram] Command handler error:`, error);
            await ctx.reply('❌ An error occurred processing your command.');
          }
        }
        return;
      }

      // Handle task addition with '+'
      if (ctx.message.text.startsWith('+')) {
        const handler = this.commandHandlers.get('add');
        if (handler && ctx.message.text) {
          const taskText = ctx.message.text.slice(1).trim();
          try {
            await handler(msg, [taskText]);
          } catch (error) {
            console.error(`[Telegram] Add task error:`, error);
            await ctx.reply('❌ An error occurred adding your task.');
          }
        }
        return;
      }

      // Handle generic messages
      for (const handler of this.messageHandlers) {
        try {
          await handler(msg);
        } catch (error) {
          console.error(`[Telegram] Message handler error:`, error);
        }
      }
    });
  }

  async sendMessage(chatId: string, text: string, options?: MessageOptions): Promise<void> {
    await this.bot.api.sendMessage(chatId, text, {
      parse_mode: options?.parseMode || 'Markdown',
      reply_to_message_id: options?.replyToMessageId
        ? parseInt(options.replyToMessageId)
        : undefined,
    });
  }

  onCommand(command: string, handler: CommandHandler): void {
    this.commandHandlers.set(command, handler);
  }

  onMessage(handler: MessageHandler): void {
    this.messageHandlers.push(handler);
  }

  async start(): Promise<void> {
    console.log('[Telegram] Starting bot...');
    await this.bot.start();
    console.log('[Telegram] Bot started successfully');
  }

  async stop(): Promise<void> {
    console.log('[Telegram] Stopping bot...');
    await this.bot.stop();
    console.log('[Telegram] Bot stopped');
  }

  getPlatformName(): string {
    return 'Telegram';
  }

  private convertMessage(ctx: Context): IncomingMessage {
    return {
      chatId: ctx.chat!.id.toString(),
      userId: ctx.from!.id.toString(),
      text: ctx.message!.text || '',
      timestamp: new Date((ctx.message!.date || 0) * 1000),
      username: ctx.from!.username,
    };
  }
}
