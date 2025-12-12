export type TaskStatus = 'pending' | 'done' | 'archived';

export type EnergyLevel = 'low' | 'medium' | 'high';

export type HistoryAction = 'created' | 'selected' | 'skipped' | 'completed' | 'edited' | 'archived';

export interface TaskHistoryEntry {
  timestamp: string;
  action: HistoryAction;
  note?: string;
}

export interface Task {
  id: string;
  text: string;
  status: TaskStatus;
  energy: EnergyLevel;

  // Temporal tracking
  createdAt: string;
  lastSelectedAt?: string;
  lastSkippedAt?: string;
  completedAt?: string;

  // Avoidance detection
  skipCount: number;

  // Optional metadata
  estimatedMinutes?: number;
  tags?: string[];

  // History log
  history: TaskHistoryEntry[];
}

export interface TaskDatabase {
  version: number;
  tasks: Task[];
}
