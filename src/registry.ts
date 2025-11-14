// Global registry for all trackers

import { Progress } from './progress.js';

class ProgressRegistry {
  private trackers: Map<string, Progress> = new Map();

  /**
   * Get or create tracker
   */
  get(name: string): Progress {
    let tracker = this.trackers.get(name);
    if (!tracker) {
      tracker = new Progress(name);
      this.trackers.set(name, tracker);
    }
    return tracker;
  }

  /**
   * Register tracker
   */
  register(tracker: Progress): void {
    this.trackers.set(tracker.getName(), tracker);
  }

  /**
   * Remove tracker
   */
  remove(name: string): boolean {
    return this.trackers.delete(name);
  }

  /**
   * Get all trackers
   */
  getAll(): Progress[] {
    return Array.from(this.trackers.values());
  }

  /**
   * Check if any are active
   */
  hasActive(): boolean {
    return this.getAll().some((tracker) => tracker.isActive());
  }

  /**
   * Count active trackers
   */
  getActiveCount(): number {
    return this.getAll().filter((tracker) => tracker.isActive()).length;
  }

  /**
   * Clear all trackers
   */
  clear(): void {
    this.trackers.clear();
  }
}

export const registry = new ProgressRegistry();
