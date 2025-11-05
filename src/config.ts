// Global config

import type { ProgressLoggerConfig } from './types';

const DEFAULT_CONFIG: ProgressLoggerConfig = {
  quiet: false,
};

let globalConfig: ProgressLoggerConfig = { ...DEFAULT_CONFIG };

// Get config
export function getConfig(): ProgressLoggerConfig {
  return { ...globalConfig };
}

// Set quiet mode
export function setQuiet(quiet: boolean): void {
  globalConfig.quiet = quiet;
}

// Reset to defaults
export function resetConfig(): void {
  globalConfig = { ...DEFAULT_CONFIG };
}
