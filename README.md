# 🧠 Daily Intent Engine

A personal cognitive-support system that helps neurodivergent users complete 2–3 meaningful tasks per day with minimal cognitive load.

## Overview

The Daily Intent Engine combines chat-based interaction (Telegram/Discord), local AI (Ollama), and automated scheduling to create a low-friction productivity assistant that serves as an external "executive function" scaffold.

## Features

### ✅ Implemented

**Issue #1: Basic Task Storage System**
- JSON-based task persistence
- Full CRUD operations (create, read, update, delete)
- Enhanced task model with:
  - Temporal tracking (creation, completion, selection timestamps)
  - Avoidance detection (skip count, last skipped date)
  - Energy level classification (low/medium/high)
  - Structured history with typed actions
  - Optional tags and time estimates

**Issue #2: Telegram Bot Skeleton**
- Platform-agnostic messaging architecture with Grammy
- Four-layer design: Transport → Adapter → Core → Storage
- Command handlers: /start, /add, /alltasks, /done, /help
- Quick add syntax: + task text
- Real-time task management
- 49 passing unit tests with 97.72% coverage

### 🚧 In Progress

- **Issue #3**: Daily Intent Selection via LLM (Ollama)

## Project Structure

```
intent-engine/
├── .claude/
│   └── agents/                    # Specialist sub-agents
│       ├── architect.md
│       ├── ai-llm-specialist.md
│       ├── messaging-platform-strategist.md
│       └── neuropsychiatric-researcher.md
├── src/
│   ├── storage/                   # Task storage module
│   │   ├── types.ts              # Type definitions
│   │   ├── types.test.ts         # Type tests
│   │   ├── task-storage.ts       # CRUD functions
│   │   ├── task-storage.integration.test.ts  # Integration tests
│   │   └── index.ts              # Module exports
│   ├── messaging/
│   │   ├── core/                 # Platform-agnostic business logic
│   │   │   ├── types.ts         # Messaging interfaces
│   │   │   ├── task-service.ts  # Task operations
│   │   │   ├── parser.ts        # Command parser
│   │   │   ├── formatter.ts     # Message templates
│   │   │   └── errors.ts        # Custom errors
│   │   └── adapters/
│   │       └── telegram/
│   │           └── client.ts    # Grammy bot implementation
│   ├── bot.ts                    # Telegram bot entry point
│   └── index.ts                  # CLI test harness
├── data/
│   └── tasks.json                # Runtime task storage
├── tests/                        # Integration & E2E tests (future)
├── PROJECT_SPECIFICATION.md      # Full project vision
├── MVP_SCOPE.md                  # First iteration scope
└── package.json
```

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.3.3 (strict mode)
- **Module System**: ESM (Node16)
- **Testing**: Vitest with 97.72% coverage (49 unit tests)
- **Development**: tsx (hot reload)
- **Build**: tsc (TypeScript compiler)
- **Bot Framework**: Grammy 1.38.4 (Telegram)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/VesiHiisinen/intent-engine.git
cd intent-engine

# Install dependencies
npm install
```

### Telegram Bot Setup

1. **Create a Telegram bot** with [@BotFather](https://t.me/botfather):
   ```
   /newbot
   Choose a name: Daily Intent Bot
   Choose a username: your_intent_bot
   ```

2. **Get your bot token** from BotFather (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

3. **Create `.env` file** in project root:
   ```bash
   TELEGRAM_BOT_TOKEN=your_token_here
   ```

4. **Run the bot**:
   ```bash
   # Development mode with hot reload
   npm run dev:bot

   # Production mode
   npm run build
   npm run start:bot
   ```

5. **Start chatting** with your bot on Telegram!

### Development

```bash
# Run CLI test harness with hot reload
npm run dev

# Run Telegram bot with hot reload
npm run dev:bot

# Run tests (unit tests only)
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Type checking
npm run typecheck

# Build for production
npm run build

# Run production CLI
npm start

# Run production bot
npm start:bot
```

## Task Data Model

```typescript
interface Task {
  id: string;                    // UUID
  text: string;                  // Task description
  status: 'pending' | 'done' | 'archived';
  energy: 'low' | 'medium' | 'high';

  // Temporal tracking
  createdAt: string;             // ISO 8601
  lastSelectedAt?: string;
  lastSkippedAt?: string;
  completedAt?: string;

  // Avoidance detection (for AI)
  skipCount: number;

  // Optional metadata
  estimatedMinutes?: number;
  tags?: string[];

