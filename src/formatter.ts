// Format progress display

// Format progress bar
export function formatProgressBar(percentage: number, width: number): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}

// Format ETA
export function formatEta(etaMs: number | null): string {
  if (etaMs === null) {
    return '—';
  }

  const seconds = Math.floor(etaMs / 1000);

  if (seconds < 60) {
    return '<1m';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes.toString().padStart(2, '0')}m`;
}

// Format rate
export function formatRate(rate: number | null): string {
  if (rate === null) {
    return '—';
  }
  return `${Math.round(rate)}/min`;
}

// Format elapsed time
export function formatElapsed(elapsedMs: number): string {
  const seconds = Math.floor(elapsedMs / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

// Format number
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 1) + '…';
}
