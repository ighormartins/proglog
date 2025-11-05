/**
 * Batch processing example
 *
 * This example shows a typical batch processing workflow:
 * 1. Fetch records from a data source
 * 2. Validate each record
 * 3. Save valid records to database
 */

const ProgressLogger = require('../dist/cjs/index.js').default;

// Configure for faster updates (default is 10 seconds)
ProgressLogger.setLoggerInterval(5000);

async function simulateDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runBatchProcess() {
  const TOTAL_RECORDS = 1000;

  // Phase 1: Fetching
  console.log('Starting batch process...\n');
  ProgressLogger('fetch-records').setTotal(TOTAL_RECORDS);

  for (let i = 0; i < TOTAL_RECORDS; i++) {
    ProgressLogger('fetch-records').increment();
    if (i % 50 === 0) await simulateDelay(10);
  }

  // Phase 2: Validating
  ProgressLogger('validate-records').setTotal(TOTAL_RECORDS);

  for (let i = 0; i < TOTAL_RECORDS; i++) {
    ProgressLogger('validate-records').increment();
    if (i % 50 === 0) await simulateDelay(10);
  }

  // Phase 3: Saving
  ProgressLogger('save-to-db').setTotal(TOTAL_RECORDS);

  for (let i = 0; i < TOTAL_RECORDS; i++) {
    ProgressLogger('save-to-db').increment();
    if (i % 50 === 0) await simulateDelay(10);
  }

  console.log('\n✅ Batch process complete!');
  console.log(`Processed ${TOTAL_RECORDS} records`);

  // Give it time to show completion
  setTimeout(() => process.exit(0), 4000);
}

runBatchProcess();
