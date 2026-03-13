export interface DailySelection {
  date: string; // YYYY-MM-DD
  taskIds: string[];
  selectedAt: string; // ISO timestamp
  completedTaskIds: string[];
}

export interface ProgressEntry {
  date: string; // YYYY-MM-DD
  selectedTaskIds: string[];
  completedTaskIds: string[];
  completedAt: string; // ISO timestamp of last completion
  completionCount: number; // 0-3
}
