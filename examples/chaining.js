/**
 * Method chaining example
 *
 * This example demonstrates the chainable API,
 * allowing you to configure trackers in a single expression.
 */

const ProgressLogger = require('../dist/cjs/index.js').default;

// Create and configure tracker with chaining
ProgressLogger('data-processor').setTotal(100).setCurrent(0);

let current = 0;
const interval = setInterval(() => {
  current++;

  // Chain increment with other methods
  ProgressLogger('data-processor').increment();

  // Demonstrate pause/resume chaining
  if (current === 50) {
    console.log('\n⏸️  Taking a break...');
    ProgressLogger('data-processor').pause();

    setTimeout(() => {
      console.log('▶️  Back to work!\n');
      ProgressLogger('data-processor').resume();
    }, 2000);
  }

  if (current >= 100) {
    clearInterval(interval);
    console.log('\n✅ Done!');
    setTimeout(() => process.exit(0), 4000);
  }
}, 100);
