export class MessagingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recoverable: boolean = true
  ) {
    super(message);
    this.name = 'MessagingError';
  }
}

export class TaskNotFoundError extends MessagingError {
  constructor(taskId: string) {
    super(`Task not found: ${taskId}`, 'TASK_NOT_FOUND', true);
  }
}

export class InvalidCommandError extends MessagingError {
  constructor(command: string) {
    super(`Invalid command: ${command}`, 'INVALID_COMMAND', true);
  }
}

export class MissingArgumentError extends MessagingError {
  constructor(argument: string) {
    super(`Missing required argument: ${argument}`, 'MISSING_ARGUMENT', true);
  }
}
