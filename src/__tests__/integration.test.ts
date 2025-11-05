/**
 * Integration tests for full ProgressLogger workflow
 */

import { ProgressLogger } from '../index';
import { registry } from '../registry';

describe('ProgressLogger Integration', () => {
  let mockStdout: jest.SpyInstance;

  beforeEach(() => {
    // Clear all trackers
    ProgressLogger.stopAll();

    // Mock stdout to prevent actual console output during tests
    mockStdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);

    // Use fake timers for interval control
    jest.useFakeTimers();
  });

  afterEach(() => {
    mockStdout.mockRestore();
    jest.useRealTimers();
    ProgressLogger.stopAll();
  });

  describe('basic workflow', () => {
    it('should create and track a simple progress', () => {
      const task = ProgressLogger('test-task');
      task.setTotal(100);
      task.setCurrent(50);

      const state = task.getState();
      expect(state.name).toBe('test-task');
      expect(state.current).toBe(50);
      expect(state.total).toBe(100);
      expect(state.status).toBe('running');
    });

    it('should return same instance for same name', () => {
      const task1 = ProgressLogger('same-task');
      const task2 = ProgressLogger('same-task');

      expect(task1).toBe(task2);
    });

    it('should support full chaining workflow', () => {
      const task = ProgressLogger('chained')
        .setTotal(100)
        .setCurrent(20)
        .increment(10)
        .increment(5);

      expect(task.getState().current).toBe(35);
    });

    it('should auto-finish when reaching 100%', () => {
      const task = ProgressLogger('finish-test');
      task.setTotal(100);
      task.setCurrent(99);
      task.increment(1);

      expect(task.getState().status).toBe('finished');
    });

    it('should remove tracker when done is called', () => {
      const task = ProgressLogger('remove-test');
      task.setTotal(100);
      task.done();

      expect(registry.getAll().length).toBe(0);
    });
  });

  describe('pause and resume workflow', () => {
    it('should pause and resume correctly', () => {
      const task = ProgressLogger('pause-test');
      task.setTotal(100);
      task.setCurrent(50);

      task.pause();
      expect(task.getState().status).toBe('paused');
      expect(task.isActive()).toBe(false);

      task.resume();
      expect(task.getState().status).toBe('running');
      expect(task.isActive()).toBe(true);
    });

    it('should accumulate pause buffer', () => {
      const task = ProgressLogger('pause-buffer-test');
      task.setTotal(100);

      const startedAt = task.getState().startedAt!;
      const mockNow = startedAt + 5000;

      jest.spyOn(Date, 'now').mockReturnValue(mockNow);
      task.pause();
      jest.restoreAllMocks();

      const pauseBuffer = task.getState().pauseBuffer;
      expect(pauseBuffer).toBeGreaterThanOrEqual(5000);

      task.resume();
      expect(task.getState().pauseBuffer).toBe(pauseBuffer); // Preserved
    });

    it('should support pause/resume chaining', () => {
      const task = ProgressLogger('pause-chain')
        .setTotal(100)
        .setCurrent(50)
        .pause()
        .resume()
        .increment(10);

      expect(task.getState().current).toBe(60);
      expect(task.getState().status).toBe('running');
    });
  });

  describe('multiple trackers workflow', () => {
    it('should track multiple tasks independently', () => {
      const task1 = ProgressLogger('task-1');
      const task2 = ProgressLogger('task-2');
      const task3 = ProgressLogger('task-3');

      task1.setTotal(100).setCurrent(25);
      task2.setTotal(200).setCurrent(100);
      task3.setTotal(50).setCurrent(50);

      expect(task1.getState().current).toBe(25);
      expect(task2.getState().current).toBe(100);
      expect(task3.getState().current).toBe(50);
      expect(task3.getState().status).toBe('finished');
    });

    it('should track active count correctly', () => {
      const task1 = ProgressLogger('active-1');
      const task2 = ProgressLogger('active-2');
      const task3 = ProgressLogger('active-3');

      expect(registry.getActiveCount()).toBe(0);

      task1.setTotal(100); // 1 active
      expect(registry.getActiveCount()).toBe(1);

      task2.setTotal(200); // 2 active
      expect(registry.getActiveCount()).toBe(2);

      task1.pause(); // 1 active
      expect(registry.getActiveCount()).toBe(1);

      task3.setTotal(50); // 2 active
      expect(registry.getActiveCount()).toBe(2);

      task2.setCurrent(200); // Finished, 1 active
      expect(registry.getActiveCount()).toBe(1);

      task3.done(); // Removed, 0 active
      expect(registry.getActiveCount()).toBe(0);
    });
  });

  describe('static methods', () => {
    it('should stop all trackers', () => {
      ProgressLogger('task-1').setTotal(100);
      ProgressLogger('task-2').setTotal(200);
      ProgressLogger('task-3').setTotal(300);

      expect(registry.getAll().length).toBe(3);

      ProgressLogger.stopAll();

      expect(registry.getAll().length).toBe(0);
    });

    it('should set logger interval', () => {
      expect(() => ProgressLogger.setLoggerInterval(5000)).not.toThrow();
    });

    it('should throw error for invalid interval', () => {
      expect(() => ProgressLogger.setLoggerInterval(0)).toThrow('Interval must be positive');
      expect(() => ProgressLogger.setLoggerInterval(-1000)).toThrow('Interval must be positive');
    });

    it('should set quiet mode', () => {
      ProgressLogger.setQuiet(true);
      const task = ProgressLogger('quiet-test');
      task.setTotal(100);

      // Render should not output anything
      jest.advanceTimersByTime(10000);
      expect(mockStdout).not.toHaveBeenCalled();

      ProgressLogger.setQuiet(false);
    });
  });

  describe('lifecycle and callbacks', () => {
    it('should trigger immediate render on finish', () => {
      mockStdout.mockClear();
      const task = ProgressLogger('finish-render');
      task.setTotal(100);
      task.setCurrent(99);

      mockStdout.mockClear();
      task.increment(1); // Should finish and immediately render

      expect(mockStdout).toHaveBeenCalled();
    });

    it('should remove tracker when done is called', () => {
      const task = ProgressLogger('done-test');
      task.setTotal(100);

      expect(registry.getAll().length).toBe(1);

      task.done();

      expect(registry.getAll().length).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle current > total', () => {
      const task = ProgressLogger('overrun');
      task.setTotal(100);
      task.setCurrent(150);

      expect(task.getState().status).toBe('finished');
      expect(task.getState().current).toBe(150);
    });

    it('should handle negative increments', () => {
      const task = ProgressLogger('negative');
      task.setCurrent(10);
      task.increment(-20);

      expect(task.getState().current).toBe(0); // Clamped at 0
    });

    it('should handle zero total', () => {
      const task = ProgressLogger('zero-total');
      expect(() => task.setTotal(0)).not.toThrow();

      task.setCurrent(0);
      expect(task.getState().status).toBe('finished');
    });

    it('should handle rapid updates', () => {
      const task = ProgressLogger('rapid');
      task.setTotal(1000);

      for (let i = 0; i < 100; i++) {
        task.increment(1);
      }

      expect(task.getState().current).toBe(100);
      expect(task.getState().status).toBe('running');
    });

    it('should handle multiple pause/resume cycles', () => {
      const task = ProgressLogger('multi-pause');
      task.setTotal(100);

      task.pause();
      task.resume();
      task.pause();
      task.resume();
      task.pause();
      task.resume();

      expect(task.getState().status).toBe('running');
      expect(task.isActive()).toBe(true);
    });
  });

  describe('real-world workflows', () => {
    it('should handle typical batch processing workflow', () => {
      const task = ProgressLogger('batch-process');
      task.setTotal(1000);

      // Process items in batches
      for (let batch = 0; batch < 10; batch++) {
        task.increment(100);
      }

      expect(task.getState().status).toBe('finished');
      expect(task.getState().current).toBe(1000);
    });

    it('should handle pause during long operation', () => {
      const task = ProgressLogger('long-operation');
      task.setTotal(100);

      // Do some work
      task.increment(30);

      // Pause for some reason
      task.pause();
      expect(task.isActive()).toBe(false);

      // Resume later
      task.resume();
      expect(task.isActive()).toBe(true);

      // Finish work
      task.increment(70);
      expect(task.getState().status).toBe('finished');
    });

    it('should handle concurrent tasks with different lifecycles', () => {
      const updating = ProgressLogger('updating');
      const inserting = ProgressLogger('inserting');
      const deleting = ProgressLogger('deleting');

      // Start all tasks
      updating.setTotal(100);
      inserting.setTotal(200);
      deleting.setTotal(50);

      // Make progress
      updating.setCurrent(50);
      inserting.setCurrent(100);
      deleting.setCurrent(25);

      // One finishes early
      deleting.setCurrent(50);
      expect(deleting.getState().status).toBe('finished');

      // Another pauses
      updating.pause();
      expect(updating.isActive()).toBe(false);

      // Only one is active
      expect(registry.getActiveCount()).toBe(1);

      // Resume and finish
      updating.resume();
      updating.setCurrent(100);
      inserting.setCurrent(200);

      expect(registry.getActiveCount()).toBe(0);
    });

    it('should handle cleanup workflow', () => {
      ProgressLogger('task-1').setTotal(100);
      ProgressLogger('task-2').setTotal(200);
      ProgressLogger('task-3').setTotal(300);

      expect(registry.getAll().length).toBe(3);

      // Individual cleanup
      ProgressLogger('task-1').done();
      expect(registry.getAll().length).toBe(2);

      // Bulk cleanup
      ProgressLogger.stopAll();
      expect(registry.getAll().length).toBe(0);
    });
  });
});
