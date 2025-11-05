/**
 * Pause and resume example
 *
 * This example demonstrates pausing a task (e.g., during rate limiting
 * or waiting for resources) and then resuming it.
 */

const ProgressLogger = require('../dist/cjs/index.js').default;

ProgressLogger('processing-with-pauses').setTotal(100);

let current = 0;
let isPaused = false;
let interval;

function startProcessing() {
  interval = setInterval(() => {
    if (!isPaused) {
      current++;
      ProgressLogger('processing-with-pauses').increment();

      // Pause at 30% for 3 seconds (simulating rate limit)
      if (current === 30) {
        console.log('\n⏸️  Pausing due to rate limit...');
        isPaused = true;
        ProgressLogger('processing-with-pauses').pause();

        setTimeout(() => {
          console.log('▶️  Resuming...\n');
          isPaused = false;
          ProgressLogger('processing-with-pauses').resume();
        }, 3000);
      }

      // Pause again at 60% for 2 seconds
      if (current === 60) {
        console.log('\n⏸️  Pausing for system resources...');
        isPaused = true;
        ProgressLogger('processing-with-pauses').pause();

        setTimeout(() => {
          console.log('▶️  Resuming...\n');
          isPaused = false;
          ProgressLogger('processing-with-pauses').resume();
        }, 2000);
      }

      if (current >= 100) {
        clearInterval(interval);
        console.log('\n✅ Processing complete!');
        setTimeout(() => process.exit(0), 4000);
      }
    }
  }, 100);
}

startProcessing();
