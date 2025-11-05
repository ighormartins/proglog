/**
 * Tests for renderer module
 */

import { render } from '../renderer';
import { registry } from '../registry';
import { setQuiet, resetConfig } from '../config';

describe('renderer', () => {
  let mockStdout: jest.SpyInstance;
  let stdoutWrites: string[];

  beforeEach(() => {
    // Clear registry and reset config
    registry.clear();
    resetConfig();

    // Mock stdout.write
    stdoutWrites = [];
    mockStdout = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation((chunk: string | Uint8Array) => {
        stdoutWrites.push(typeof chunk === 'string' ? chunk : chunk.toString());
        return true;
      });

    // Mock isTTY
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    mockStdout.mockRestore();
  });

  describe('render', () => {
    it('should not render when quiet mode is enabled', () => {
      setQuiet(true);
      const task = registry.get('test');
      task.setTotal(100);

      render();

      expect(stdoutWrites.length).toBe(0);
    });

    it('should not render when no trackers exist', () => {
      render();

      expect(stdoutWrites.length).toBe(0);
    });

    it('should render table with single tracker', () => {
      const task = registry.get('test-task');
      task.setTotal(100);
      task.setCurrent(50);

      render();

      expect(stdoutWrites.length).toBeGreaterThan(0);
      const output = stdoutWrites.join('');
      expect(output).toContain('test-task');
      expect(output).toContain('50/100');
      expect(output).toContain('50%');
    });

    it('should render multiple trackers', () => {
      const task1 = registry.get('task-1');
      const task2 = registry.get('task-2');

      task1.setTotal(100);
      task1.setCurrent(25);
      task2.setTotal(200);
      task2.setCurrent(150);

      render();

      const output = stdoutWrites.join('');
      expect(output).toContain('task-1');
      expect(output).toContain('task-2');
      expect(output).toContain('25/100');
      expect(output).toContain('150/200');
    });

    it('should render progress bar', () => {
      const task = registry.get('test');
      task.setTotal(100);
      task.setCurrent(50);

      render();

      const output = stdoutWrites.join('');
      expect(output).toMatch(/\[█+░+\]/); // Contains filled and empty blocks
    });

    it('should sort by last updated (most recent first)', () => {
      const task1 = registry.get('task-1');
      const task2 = registry.get('task-2');
      const task3 = registry.get('task-3');

      // Set initial times with clear differences
      const baseTime = Date.now();

      jest.spyOn(Date, 'now').mockReturnValue(baseTime);
      task1.setTotal(100);

      jest.spyOn(Date, 'now').mockReturnValue(baseTime + 1000);
      task2.setTotal(100);

      jest.spyOn(Date, 'now').mockReturnValue(baseTime + 2000);
      task3.setTotal(100);

      // Update with clear time differences
      jest.spyOn(Date, 'now').mockReturnValue(baseTime + 3000);
      task1.setCurrent(10);

      jest.spyOn(Date, 'now').mockReturnValue(baseTime + 4000);
      task3.setCurrent(10);

      jest.spyOn(Date, 'now').mockReturnValue(baseTime + 5000);
      task2.setCurrent(10); // Updated last

      render();

      jest.restoreAllMocks();

      const output = stdoutWrites.join('');
      const task1Index = output.indexOf('task-1');
      const task2Index = output.indexOf('task-2');
      const task3Index = output.indexOf('task-3');

      // task2 should appear first (most recently updated)
      expect(task2Index).toBeGreaterThan(-1); // Ensure it's found
      expect(task1Index).toBeGreaterThan(-1);
      expect(task3Index).toBeGreaterThan(-1);
      expect(task2Index).toBeLessThan(task1Index);
      expect(task2Index).toBeLessThan(task3Index);
    });

    it('should render header row', () => {
      const task = registry.get('test');
      task.setTotal(100);

      render();

      const output = stdoutWrites.join('');
      expect(output).toContain('Task');
      expect(output).toContain('Current/Total');
      expect(output).toContain('%');
      expect(output).toContain('Progress');
      expect(output).toContain('Rate');
      expect(output).toContain('ETA');
      expect(output).toContain('Elapsed');
    });

    it('should render separator line', () => {
      const task = registry.get('test');
      task.setTotal(100);

      render();

      const output = stdoutWrites.join('');
      expect(output).toContain('─'); // Separator character
    });

    it('should handle trackers without total', () => {
      const task = registry.get('no-total');
      task.setCurrent(50);

      render();

      const output = stdoutWrites.join('');
      expect(output).toContain('no-total');
      expect(output).toContain('50'); // Current value
      expect(output).not.toContain('50/'); // No total shown
    });
  });

  describe('TTY vs non-TTY behavior', () => {
    it('should clear screen and rewrite in TTY mode', () => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: true,
        writable: true,
        configurable: true,
      });

      const task = registry.get('test');
      task.setTotal(100);

      render();

      const output = stdoutWrites.join('');
      expect(output).toContain('\x1b[2J'); // Clear screen
      expect(output).toContain('\x1b[H'); // Move cursor to top
    });

    it('should append new lines in non-TTY mode', () => {
      Object.defineProperty(process.stdout, 'isTTY', {
        value: false,
        writable: true,
        configurable: true,
      });

      const task = registry.get('test');
      task.setTotal(100);

      render();

      const firstWrite = stdoutWrites[0];
      expect(firstWrite).toContain('\n'); // Starts with newline
      expect(firstWrite).not.toContain('\x1b[2J'); // No clear screen
    });
  });

  describe('edge cases', () => {
    it('should handle very long task names', () => {
      const task = registry.get('this-is-a-very-long-task-name-that-should-be-truncated');
      task.setTotal(100);

      render();

      const output = stdoutWrites.join('');
      expect(output).toContain('this-is-a-very-long…'); // Truncated with ellipsis
    });

    it('should handle current > total', () => {
      const task = registry.get('overrun');
      task.setTotal(100);
      task.setCurrent(150);

      render();

      const output = stdoutWrites.join('');
      expect(output).toContain('100%'); // Capped at 100%
      expect(output).toContain('150/100'); // Shows actual values
    });

    it('should handle large numbers', () => {
      const task = registry.get('large');
      task.setTotal(1000000);
      task.setCurrent(500000);

      render();

      const output = stdoutWrites.join('');
      expect(output).toContain('500,000'); // Formatted with commas
      expect(output).toContain('1,000,000');
    });

    it('should handle all trackers in different states', () => {
      registry.get('initial');
      const running = registry.get('running');
      const paused = registry.get('paused');
      const finished = registry.get('finished');

      running.setTotal(100).setCurrent(50);
      paused.setTotal(100).setCurrent(30).pause();
      finished.setTotal(100).setCurrent(100);

      render();

      const output = stdoutWrites.join('');
      expect(output).toContain('initial');
      expect(output).toContain('running');
      expect(output).toContain('paused');
      expect(output).toContain('finished');
    });
  });
});
