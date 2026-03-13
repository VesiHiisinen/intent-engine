import { promises as fs } from 'fs';
import path from 'path';
import type { DailySelection, ProgressEntry } from './types.js';

function getDataDir(): string {
  return path.resolve(process.cwd(), process.env.TASKS_DATA_DIR ?? 'data');
}

function getSelectionFile(): string {
  return path.join(getDataDir(), 'daily-selection.json');
}

function getProgressFile(): string {
  return path.join(getDataDir(), 'progress.jsonl');
}

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(getDataDir(), { recursive: true });
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function loadDailySelection(): Promise<DailySelection | null> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(getSelectionFile(), 'utf-8');
    return JSON.parse(data) as DailySelection;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

export async function saveDailySelection(selection: DailySelection): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(getSelectionFile(), JSON.stringify(selection, null, 2));
}

export async function getTodaySelection(): Promise<DailySelection | null> {
  const selection = await loadDailySelection();
  if (!selection) return null;
  if (selection.date !== todayDateString()) return null;
  return selection;
}

export async function markTaskDoneInSelection(taskId: string): Promise<DailySelection | null> {
  const selection = await getTodaySelection();
  if (!selection) return null;
  if (!selection.taskIds.includes(taskId)) return null;
  if (!selection.completedTaskIds.includes(taskId)) {
    selection.completedTaskIds.push(taskId);
    await saveDailySelection(selection);
  }
  return selection;
}

export async function appendProgressEntry(entry: ProgressEntry): Promise<void> {
  await ensureDataDir();
  const line = JSON.stringify(entry) + '\n';
  await fs.appendFile(getProgressFile(), line, 'utf-8');
}

export async function loadProgressHistory(): Promise<ProgressEntry[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(getProgressFile(), 'utf-8');
    return data
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => JSON.parse(line) as ProgressEntry);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}
