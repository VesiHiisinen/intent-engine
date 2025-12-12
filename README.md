# 🧠 Daily Intent Engine

A personal cognitive-support system that helps neurodivergent users complete 2–3 meaningful tasks per day with minimal cognitive load.

## Overview

The Daily Intent Engine combines chat-based interaction (Telegram/Discord), local AI (Ollama), and automated scheduling to create a low-friction productivity assistant that serves as an external "executive function" scaffold.

## Features

### ✅ Implemented (Issue #1)

**Basic Task Storage System**
- JSON-based task persistence
- Full CRUD operations (create, read, update, delete)
- Enhanced task model with:
  - Temporal tracking (creation, completion, selection timestamps)
  - Avoidance detection (skip count, last skipped date)
  - Energy level classification (low/medium/high)
  - Structured history with typed actions
  - Optional tags and time estimates

### 🚧 In Progress

- **Issue #2**: Telegram/Discord Two-Way Bot Skeleton
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
│   │   ├── task-storage.test.ts  # Storage tests
│   │   └── index.ts              # Module exports
│   └── index.ts                  # Test harness
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
- **Testing**: Vitest with 97.95% coverage
- **Development**: tsx (hot reload)
- **Build**: tsc (TypeScript compiler)

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

### Development

```bash
# Run development server with hot reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run typecheck

# Build for production
npm run build

# Run production build
npm start
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

## Testing

The project uses Vitest for unit testing with strict coverage requirements:

- **Unit Tests**: 39 passing tests
- **Coverage**: 97.95% (lines/statements/functions)
- **Test Isolation**: Each test runs in isolation with clean state

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Open coverage HTML report
open coverage/index.html
```

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
- [ ] Issue #2: Telegram/Discord Bot Skeleton
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

---

**Status**: 🟢 Active Development | **Coverage**: 97.95% | **Tests**: 39/39 passing
