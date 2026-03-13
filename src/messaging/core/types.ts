export interface IncomingMessage {
  chatId: string;
  userId: string;
  text: string;
  timestamp: Date;
  username?: string;
}

export type CommandHandler = (msg: IncomingMessage, args: string[]) => Promise<void>;
export type MessageHandler = (msg: IncomingMessage) => Promise<void>;

export interface MessageOptions {
  parseMode?: 'Markdown' | 'HTML';
  replyToMessageId?: string;
}

export interface IMessagingTransport {
  sendMessage(chatId: string, text: string, options?: MessageOptions): Promise<void>;
  onCommand(command: string, handler: CommandHandler): void;
  onMessage(handler: MessageHandler): void;
  start(): Promise<void>;
  stop(): Promise<void>;
  getPlatformName(): string;
}

export interface ParsedCommand {
  type: 'add' | 'alltasks' | 'done' | 'help' | 'start' | 'unknown';
  args: string[];
  raw: string;
}
