// Progress tracker with chainable API

import type { ProgressState } from './types';

export class Progress {
  private state: ProgressState;
  private static onFinished: ((name: string) => void) | null = null;
  private static onDone: ((name: string) => void) | null = null;

  constructor(name: string) {
    this.state = {
      name,
      current: 0,
      total: null,
      status: 'initial',
      startedAt: null,
      lastUpdatedAt: Date.now(),
      startCurrent: 0,
      pauseBuffer: 0,
    };
  }

  // Set callback for finished state
  public static setFinishedCallback(callback: (name: string) => void): void {
    Progress.onFinished = callback;
  }

  // Set callback for done state
  public static setDoneCallback(callback: (name: string) => void): void {
    Progress.onDone = callback;
  }

  /**
   * Set total and start tracking
   */
  setTotal(total: number): this {
    if (total < 0) {
      throw new Error(`Total must be non-negative, got: ${total}`);
    }
    this.state.total = total;
    this.state.lastUpdatedAt = Date.now();

    // Transition from initial to running
    if (this.state.status === 'initial') {
      this.state.status = 'running';
      this.state.startedAt = Date.now();
      this.state.startCurrent = this.state.current;
    }

    // Check if already finished
    this.checkAndMarkFinished();

    return this;
  }

  /**
   * Set current progress
   */
  setCurrent(current: number): this {
    if (current < 0) {
      console.warn(`Progress.setCurrent: clamping negative value ${current} to 0`);
      current = 0;
    }
    this.state.current = current;
    this.state.lastUpdatedAt = Date.now();
    this.checkAndMarkFinished();
    return this;
  }

  /**
   * Increment progress
   */
  increment(by = 1): this {
    this.state.current = Math.max(0, this.state.current + by);
    this.state.lastUpdatedAt = Date.now();
    this.checkAndMarkFinished();
    return this;
  }

  /**
   * Pause tracking
   */
  pause(): this {
    if (this.state.status === 'running' && this.state.startedAt !== null) {
      // Add elapsed time to buffer
      const elapsed = Date.now() - this.state.startedAt;
      this.state.pauseBuffer += elapsed;
      this.state.status = 'paused';
      this.state.lastUpdatedAt = Date.now();
    }
    return this;
  }

  /**
   * Resume tracking
   */
  resume(): this {
    if (this.state.status === 'paused') {
      this.state.status = 'running';
      this.state.startedAt = Date.now();
      this.state.lastUpdatedAt = Date.now();
    }
    return this;
  }

  /**
   * Remove tracker manually
   */
  done(): this {
    this.state.lastUpdatedAt = Date.now();
    // Trigger callback to remove from registry
    if (Progress.onDone) {
      Progress.onDone(this.state.name);
    }
    return this;
  }

  /**
   * Get current state
   */
  getState(): Readonly<ProgressState> {
    return { ...this.state };
  }

  /**
   * Get tracker name
   */
  getName(): string {
    return this.state.name;
  }

  /**
   * Check if running
   */
  isActive(): boolean {
    return this.state.status === 'running';
  }

  // Check if done and mark as finished
  private checkAndMarkFinished(): void {
    if (
      this.state.status === 'running' &&
      this.state.total !== null &&
      this.state.current >= this.state.total
    ) {
      this.state.status = 'finished';
      // Notify callback for immediate render
      if (Progress.onFinished) {
        Progress.onFinished(this.state.name);
      }
      // Auto-remove after 3 seconds to show completion
      setTimeout(() => {
        if (Progress.onDone) {
          Progress.onDone(this.state.name);
        }
      }, 3000);
    }
  }
}
