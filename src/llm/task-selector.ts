import type { Task } from '../storage/types.js';
import type { ProgressEntry } from '../daily-selection/types.js';
import { OllamaClient } from './ollama-client.js';

const MAX_RETRIES = 3;
const MAX_TASKS = 3;

function buildSelectionPrompt(tasks: Task[], history: ProgressEntry[]): string {
  const pendingTasks = tasks.filter(t => t.status === 'pending');

  const taskList = pendingTasks.map(t => ({
    id: t.id,
    text: t.text,
    energy: t.energy,
    estimatedMinutes: t.estimatedMinutes ?? null,
    tags: t.tags ?? [],
    skipCount: t.skipCount,
    lastSkippedAt: t.lastSkippedAt ?? null,
    createdAt: t.createdAt,
  }));

  const recentHistory = history.slice(-14).map(h => ({
    date: h.date,
    selectedTaskIds: h.selectedTaskIds,
    completedTaskIds: h.completedTaskIds,
    completionCount: h.completionCount,
  }));

  return `You are a task selection assistant for a neurodivergent person with ADHD.

Given the task list and recent completion history below, select exactly ${MAX_TASKS} tasks for today that:
- Can realistically be completed in a single day
- Have a total estimated time of ~90 minutes max (if estimates are available)
- Avoid tasks that have been skipped 2 or more times recently (check skipCount)
- Prefer a balance of energy levels when possible (not all high-energy tasks)

Tasks (JSON):
${JSON.stringify(taskList, null, 2)}

Recent completion history (last 14 days):
${JSON.stringify(recentHistory, null, 2)}

IMPORTANT: Return ONLY a valid JSON array of exactly ${MAX_TASKS} task IDs, like this:
["id1", "id2", "id3"]

Do not include any explanation, markdown, or other text. Only the JSON array.`;
}

function extractJsonArray(text: string): string[] | null {
  // Try to extract a JSON array from the LLM response
  const match = text.match(/\[[\s\S]*?\]/);
  if (!match) return null;
  try {
    const parsed: unknown = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return null;
    if (!parsed.every(item => typeof item === 'string')) return null;
    return parsed as string[];
  } catch {
    return null;
  }
}

function validateSelection(ids: string[], pendingTasks: Task[]): string[] | null {
  const pendingIds = new Set(pendingTasks.map(t => t.id));
  const valid = ids.filter(id => pendingIds.has(id));
  const unique = [...new Set(valid)];
  if (unique.length !== MAX_TASKS) return null;
  return unique;
}

function fallbackSelection(tasks: Task[]): string[] {
  const pending = tasks.filter(t => t.status === 'pending');

  // Sort by: fewest skips first, then oldest (FIFO fairness)
  const sorted = [...pending].sort((a, b) => {
    if (a.skipCount !== b.skipCount) return a.skipCount - b.skipCount;
    return a.createdAt.localeCompare(b.createdAt);
  });

  return sorted.slice(0, MAX_TASKS).map(t => t.id);
}

export class TaskSelector {
  private readonly client: OllamaClient;

  constructor(client?: OllamaClient) {
    this.client = client ?? new OllamaClient();
  }

  async selectTasks(tasks: Task[], history: ProgressEntry[]): Promise<string[]> {
    const pending = tasks.filter(t => t.status === 'pending');

    if (pending.length === 0) return [];
    if (pending.length <= MAX_TASKS) return pending.map(t => t.id);

    const available = await this.client.isAvailable();
    if (!available) {
      console.warn('[TaskSelector] Ollama unavailable — using fallback selection.');
      return fallbackSelection(tasks);
    }

    const prompt = buildSelectionPrompt(tasks, history);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await this.client.generate(prompt);
        const ids = extractJsonArray(response);
        if (!ids) {
          console.warn(`[TaskSelector] Attempt ${attempt}: could not parse JSON array from response.`);
          continue;
        }
        const validated = validateSelection(ids, pending);
        if (!validated) {
          console.warn(`[TaskSelector] Attempt ${attempt}: selection did not contain exactly ${MAX_TASKS} valid IDs.`);
          continue;
        }
        console.log(`[TaskSelector] AI selected ${validated.length} tasks on attempt ${attempt}.`);
        return validated;
      } catch (error) {
        console.warn(`[TaskSelector] Attempt ${attempt} failed:`, error);
      }
    }

    console.warn('[TaskSelector] All AI attempts failed — using fallback selection.');
    return fallbackSelection(tasks);
  }
}
