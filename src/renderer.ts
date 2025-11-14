// Render progress table

import { Progress } from './progress';
import { registry } from './registry';
import { getConfig } from './config';
import { calculateMetrics } from './calculator';
import {
  formatProgressBar,
  formatEta,
  formatRate,
  formatElapsed,
  formatNumber,
  truncate,
  formatCounters,
} from './formatter';

// Render the table
export function render(): void {
  const config = getConfig();

  if (config.quiet) {
    return;
  }

  const trackers = registry.getAll();

  if (trackers.length === 0) {
    return;
  }

  // Sort by last updated (most recent first)
  const sorted = trackers
    .slice()
    .sort((a, b) => b.getState().lastUpdatedAt - a.getState().lastUpdatedAt);

  const isTTY = process.stdout.isTTY ?? false;
  const output = buildOutput(sorted);

  if (isTTY) {
    // Clear and rewrite
    process.stdout.write('\x1b[2J\x1b[H'); // Clear screen and move cursor to top
    process.stdout.write(output);
  } else {
    // Append new snapshot
    process.stdout.write(`\n${output}\n`);
  }
}

// Build output string
function buildOutput(trackers: Progress[]): string {
  const lines: string[] = [];
  const barWidth = 20; // Fixed bar width

  // Header
  lines.push(
    'Task                 Current/Total    %    Progress              Rate      ETA       Elapsed'
  );
  lines.push('─'.repeat(100));

  // Rows
  for (const tracker of trackers) {
    const state = tracker.getState();
    const metrics = calculateMetrics(state);

    const taskName = truncate(state.name, 20).padEnd(20);
    const currentTotal =
      state.total !== null
        ? `${formatNumber(state.current)}/${formatNumber(state.total)}`.padEnd(16)
        : `${formatNumber(state.current)}`.padEnd(16);
    const percentage = `${metrics.percentage}%`.padEnd(5);
    const bar = formatProgressBar(metrics.percentage, barWidth).padEnd(barWidth + 2);
    const rate = formatRate(metrics.rate).padEnd(10);
    const eta = formatEta(metrics.eta).padEnd(10);
    const elapsed = formatElapsed(metrics.elapsed).padEnd(10);

    lines.push(`${taskName} ${currentTotal} ${percentage} ${bar} ${rate} ${eta} ${elapsed}`);

    // Add counter sub-row if counters exist
    if (state.counters.size > 0) {
      const countersStr = formatCounters(state.counters);
      lines.push(`  └─ ${countersStr}`);
    }
  }

  return lines.join('\n');
}
