// Type definitions

// Tracker status
export type ProgressStatus = 'initial' | 'running' | 'paused' | 'finished';

// Config options
export interface ProgressLoggerConfig {
  /** If true, suppress all output (default: false) */
  quiet: boolean;
}

// Tracker state
export interface ProgressState {
  /** Unique name/identifier for this tracker */
  name: string;
  /** Current progress value */
  current: number;
  /** Total target value (optional for spinner mode) */
  total: number | null;
  /** Current status */
  status: ProgressStatus;
  /** Timestamp when tracker was started */
  startedAt: number | null;
  /** Timestamp of last update */
  lastUpdatedAt: number;
  /** Current value when started (for rate calculation) */
  startCurrent: number;
  /** Accumulated time spent in running state (milliseconds) */
  pauseBuffer: number;
  /** Per-tracker counters */
  counters: Map<string, number>;
}

// Calculated metrics
export interface ProgressMetrics {
  /** Percentage complete (0-100) */
  percentage: number;
  /** Items per minute rate */
  rate: number | null;
  /** Estimated time to completion in milliseconds */
  eta: number | null;
  /** Elapsed time in milliseconds */
  elapsed: number;
}
