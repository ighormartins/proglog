// Example demonstrating the counter feature

const ProgressLogger = require('../dist/cjs/index.js').default;

async function simulateProcessing() {
  const processor = ProgressLogger('processing');
  processor.setTotal(100);

  for (let i = 0; i < 100; i++) {
    processor.increment();

    // Count errors randomly
    if (Math.random() > 0.9) {
      processor.count('errors');
    }

    // Count warnings with different weights
    if (Math.random() > 0.7) {
      processor.count('warnings', 2);
    }

    // Count skipped items
    if (Math.random() > 0.85) {
      processor.count('skipped');
    }

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Final summary is automatically displayed
  console.log('\nProcessing complete!');
  processor.done();
}

simulateProcessing();