  // Audit trail
  history: TaskHistoryEntry[];
}
```

## Bot Commands

The Telegram bot supports the following commands:

### Basic Commands

- `/start` - Welcome message and bot introduction
- `/help` - Show all available commands
- `/alltasks` - Display all your tasks with status
- `/add <task text>` - Add a new task
- `+ <task text>` - Quick add a task (shorthand)
- `/done <number>` - Mark task as completed by its number

### Usage Examples

```
/start
→ Welcome! I'm your Daily Intent Engine bot...

+ Buy groceries
→ ✅ Task added: Buy groceries (🔥 medium energy)

/alltasks
→ 📋 Your tasks:
  1. [ ] Buy groceries (🔥 medium)

/done 1
→ ✅ Task completed: Buy groceries
```

## API Reference

### Storage Functions

```typescript
// Load all tasks from storage
await loadTasks(): Promise<Task[]>

// Save tasks to storage
await saveTasks(tasks: Task[]): Promise<void>

// Add a new task
await addTask(text: string, energy?: EnergyLevel): Promise<Task>

// Mark a task as done
await markDone(id: string): Promise<Task | null>

// List all tasks
await listTasks(): Promise<Task[]>
```

### Messaging Core (TaskService)

```typescript
// Create a new task
await taskService.createTask(text: string, energy?: EnergyLevel): Promise<Task>

// Complete task by ID
await taskService.completeTask(taskId: string): Promise<Task>

// Complete task by index (0-based)
await taskService.completeTaskByIndex(index: number): Promise<Task>

// Get all tasks
await taskService.getAllTasks(): Promise<Task[]>

// Get only pending tasks
await taskService.getPendingTasks(): Promise<Task[]>

// Get task counts
await taskService.getTaskCount(): Promise<{total: number, pending: number, done: number}>
```

## Testing

The project follows a test-first approach with clear separation between unit and integration tests:

### Test Strategy

- **Unit Tests**: Fast, isolated tests using mocks (49 tests)
  - Test business logic without I/O
  - Run by default with `npm test`
  - Coverage: 97.72%

- **Integration Tests**: Tests with real file I/O (39 tests)
  - Test actual storage operations
  - Run explicitly with `npm run test:integration`
  - Excluded from default test runs and coverage

### Running Tests

```bash
# Run unit tests (default)
npm test

# Run unit tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run integration tests
npm run test:integration

# Open coverage HTML report
open coverage/index.html
```

### Coverage Requirements

- **Lines**: 70% minimum
- **Functions**: 70% minimum
- **Branches**: 60% minimum
- **Statements**: 70% minimum

Current coverage: **97.72%** (unit tests only)

## Design Principles

1. **Minimal Cognitive Load**: Max 3 tasks visible at once
2. **Privacy-First**: Self-hosted, local AI, no cloud services
3. **Neurodivergent-Friendly**: Low friction, clear feedback, external scaffolding
4. **Simple & Modular**: Easy to extend, maintain, and understand
5. **Test-Driven**: Every feature has comprehensive unit tests

## Specialist Agents

The project uses four specialist sub-agents for decision-making:

1. **Architect**: Technical stack, system design, scalability
2. **AI/LLM Specialist**: Ollama integration, prompt engineering
3. **Messaging Platform Strategist**: Bot selection, platform-agnostic patterns
4. **Neuropsychiatric Researcher**: Dopamine rewards, ADHD patterns, gamification

## Roadmap

### MVP (Current Sprint)

- [x] Issue #1: Basic Task Storage System
- [x] Issue #2: Telegram Bot Skeleton
- [ ] Issue #3: Daily Intent Selection via LLM

### Future Enhancements

- Integration tests
- E2E tests with real bot/AI instances
- SQLite migration
- n8n visual workflow integration
- Web UI (optional)
- Multi-user support (optional)

## Contributing

This is a personal project, but feedback and suggestions are welcome via GitHub issues.

## License

MIT

## Acknowledgments

Built with assistance from [Claude Code](https://claude.com/claude-code) as the product owner and implementation agent.

## Architecture

The bot uses a four-layer architecture for platform-agnostic design:

1. **Transport Layer** (`TelegramTransport`)
   - Grammy polling implementation
   - Error handling and middleware
   - Future: Discord adapter

2. **Adapter Layer** (`client.ts`)
   - Platform-specific message conversion
   - Command routing
   - Quick-add syntax (`+` prefix)

3. **Core Layer** (`messaging/core/`)
   - Business logic (TaskService)
   - Command parsing
   - Message formatting
   - Custom errors

4. **Storage Layer** (`storage/`)
   - JSON persistence
   - CRUD operations
   - Task data model

This design allows swapping Telegram for Discord (or other platforms) by only changing the adapter layer.

---

**Status**: 🟢 Active Development | **Coverage**: 97.72% | **Tests**: 49/49 passing
