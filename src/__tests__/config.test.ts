/**
 * Tests for config module
 */

import { getConfig, setQuiet, resetConfig } from '../config';

describe('config', () => {
  beforeEach(() => {
    resetConfig();
  });

  describe('getConfig', () => {
    it('should return default config', () => {
      const config = getConfig();

      expect(config).toEqual({
        quiet: false,
      });
    });

    it('should return a copy of the config', () => {
      const config1 = getConfig();
      const config2 = getConfig();

      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });

    it('should not allow external modification of config', () => {
      const config = getConfig();
      config.quiet = true;

      const newConfig = getConfig();
      expect(newConfig.quiet).toBe(false);
    });
  });

  describe('setQuiet', () => {
    it('should set quiet to true', () => {
      setQuiet(true);
      const config = getConfig();

      expect(config.quiet).toBe(true);
    });

    it('should set quiet to false', () => {
      setQuiet(true);
      setQuiet(false);
      const config = getConfig();

      expect(config.quiet).toBe(false);
    });

    it('should update the global config', () => {
      setQuiet(true);
      expect(getConfig().quiet).toBe(true);

      setQuiet(false);
      expect(getConfig().quiet).toBe(false);
    });
  });

  describe('resetConfig', () => {
    it('should reset config to defaults', () => {
      setQuiet(true);
      resetConfig();

      const config = getConfig();
      expect(config.quiet).toBe(false);
    });

    it('should work when called multiple times', () => {
      resetConfig();
      resetConfig();
      resetConfig();

      expect(getConfig().quiet).toBe(false);
    });
  });
});
