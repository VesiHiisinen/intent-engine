import type { ParsedCommand } from './types.js';

export function parseCommand(text: string): ParsedCommand {
  const trimmed = text.trim();

  // Task addition: "+ walk 20 min"
  if (trimmed.startsWith('+')) {
    return {
      type: 'add',
      args: [trimmed.slice(1).trim()],
      raw: trimmed,
    };
  }

  // Slash commands: "/done 2", "/alltasks"
  if (trimmed.startsWith('/')) {
    const [command, ...args] = trimmed.slice(1).split(/\s+/);

    const typeMap: Record<string, ParsedCommand['type']> = {
      'done': 'done',
      'alltasks': 'alltasks',
      'help': 'help',
      'start': 'start',
    };

    const cmdType = command ? typeMap[command] : undefined;

    return {
      type: cmdType || 'unknown',
      args,
      raw: trimmed,
    };
  }

  return { type: 'unknown', args: [], raw: trimmed };
}
