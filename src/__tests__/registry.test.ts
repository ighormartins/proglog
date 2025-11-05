/**
 * Tests for registry module
 */

import { registry } from '../registry';
import { Progress } from '../progress';

describe('registry', () => {
  beforeEach(() => {
    // Clear registry before each test
    registry.clear();
  });

  describe('get', () => {
    it('should create and return a new Progress instance', () => {
      const progress = registry.get('test-task');

      expect(progress).toBeInstanceOf(Progress);
      expect(progress.getName()).toBe('test-task');
    });

    it('should return the same instance for the same name', () => {
      const progress1 = registry.get('test-task');
      const progress2 = registry.get('test-task');

      expect(progress1).toBe(progress2);
    });

    it('should return different instances for different names', () => {
      const progress1 = registry.get('task-1');
      const progress2 = registry.get('task-2');

      expect(progress1).not.toBe(progress2);
      expect(progress1.getName()).toBe('task-1');
      expect(progress2.getName()).toBe('task-2');
    });
  });

  describe('register', () => {
    it('should register a new Progress instance', () => {
      const progress = new Progress('manual-task');
      registry.register(progress);

      const retrieved = registry.get('manual-task');
      expect(retrieved).toBe(progress);
    });

    it('should replace existing instance with same name', () => {
      const progress1 = new Progress('task');
      const progress2 = new Progress('task');

      registry.register(progress1);
      registry.register(progress2);

      const retrieved = registry.get('task');
      expect(retrieved).toBe(progress2);
      expect(retrieved).not.toBe(progress1);
    });
  });

  describe('remove', () => {
    it('should remove a tracker by name', () => {
      registry.get('task-to-remove');
      registry.remove('task-to-remove');

      expect(registry.getAll().length).toBe(0);
    });

    it('should do nothing if tracker does not exist', () => {
      expect(() => registry.remove('non-existent')).not.toThrow();
    });

    it('should not affect other trackers', () => {
      registry.get('task-1');
      registry.get('task-2');
      registry.get('task-3');

      registry.remove('task-2');

      const all = registry.getAll();
      expect(all.length).toBe(2);
      expect(all.map((p) => p.getName())).toContain('task-1');
      expect(all.map((p) => p.getName())).toContain('task-3');
      expect(all.map((p) => p.getName())).not.toContain('task-2');
    });
  });

  describe('getAll', () => {
    it('should return empty array when no trackers exist', () => {
      expect(registry.getAll()).toEqual([]);
    });

    it('should return all registered trackers', () => {
      registry.get('task-1');
      registry.get('task-2');
      registry.get('task-3');

      const all = registry.getAll();
      expect(all.length).toBe(3);
      expect(all.map((p) => p.getName())).toContain('task-1');
      expect(all.map((p) => p.getName())).toContain('task-2');
      expect(all.map((p) => p.getName())).toContain('task-3');
    });

    it('should return a new array each time', () => {
      registry.get('task-1');

      const all1 = registry.getAll();
      const all2 = registry.getAll();

      expect(all1).not.toBe(all2);
      expect(all1).toEqual(all2);
    });
  });

  describe('clear', () => {
    it('should remove all trackers', () => {
      registry.get('task-1');
      registry.get('task-2');
      registry.get('task-3');

      registry.clear();

      expect(registry.getAll().length).toBe(0);
    });

    it('should reset active count', () => {
      const task1 = registry.get('task-1');
      const task2 = registry.get('task-2');

      task1.setTotal(100);
      task2.setTotal(200);

      expect(registry.getActiveCount()).toBe(2);

      registry.clear();

      expect(registry.getActiveCount()).toBe(0);
    });

    it('should do nothing if already empty', () => {
      expect(() => registry.clear()).not.toThrow();
      expect(registry.getAll().length).toBe(0);
    });
  });

  describe('hasActive', () => {
    it('should return false when no trackers exist', () => {
      expect(registry.hasActive()).toBe(false);
    });

    it('should return false when trackers exist but none are running', () => {
      registry.get('task-1'); // Initial state
      registry.get('task-2'); // Initial state

      expect(registry.hasActive()).toBe(false);
    });

    it('should return true when at least one tracker is running', () => {
      const task1 = registry.get('task-1');
      task1.setTotal(100); // Transitions to running

      expect(registry.hasActive()).toBe(true);
    });

    it('should return false when all running trackers are paused', () => {
      const task1 = registry.get('task-1');
      task1.setTotal(100);
      task1.pause();

      expect(registry.hasActive()).toBe(false);
    });

    it('should return false when all running trackers are finished', () => {
      const task1 = registry.get('task-1');
      task1.setTotal(100);
      task1.setCurrent(100);

      expect(registry.hasActive()).toBe(false);
    });

    it('should return true when some are running and others are paused/finished', () => {
      const task1 = registry.get('task-1');
      const task2 = registry.get('task-2');
      const task3 = registry.get('task-3');

      task1.setTotal(100); // Running
      task2.setTotal(100);
      task2.pause(); // Paused
      task3.setTotal(100);
      task3.setCurrent(100); // Finished

      expect(registry.hasActive()).toBe(true);
    });
  });

  describe('getActiveCount', () => {
    it('should return 0 when no trackers exist', () => {
      expect(registry.getActiveCount()).toBe(0);
    });

    it('should return 0 when trackers exist but none are running', () => {
      registry.get('task-1'); // Initial
      registry.get('task-2'); // Initial

      expect(registry.getActiveCount()).toBe(0);
    });

    it('should count only running trackers', () => {
      const task1 = registry.get('task-1');
      task1.setTotal(100); // Running

      expect(registry.getActiveCount()).toBe(1);
    });

    it('should not count paused trackers', () => {
      const task1 = registry.get('task-1');
      task1.setTotal(100);
      task1.pause(); // Paused

      expect(registry.getActiveCount()).toBe(0);
    });

    it('should not count finished trackers', () => {
      const task1 = registry.get('task-1');
      task1.setTotal(100);
      task1.setCurrent(100); // Finished

      expect(registry.getActiveCount()).toBe(0);
    });

    it('should count multiple running trackers', () => {
      const task1 = registry.get('task-1');
      const task2 = registry.get('task-2');
      const task3 = registry.get('task-3');

      task1.setTotal(100);
      task2.setTotal(200);
      task3.setTotal(300);

      expect(registry.getActiveCount()).toBe(3);
    });

    it('should update count when trackers change state', () => {
      const task1 = registry.get('task-1');
      const task2 = registry.get('task-2');

      task1.setTotal(100); // 1 active
      expect(registry.getActiveCount()).toBe(1);

      task2.setTotal(200); // 2 active
      expect(registry.getActiveCount()).toBe(2);

      task1.pause(); // 1 active
      expect(registry.getActiveCount()).toBe(1);

      task2.setCurrent(200); // 0 active (finished)
      expect(registry.getActiveCount()).toBe(0);
    });

    it('should handle mixed states correctly', () => {
      const task1 = registry.get('task-1');
      const task2 = registry.get('task-2');
      const task3 = registry.get('task-3');
      registry.get('task-4'); // Stays in initial

      task1.setTotal(100); // Running
      task2.setTotal(100);
      task2.pause(); // Paused
      task3.setTotal(100);
      task3.setCurrent(100); // Finished

      expect(registry.getActiveCount()).toBe(1); // Only task1 is running
    });
  });

  describe('singleton behavior', () => {
    it('should maintain the same registry instance across imports', () => {
      const task = registry.get('singleton-test');

      // Simulate another module getting the same tracker
      const sameTask = registry.get('singleton-test');

      expect(task).toBe(sameTask);
    });
  });
});
