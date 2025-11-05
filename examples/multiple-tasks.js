/**
 * Multiple concurrent tasks example
 *
 * This example shows how to track multiple tasks running
 * simultaneously with different speeds and totals.
 */

const ProgressLogger = require('../dist/cjs/index.js').default;

// Set up multiple trackers - no need for variables!
ProgressLogger('fetching-data').setTotal(50);
ProgressLogger('processing-items').setTotal(200);
ProgressLogger('uploading-results').setTotal(150);

let allDone = false;

// Simulate fetching (fast)
let fetchCurrent = 0;
const fetchInterval = setInterval(() => {
  fetchCurrent += 2;
  ProgressLogger('fetching-data').increment(2);

  if (fetchCurrent >= 50) {
    clearInterval(fetchInterval);
  }
}, 100);

// Simulate processing (medium speed)
let processCurrent = 0;
const processInterval = setInterval(() => {
  processCurrent++;
  ProgressLogger('processing-items').increment();

  if (processCurrent >= 200) {
    clearInterval(processInterval);
  }
}, 150);

// Simulate uploading (slow)
let uploadCurrent = 0;
const uploadInterval = setInterval(() => {
  uploadCurrent++;
  ProgressLogger('uploading-results').increment();

  if (uploadCurrent >= 150) {
    clearInterval(uploadInterval);
    if (!allDone) {
      allDone = true;
      console.log('\n✅ All tasks complete!');
      setTimeout(() => process.exit(0), 4000);
    }
  }
}, 200);
