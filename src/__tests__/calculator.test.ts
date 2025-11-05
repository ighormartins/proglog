/**
 * Tests for calculator module
 */

import {
  calculatePercentage,
  calculateElapsed,
  calculateRate,
  calculateEta,
  calculateMetrics,
} from '../calculator';
import type { ProgressState } from '../types';

describe('calculator', () => {
  describe('calculatePercentage', () => {
    it('should return 0 when total is null', () => {
      expect(calculatePercentage(50, null)).toBe(0);
    });

    it('should return 0 when total is 0', () => {
      expect(calculatePercentage(0, 0)).toBe(0);
    });

    it('should calculate correct percentage', () => {
      expect(calculatePercentage(25, 100)).toBe(25);
    });

    it('should round percentage to whole number', () => {
      expect(calculatePercentage(33, 100)).toBe(33);
    });

    it('should cap percentage at 100 when current > total', () => {
      expect(calculatePercentage(150, 100)).toBe(100);
    });
  });

  describe('calculateElapsed', () => {
    it('should return 0 for initial state', () => {
      const state: ProgressState = {
        name: 'test',
        current: 0,
        total: null,
        status: 'initial',
        startedAt: null,
        lastUpdatedAt: Date.now(),
        startCurrent: 0,
        pauseBuffer: 0,
      };
      expect(calculateElapsed(state)).toBe(0);
    });

    it('should return only pauseBuffer for paused state', () => {
      const state: ProgressState = {
        name: 'test',
        current: 50,
        total: 100,
        status: 'paused',
        startedAt: Date.now() - 5000,
        lastUpdatedAt: Date.now(),
        startCurrent: 0,
        pauseBuffer: 10000,
      };
      expect(calculateElapsed(state)).toBe(10000);
    });

    it('should return only pauseBuffer for finished state', () => {
      const state: ProgressState = {
        name: 'test',
        current: 100,
        total: 100,
        status: 'finished',
        startedAt: Date.now() - 5000,
        lastUpdatedAt: Date.now(),
        startCurrent: 0,
        pauseBuffer: 15000,
      };
      expect(calculateElapsed(state)).toBe(15000);
    });

    it('should return pauseBuffer + current elapsed for running state', () => {
      const now = Date.now();
      const state: ProgressState = {
        name: 'test',
        current: 50,
        total: 100,
        status: 'running',
        startedAt: now - 5000,
        lastUpdatedAt: now,
        startCurrent: 0,
        pauseBuffer: 10000,
      };
      const elapsed = calculateElapsed(state);
      expect(elapsed).toBeGreaterThanOrEqual(15000);
      expect(elapsed).toBeLessThan(15100); // Allow small time variance
    });

    it('should handle running state without pauseBuffer', () => {
      const now = Date.now();
      const state: ProgressState = {
        name: 'test',
        current: 50,
        total: 100,
        status: 'running',
        startedAt: now - 5000,
        lastUpdatedAt: now,
        startCurrent: 0,
        pauseBuffer: 0,
      };
      const elapsed = calculateElapsed(state);
      expect(elapsed).toBeGreaterThanOrEqual(5000);
      expect(elapsed).toBeLessThan(5100);
    });
  });

  describe('calculateRate', () => {
    it('should return null for initial state', () => {
      const state: ProgressState = {
        name: 'test',
        current: 0,
        total: 100,
        status: 'initial',
        startedAt: null,
        lastUpdatedAt: Date.now(),
        startCurrent: 0,
        pauseBuffer: 0,
      };
      expect(calculateRate(state)).toBeNull();
    });

    it('should return null when elapsed time is less than 1 second', () => {
      const now = Date.now();
      const state: ProgressState = {
        name: 'test',
        current: 10,
        total: 100,
        status: 'running',
        startedAt: now - 500,
        lastUpdatedAt: now,
        startCurrent: 0,
        pauseBuffer: 0,
      };
      expect(calculateRate(state)).toBeNull();
    });

    it('should calculate rate in items per minute', () => {
      const now = Date.now();
      const state: ProgressState = {
        name: 'test',
        current: 60,
        total: 100,
        status: 'running',
        startedAt: now - 60000, // 1 minute ago
        lastUpdatedAt: now,
        startCurrent: 0,
        pauseBuffer: 0,
      };
      expect(calculateRate(state)).toBe(60); // 60 items in 1 minute
    });

    it('should calculate rate with pauseBuffer included', () => {
      const now = Date.now();
      const state: ProgressState = {
        name: 'test',
        current: 120,
        total: 200,
        status: 'running',
        startedAt: now - 30000, // 30 seconds current session
        lastUpdatedAt: now,
        startCurrent: 0,
        pauseBuffer: 30000, // 30 seconds from previous session
      };
      const rate = calculateRate(state);
      expect(rate).toBe(120); // 120 items in 1 minute total
    });

    it('should handle paused state with pauseBuffer', () => {
      const state: ProgressState = {
        name: 'test',
        current: 100,
        total: 200,
        status: 'paused',
        startedAt: Date.now() - 10000,
        lastUpdatedAt: Date.now(),
        startCurrent: 0,
        pauseBuffer: 60000, // 1 minute
      };
      expect(calculateRate(state)).toBe(100); // 100 items per minute
    });
  });

  describe('calculateEta', () => {
    it('should return null when total is null', () => {
      const state: ProgressState = {
        name: 'test',
        current: 50,
        total: null,
        status: 'running',
        startedAt: Date.now() - 60000,
        lastUpdatedAt: Date.now(),
        startCurrent: 0,
        pauseBuffer: 0,
      };
      expect(calculateEta(state, 50)).toBeNull();
    });

    it('should return 0 when already finished', () => {
      const state: ProgressState = {
        name: 'test',
        current: 100,
        total: 100,
        status: 'finished',
        startedAt: Date.now() - 60000,
        lastUpdatedAt: Date.now(),
        startCurrent: 0,
        pauseBuffer: 0,
      };
      expect(calculateEta(state, 50)).toBe(0);
    });

    it('should return null when rate is null', () => {
      const state: ProgressState = {
        name: 'test',
        current: 10,
        total: 100,
        status: 'running',
        startedAt: Date.now() - 500,
        lastUpdatedAt: Date.now(),
        startCurrent: 0,
        pauseBuffer: 0,
      };
      expect(calculateEta(state, null)).toBeNull();
    });

    it('should calculate ETA in milliseconds', () => {
      const now = Date.now();
      const state: ProgressState = {
        name: 'test',
        current: 50,
        total: 100,
        status: 'running',
        startedAt: now - 60000,
        lastUpdatedAt: now,
        startCurrent: 0,
        pauseBuffer: 0,
      };
      // Rate is 50/min, need 50 more, so ETA should be ~1 minute
      const eta = calculateEta(state, 50);
      expect(eta).toBeGreaterThanOrEqual(59000);
      expect(eta).toBeLessThanOrEqual(61000);
    });

    it('should handle very slow rate with epsilon guard', () => {
      const now = Date.now();
      const state: ProgressState = {
        name: 'test',
        current: 1,
        total: 1000000,
        status: 'running',
        startedAt: now - 60000,
        lastUpdatedAt: now,
        startCurrent: 0,
        pauseBuffer: 0,
      };
      const eta = calculateEta(state, 1);
      expect(eta).toBeGreaterThan(0);
      expect(eta).toBeLessThan(Infinity);
    });
  });

  describe('calculateMetrics', () => {
    it('should return all metrics for a running tracker', () => {
      const now = Date.now();
      const state: ProgressState = {
        name: 'test',
        current: 50,
        total: 100,
        status: 'running',
        startedAt: now - 60000,
        lastUpdatedAt: now,
        startCurrent: 0,
        pauseBuffer: 0,
      };

      const metrics = calculateMetrics(state);

      expect(metrics.percentage).toBe(50);
      expect(metrics.elapsed).toBeGreaterThanOrEqual(60000);
      expect(metrics.rate).toBeCloseTo(50, 0);
      expect(metrics.eta).toBeGreaterThanOrEqual(59000);
      expect(metrics.eta).toBeLessThanOrEqual(61000);
    });

    it('should handle initial state', () => {
      const state: ProgressState = {
        name: 'test',
        current: 0,
        total: null,
        status: 'initial',
        startedAt: null,
        lastUpdatedAt: Date.now(),
        startCurrent: 0,
        pauseBuffer: 0,
      };

      const metrics = calculateMetrics(state);

      expect(metrics.percentage).toBe(0);
      expect(metrics.elapsed).toBe(0);
      expect(metrics.rate).toBeNull();
      expect(metrics.eta).toBeNull();
    });

    it('should handle finished state', () => {
      const state: ProgressState = {
        name: 'test',
        current: 100,
        total: 100,
        status: 'finished',
        startedAt: Date.now() - 120000,
        lastUpdatedAt: Date.now(),
        startCurrent: 0,
        pauseBuffer: 120000,
      };

      const metrics = calculateMetrics(state);

      expect(metrics.percentage).toBe(100);
      expect(metrics.elapsed).toBe(120000);
      expect(metrics.rate).toBeCloseTo(50, 0);
      expect(metrics.eta).toBe(0); // Returns 0 when finished
    });
  });
});
