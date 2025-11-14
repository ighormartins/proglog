/**
 * Tests for Progress class
 */

import { Progress } from '../progress';

describe('Progress', () => {
  describe('constructor', () => {
    it('should create a new Progress instance in initial state', () => {
      const progress = new Progress('test-task');
      const state = progress.getState();

      expect(state.name).toBe('test-task');
      expect(state.current).toBe(0);
      expect(state.total).toBeNull();
      expect(state.status).toBe('initial');
      expect(state.startedAt).toBeNull();
      expect(state.pauseBuffer).toBe(0);
      expect(state.startCurrent).toBe(0);
      expect(state.lastUpdatedAt).toBeGreaterThan(0);
    });
  });

  describe('setTotal', () => {
    it('should set total and transition from initial to running', () => {
      const progress = new Progress('test');
      progress.setTotal(100);
      const state = progress.getState();

      expect(state.total).toBe(100);
      expect(state.status).toBe('running');
      expect(state.startedAt).toBeGreaterThan(0);
    });

    it('should return this for chaining', () => {
      const progress = new Progress('test');
      const result = progress.setTotal(100);
      expect(result).toBe(progress);
    });

    it('should throw error for negative total', () => {
      const progress = new Progress('test');
      expect(() => progress.setTotal(-1)).toThrow('Total must be non-negative');
    });

    it('should allow total of 0', () => {
      const progress = new Progress('test');
      expect(() => progress.setTotal(0)).not.toThrow();
      expect(progress.getState().total).toBe(0);
    });

    it('should auto-transition to finished if current >= total', () => {
      const progress = new Progress('test');
      progress.setCurrent(10);
      progress.setTotal(10);

      expect(progress.getState().status).toBe('finished');
    });

    it('should not change status if already running', () => {
      const progress = new Progress('test');
      progress.setTotal(100);
      const firstStartedAt = progress.getState().startedAt;

      progress.setTotal(200);
      const secondStartedAt = progress.getState().startedAt;

      expect(progress.getState().status).toBe('running');
      expect(secondStartedAt).toBe(firstStartedAt); // Should not reset timer
    });
  });

  describe('setCurrent', () => {
    it('should set current value', () => {
      const progress = new Progress('test');
      progress.setCurrent(50);

      expect(progress.getState().current).toBe(50);
    });

    it('should return this for chaining', () => {
      const progress = new Progress('test');
      const result = progress.setCurrent(50);
      expect(result).toBe(progress);
    });

    it('should clamp negative values to 0 with warning', () => {
      const progress = new Progress('test');
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      progress.setCurrent(-10);

      expect(progress.getState().current).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('clamping negative value'));

      consoleSpy.mockRestore();
    });

    it('should auto-transition to finished when current >= total', () => {
      const progress = new Progress('test');
      progress.setTotal(100);
      progress.setCurrent(100);

      expect(progress.getState().status).toBe('finished');
    });

    it('should auto-transition to finished when current > total', () => {
      const progress = new Progress('test');
      progress.setTotal(100);
      progress.setCurrent(150);

      expect(progress.getState().status).toBe('finished');
    });
  });

  describe('increment', () => {
    it('should increment current by default amount (1)', () => {
      const progress = new Progress('test');
      progress.increment();

      expect(progress.getState().current).toBe(1);
    });

    it('should increment current by specified amount', () => {
      const progress = new Progress('test');
      progress.increment(10);

      expect(progress.getState().current).toBe(10);
    });

    it('should return this for chaining', () => {
      const progress = new Progress('test');
      const result = progress.increment();
      expect(result).toBe(progress);
    });

    it('should handle multiple increments', () => {
      const progress = new Progress('test');
      progress.increment(5);
      progress.increment(3);
      progress.increment(2);

      expect(progress.getState().current).toBe(10);
    });

    it('should clamp negative increments to keep current >= 0', () => {
      const progress = new Progress('test');
      progress.setCurrent(5);
      progress.increment(-10);

      expect(progress.getState().current).toBe(0);
    });

    it('should auto-transition to finished when reaching total', () => {
      const progress = new Progress('test');
      progress.setTotal(10);
      progress.increment(10);

      expect(progress.getState().status).toBe('finished');
    });

    it('should support chaining with setTotal and setCurrent', () => {
      const progress = new Progress('test');
      progress.setTotal(100).setCurrent(50).increment(25).increment(5);

      expect(progress.getState().current).toBe(80);
      expect(progress.getState().total).toBe(100);
    });
  });

  describe('pause', () => {
    it('should transition from running to paused', () => {
      const progress = new Progress('test');
      progress.setTotal(100);
      progress.pause();

      expect(progress.getState().status).toBe('paused');
    });

    it('should save elapsed time to pauseBuffer', () => {
      const progress = new Progress('test');
      progress.setTotal(100);

      // Simulate some time passing
      const state = progress.getState();
      const startedAt = state.startedAt!;
      const mockNow = startedAt + 5000;

      jest.spyOn(Date, 'now').mockReturnValue(mockNow);
      progress.pause();
      jest.restoreAllMocks();

      const pausedState = progress.getState();
      expect(pausedState.pauseBuffer).toBeGreaterThanOrEqual(5000);
    });

    it('should return this for chaining', () => {
      const progress = new Progress('test');
      progress.setTotal(100);
      const result = progress.pause();
      expect(result).toBe(progress);
    });

    it('should do nothing if not in running state', () => {
      const progress = new Progress('test');
      progress.pause(); // Pause while in initial state

      expect(progress.getState().status).toBe('initial');
      expect(progress.getState().pauseBuffer).toBe(0);
    });

    it('should do nothing if already paused', () => {
      const progress = new Progress('test');
      progress.setTotal(100);
      progress.pause();
      const pauseBuffer1 = progress.getState().pauseBuffer;

      progress.pause(); // Pause again
      const pauseBuffer2 = progress.getState().pauseBuffer;

      expect(pauseBuffer2).toBe(pauseBuffer1);
    });
  });

  describe('resume', () => {
    it('should transition from paused to running', () => {
      const progress = new Progress('test');
      progress.setTotal(100);
      progress.pause();
      progress.resume();

      expect(progress.getState().status).toBe('running');
    });

    it('should reset startedAt when resuming', () => {
      const progress = new Progress('test');
      progress.setTotal(100);

      const originalStart = progress.getState().startedAt;

      // Mock time progression
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 1000);
      progress.pause();
      const pausedStart = progress.getState().startedAt;

      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 2000);
      progress.resume();
      const resumedStart = progress.getState().startedAt;
      jest.restoreAllMocks();

      expect(resumedStart).toBeGreaterThan(pausedStart!);
      expect(resumedStart).toBeGreaterThan(originalStart!);
    });

    it('should return this for chaining', () => {
      const progress = new Progress('test');
      progress.setTotal(100);
      progress.pause();
      const result = progress.resume();
      expect(result).toBe(progress);
    });

    it('should do nothing if not in paused state', () => {
      const progress = new Progress('test');
      progress.setTotal(100);
      const startedAt = progress.getState().startedAt;

      progress.resume(); // Resume while running

      expect(progress.getState().status).toBe('running');
      expect(progress.getState().startedAt).toBe(startedAt);
    });

    it('should preserve pauseBuffer when resuming', () => {
      const progress = new Progress('test');
      progress.setTotal(100);

      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 5000);
      progress.pause();
      const pauseBuffer = progress.getState().pauseBuffer;
      jest.restoreAllMocks();

      progress.resume();

      expect(progress.getState().pauseBuffer).toBe(pauseBuffer);
    });
  });

  describe('done', () => {
    it('should trigger done callback', () => {
      const callback = jest.fn();
      Progress.setDoneCallback(callback);

      const progress = new Progress('test-done');
      progress.done();

      expect(callback).toHaveBeenCalledWith('test-done');
    });

    it('should return this for chaining', () => {
      const progress = new Progress('test');
      const result = progress.done();
      expect(result).toBe(progress);
    });
  });

  describe('finished callback', () => {
    it('should trigger finished callback when reaching 100%', () => {
      const callback = jest.fn();
      Progress.setFinishedCallback(callback);

      const progress = new Progress('test-finish');
      progress.setTotal(100);
      progress.setCurrent(100);

      expect(callback).toHaveBeenCalledWith('test-finish');
    });

    it('should trigger finished callback when incrementing to 100%', () => {
      const callback = jest.fn();
      Progress.setFinishedCallback(callback);

      const progress = new Progress('test-finish');
      progress.setTotal(10);
      progress.setCurrent(9);
      progress.increment();

      expect(callback).toHaveBeenCalledWith('test-finish');
    });

    it('should trigger finished callback in setTotal if current >= total', () => {
      const callback = jest.fn();
      Progress.setFinishedCallback(callback);

      const progress = new Progress('test-finish');
      progress.setCurrent(100);
      progress.setTotal(100);

      expect(callback).toHaveBeenCalledWith('test-finish');
    });
  });

  describe('getName', () => {
    it('should return the tracker name', () => {
      const progress = new Progress('my-task');
      expect(progress.getName()).toBe('my-task');
    });
  });

  describe('isActive', () => {
    it('should return false for initial state', () => {
      const progress = new Progress('test');
      expect(progress.isActive()).toBe(false);
    });

    it('should return true for running state', () => {
      const progress = new Progress('test');
      progress.setTotal(100);
      expect(progress.isActive()).toBe(true);
    });

    it('should return false for paused state', () => {
      const progress = new Progress('test');
      progress.setTotal(100);
      progress.pause();
      expect(progress.isActive()).toBe(false);
    });

    it('should return false for finished state', () => {
      const progress = new Progress('test');
      progress.setTotal(100);
      progress.setCurrent(100);
      expect(progress.isActive()).toBe(false);
    });
  });

  describe('getState', () => {
    it('should return a copy of the state', () => {
      const progress = new Progress('test');
      const state1 = progress.getState();
      const state2 = progress.getState();

      expect(state1).not.toBe(state2); // Different objects
      expect(state1).toEqual(state2); // Same content
    });
  });

  describe('chaining', () => {
    it('should support full chaining workflow', () => {
      const progress = new Progress('chained')
        .setTotal(100)
        .setCurrent(20)
        .increment(10)
        .increment(5);

      expect(progress.getState().current).toBe(35);
      expect(progress.getState().total).toBe(100);
      expect(progress.getState().status).toBe('running');
    });

    it('should support pause/resume chaining', () => {
      const progress = new Progress('chained')
        .setTotal(100)
        .setCurrent(50)
        .pause()
        .resume()
        .increment(10);

      expect(progress.getState().current).toBe(60);
      expect(progress.getState().status).toBe('running');
    });
  });

  describe('count', () => {
    it('should create counter with value 1 when called without value', () => {
      const progress = new Progress('test');
      progress.count('errors');

      const state = progress.getState();
      expect(state.counters.get('errors')).toBe(1);
    });

    it('should increment existing counter by 1 when called without value', () => {
      const progress = new Progress('test');
      progress.count('errors');
      progress.count('errors');
      progress.count('errors');

      const state = progress.getState();
      expect(state.counters.get('errors')).toBe(3);
    });

    it('should create counter with initial value when called with value', () => {
      const progress = new Progress('test');
      progress.count('errors', 5);

      const state = progress.getState();
      expect(state.counters.get('errors')).toBe(5);
    });

    it('should increment existing counter by value when called with value', () => {
      const progress = new Progress('test');
      progress.count('errors', 3);
      progress.count('errors', 5);

      const state = progress.getState();
      expect(state.counters.get('errors')).toBe(8);
    });

    it('should support multiple different counters', () => {
      const progress = new Progress('test');
      progress.count('errors');
      progress.count('warnings', 2);
      progress.count('skipped', 10);
      progress.count('errors');

      const state = progress.getState();
      expect(state.counters.get('errors')).toBe(2);
      expect(state.counters.get('warnings')).toBe(2);
      expect(state.counters.get('skipped')).toBe(10);
    });

    it('should support negative values', () => {
      const progress = new Progress('test');
      progress.count('delta', 5);
      progress.count('delta', -3);

      const state = progress.getState();
      expect(state.counters.get('delta')).toBe(2);
    });

    it('should support zero values', () => {
      const progress = new Progress('test');
      progress.count('retries', 0);

      const state = progress.getState();
      expect(state.counters.get('retries')).toBe(0);
    });

    it('should return this for chaining', () => {
      const progress = new Progress('test');
      const result = progress.count('errors');
      expect(result).toBe(progress);
    });

    it('should support chaining with other methods', () => {
      const progress = new Progress('test')
        .setTotal(100)
        .setCurrent(50)
        .count('errors')
        .count('warnings', 5)
        .increment(10);

      const state = progress.getState();
      expect(state.current).toBe(60);
      expect(state.counters.get('errors')).toBe(1);
      expect(state.counters.get('warnings')).toBe(5);
    });

    it('should persist counters across pause/resume', () => {
      const progress = new Progress('test');
      progress.setTotal(100);
      progress.count('errors', 3);
      progress.pause();
      progress.count('errors', 2);
      progress.resume();

      const state = progress.getState();
      expect(state.counters.get('errors')).toBe(5);
    });
  });

  describe('resetCounter', () => {
    it('should reset existing counter to 0', () => {
      const progress = new Progress('test');
      progress.count('errors', 10);
      progress.resetCounter('errors');

      const state = progress.getState();
      expect(state.counters.get('errors')).toBe(0);
    });

    it('should create counter with 0 if it does not exist', () => {
      const progress = new Progress('test');
      progress.resetCounter('errors');

      const state = progress.getState();
      expect(state.counters.get('errors')).toBe(0);
    });

    it('should return this for chaining', () => {
      const progress = new Progress('test');
      const result = progress.resetCounter('errors');
      expect(result).toBe(progress);
    });

    it('should support chaining with count', () => {
      const progress = new Progress('test')
        .count('errors', 5)
        .resetCounter('errors')
        .count('errors');

      const state = progress.getState();
      expect(state.counters.get('errors')).toBe(1);
    });
  });

  describe('constructor with counters', () => {
    it('should initialize counters as empty Map', () => {
      const progress = new Progress('test-task');
      const state = progress.getState();

      expect(state.counters).toBeInstanceOf(Map);
      expect(state.counters.size).toBe(0);
    });
  });

  describe('getState with counters', () => {
    it('should return a copy of the counters map', () => {
      const progress = new Progress('test');
      progress.count('errors', 5);

      const state1 = progress.getState();
      const state2 = progress.getState();

      expect(state1.counters).not.toBe(state2.counters); // Different Map instances
      expect(state1.counters.get('errors')).toBe(5);
      expect(state2.counters.get('errors')).toBe(5);

      // Mutating one shouldn't affect the other
      state1.counters.set('errors', 100);
      expect(state2.counters.get('errors')).toBe(5);
      expect(progress.getState().counters.get('errors')).toBe(5);
    });
  });
});
