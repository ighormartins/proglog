/**
 * ProgressLogger - Track multiple tasks with live progress table
 */

import { Progress } from './progress';
import { registry } from './registry';
import { render } from './renderer';
import { setQuiet } from './config';

// Default render interval (10 seconds)
let renderIntervalMs = 10000;
let renderInterval: NodeJS.Timeout | null = null;

/**
 * Get or create a tracker by name
 */
export function ProgressLogger(name: string): Progress {
  const tracker = registry.get(name);

  // Auto-start renderer if not running and there are active trackers
  if (renderInterval === null && registry.getActiveCount() > 0) {
    startRenderer();
  }

  return tracker;
}

/**
 * Remove all trackers
 */
ProgressLogger.stopAll = function (): void {
  registry.clear();
  stopRenderer();
};

/**
 * Set how often the table updates (in milliseconds)
 */
ProgressLogger.setLoggerInterval = function (ms: number): void {
  if (ms <= 0) {
    throw new Error(`Interval must be positive, got: ${ms}`);
  }

  renderIntervalMs = ms;

  // Restart interval with new timing if currently running
  if (renderInterval !== null) {
    stopRenderer();
    startRenderer();
  }
};

/**
 * Enable/disable output
 */
ProgressLogger.setQuiet = function (quiet: boolean): void {
  setQuiet(quiet);
};

// Start auto-render interval
function startRenderer(): void {
  if (renderInterval !== null) {
    return; // Already running
  }

  renderInterval = setInterval(() => {
    render();

    // Stop if no active trackers
    if (!registry.hasActive()) {
      stopRenderer();
    }
  }, renderIntervalMs);
}

// Stop auto-render interval
function stopRenderer(): void {
  if (renderInterval !== null) {
    clearInterval(renderInterval);
    renderInterval = null;
  }
}

// Render immediately when a tracker finishes
function onTrackerFinished(_name: string): void {
  // Immediately render to show the finished state
  render();
}

// Remove tracker when done
function onTrackerDone(name: string): void {
  registry.remove(name);
}

// Set up callbacks for tracker lifecycle events
Progress.setFinishedCallback(onTrackerFinished);
Progress.setDoneCallback(onTrackerDone);

export type { ProgressLoggerConfig, ProgressStatus } from './types';
export { Progress } from './progress';
export default ProgressLogger;
export { ProgressLogger as PLG };

// Clean shutdown on process exit
process.on('exit', () => {
  stopRenderer();
});

process.on('SIGINT', () => {
  stopRenderer();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopRenderer();
  process.exit(0);
});
