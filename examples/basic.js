/**
 * Basic usage example
 *
 * This example shows the simplest way to use ProgressLogger
 * to track a single long-running task.
 */

const ProgressLogger = require('../dist/cjs/index.js').default;

// No need to store in variables - just call it!
ProgressLogger('downloading-files').setTotal(100);

// Simulate processing items
let current = 0;
const interval = setInterval(() => {
  current++;
  ProgressLogger('downloading-files').increment();

  if (current >= 100) {
    clearInterval(interval);
    console.log('\n✅ Download complete!');
  }
}, 100);
