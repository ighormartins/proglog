// Calculate progress metrics

import type { ProgressState, ProgressMetrics } from './types';

const EPSILON = 0.0001;

// Calculate percentage
export function calculatePercentage(current: number, total: number | null): number {
  if (total === null || total === 0) {
    return 0;
  }
  const percent = (current / total) * 100;
  return Math.min(100, Math.max(0, Math.round(percent)));
}

// Calculate rate (items/min)
export function calculateRate(state: ProgressState): number | null {
  const elapsed = calculateElapsed(state);

  if (elapsed < 1000) {
    return null; // Too early
  }

  const itemsProcessed = state.current - state.startCurrent;
  const elapsedMinutes = elapsed / 60000;

  if (elapsedMinutes < EPSILON) {
    return null;
  }

  return itemsProcessed / elapsedMinutes;
}

// Calculate ETA (ms)
export function calculateEta(state: ProgressState, rate: number | null): number | null {
  if (state.total === null || rate === null || rate < EPSILON) {
    return null;
  }

  const remaining = state.total - state.current;
  if (remaining <= 0) {
    return 0;
  }

  const ratePerMs = rate / 60000; // Convert items/min to items/ms
  return remaining / Math.max(ratePerMs, EPSILON);
}

// Calculate elapsed time (ms)
export function calculateElapsed(state: ProgressState): number {
  // Initial state - not started yet
  if (state.status === 'initial') {
    return 0;
  }

  // Paused or finished - use only the buffer
  if (state.status === 'paused' || state.status === 'finished') {
    return state.pauseBuffer;
  }

  // Running - add current elapsed to buffer
  if (state.status === 'running' && state.startedAt !== null) {
    return state.pauseBuffer + (Date.now() - state.startedAt);
  }

  return 0;
}

// Calculate all metrics
export function calculateMetrics(state: ProgressState): ProgressMetrics {
  const rate = calculateRate(state);
  return {
    percentage: calculatePercentage(state.current, state.total),
    rate,
    eta: calculateEta(state, rate),
    elapsed: calculateElapsed(state),
  };
}
