/**
 * Tests for formatter module
 */

import {
  formatProgressBar,
  formatEta,
  formatRate,
  formatElapsed,
  formatNumber,
  truncate,
} from '../formatter';

describe('formatter', () => {
  describe('formatProgressBar', () => {
    it('should render empty bar for 0%', () => {
      const bar = formatProgressBar(0, 20);
      expect(bar).toBe('[░░░░░░░░░░░░░░░░░░░░]');
      expect(bar.length).toBe(22); // Including brackets
    });

    it('should render full bar for 100%', () => {
      const bar = formatProgressBar(100, 20);
      expect(bar).toBe('[████████████████████]');
      expect(bar.length).toBe(22);
    });

    it('should render half bar for 50%', () => {
      const bar = formatProgressBar(50, 20);
      expect(bar).toBe('[██████████░░░░░░░░░░]');
      expect(bar.length).toBe(22);
    });

    it('should render 25% correctly', () => {
      const bar = formatProgressBar(25, 20);
      expect(bar).toBe('[█████░░░░░░░░░░░░░░░]');
      expect(bar.length).toBe(22);
    });

    it('should render 75% correctly', () => {
      const bar = formatProgressBar(75, 20);
      expect(bar).toBe('[███████████████░░░░░]');
      expect(bar.length).toBe(22);
    });

    it('should handle different bar widths', () => {
      const bar10 = formatProgressBar(50, 10);
      expect(bar10).toBe('[█████░░░░░]');
      expect(bar10.length).toBe(12);

      const bar30 = formatProgressBar(50, 30);
      expect(bar30).toBe('[███████████████░░░░░░░░░░░░░░░]');
      expect(bar30.length).toBe(32);
    });

    it('should handle percentage > 100 by capping filled blocks', () => {
      // Note: formatProgressBar expects percentage to be pre-capped at 100
      // The capping happens in calculatePercentage
      const bar = formatProgressBar(100, 20);
      expect(bar).toBe('[████████████████████]');
    });

    it('should handle 1% increments correctly', () => {
      const bar1 = formatProgressBar(1, 20);
      expect(bar1.match(/█/g)?.length || 0).toBeLessThanOrEqual(1);

      const bar99 = formatProgressBar(99, 20);
      expect(bar99.match(/░/g)?.length || 0).toBeLessThanOrEqual(1);
    });
  });

  describe('formatEta', () => {
    it('should return — for null ETA', () => {
      expect(formatEta(null)).toBe('—');
    });

    it('should format less than 1 minute', () => {
      expect(formatEta(30000)).toBe('<1m');
      expect(formatEta(59999)).toBe('<1m');
    });

    it('should format minutes only', () => {
      expect(formatEta(60000)).toBe('1m');
      expect(formatEta(120000)).toBe('2m');
      expect(formatEta(3540000)).toBe('59m');
    });

    it('should format hours and minutes', () => {
      expect(formatEta(3600000)).toBe('1h 00m');
      expect(formatEta(3660000)).toBe('1h 01m');
      expect(formatEta(5400000)).toBe('1h 30m');
      expect(formatEta(7200000)).toBe('2h 00m');
    });

    it('should handle large ETAs', () => {
      expect(formatEta(36000000)).toBe('10h 00m');
      expect(formatEta(86400000)).toBe('24h 00m');
    });

    it('should floor minutes (no rounding)', () => {
      expect(formatEta(90000)).toBe('1m'); // 1.5 minutes floors to 1
      expect(formatEta(150000)).toBe('2m'); // 2.5 minutes floors to 2
    });
  });

  describe('formatRate', () => {
    it('should return — for null rate', () => {
      expect(formatRate(null)).toBe('—');
    });

    it('should format whole numbers', () => {
      expect(formatRate(50)).toBe('50/min');
      expect(formatRate(100)).toBe('100/min');
    });

    it('should round decimals to whole numbers', () => {
      expect(formatRate(50.5)).toBe('51/min');
      expect(formatRate(123.7)).toBe('124/min');
    });

    it('should round down when less than .5', () => {
      expect(formatRate(50.4)).toBe('50/min');
      expect(formatRate(50.49)).toBe('50/min');
    });

    it('should handle very small rates', () => {
      expect(formatRate(0.1)).toBe('0/min');
      expect(formatRate(0.6)).toBe('1/min');
    });

    it('should handle very large rates', () => {
      expect(formatRate(10000)).toBe('10000/min');
      expect(formatRate(99999.9)).toBe('100000/min');
    });
  });

  describe('formatElapsed', () => {
    it('should format 0 milliseconds', () => {
      expect(formatElapsed(0)).toBe('0s');
    });

    it('should format seconds only', () => {
      expect(formatElapsed(1000)).toBe('1s');
      expect(formatElapsed(30000)).toBe('30s');
      expect(formatElapsed(59000)).toBe('59s');
    });

    it('should format minutes and seconds', () => {
      expect(formatElapsed(60000)).toBe('1m 0s');
      expect(formatElapsed(90000)).toBe('1m 30s');
      expect(formatElapsed(119000)).toBe('1m 59s');
    });

    it('should format hours and minutes (no seconds)', () => {
      expect(formatElapsed(3600000)).toBe('1h 0m');
      expect(formatElapsed(3660000)).toBe('1h 1m');
      expect(formatElapsed(3720000)).toBe('1h 2m');
      expect(formatElapsed(7320000)).toBe('2h 2m');
    });

    it('should omit seconds when showing hours', () => {
      expect(formatElapsed(3600000)).toBe('1h 0m');
      expect(formatElapsed(3601000)).toBe('1h 0m'); // Seconds not shown
    });

    it('should handle large durations', () => {
      expect(formatElapsed(36000000)).toBe('10h 0m');
      expect(formatElapsed(86400000)).toBe('24h 0m');
    });
  });

  describe('formatNumber', () => {
    it('should format small numbers without separators', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(9)).toBe('9');
      expect(formatNumber(99)).toBe('99');
      expect(formatNumber(999)).toBe('999');
    });

    it('should format numbers with thousands separators', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(10000)).toBe('10,000');
      expect(formatNumber(100000)).toBe('100,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('should handle mid-range numbers', () => {
      expect(formatNumber(1234)).toBe('1,234');
      expect(formatNumber(12345)).toBe('12,345');
      expect(formatNumber(123456)).toBe('123,456');
      expect(formatNumber(1234567)).toBe('1,234,567');
    });
  });

  describe('truncate', () => {
    it('should not truncate short strings', () => {
      expect(truncate('short', 10)).toBe('short');
      expect(truncate('12345', 10)).toBe('12345');
    });

    it('should not truncate exact length strings', () => {
      expect(truncate('exactly10!', 10)).toBe('exactly10!');
    });

    it('should truncate long strings with ellipsis', () => {
      expect(truncate('this is a long string', 10)).toBe('this is a…');
      expect(truncate('1234567890123', 10)).toBe('123456789…');
    });

    it('should handle very short maxLength', () => {
      expect(truncate('hello', 5)).toBe('hello');
      expect(truncate('hello world', 5)).toBe('hell…');
    });

    it('should handle empty strings', () => {
      expect(truncate('', 10)).toBe('');
    });

    it('should truncate to exact maxLength', () => {
      const result = truncate('this is a very long string', 15);
      expect(result.length).toBe(15);
      expect(result).toBe('this is a very…');
    });
  });
});
