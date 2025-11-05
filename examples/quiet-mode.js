/**
 * Quiet mode example
 *
 * This example shows how to disable progress output,
 * useful for testing or when you want silent execution.
 */

const ProgressLogger = require('../dist/cjs/index.js').default;

// Enable quiet mode (no output)
ProgressLogger.setQuiet(true);

ProgressLogger('silent-processing').setTotal(100);

console.log('Processing in quiet mode (no progress table will be shown)...');

let current = 0;
const interval = setInterval(() => {
  current++;
  ProgressLogger('silent-processing').increment();

  // You can still track progress programmatically
  if (current % 25 === 0) {
    console.log(`Progress: ${current}%`);
  }

  if (current >= 100) {
    clearInterval(interval);
    console.log('✅ Processing complete!');

    // Re-enable output for other parts of your application
    ProgressLogger.setQuiet(false);
    process.exit(0);
  }
}, 50);
