/**
 * Visual tests - these tests actually render to stdout
 * Run these to see the progress bars in action!
 *
 * Usage:
 *   npm test -- visual.test.ts
 *   npm test -- --testNamePattern="visual"
 */

import { ProgressLogger } from '../index';

describe('ProgressLogger Visual Tests', () => {
  beforeEach(() => {
    ProgressLogger.stopAll();
  });

  afterEach(() => {
    ProgressLogger.stopAll();
  });

  // Helper to wait
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  describe('visual rendering', () => {
    it('should render single progress bar', async () => {
      console.log('\n=== Single Progress Bar Test ===\n');

      // Set faster interval for testing
      ProgressLogger.setLoggerInterval(1000);

      const task = ProgressLogger('downloading');
      task.setTotal(100);

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        task.setCurrent(i);
        await wait(200);
      }

      await wait(1500); // Wait to see final state

      task.done();
    }, 10000);

    it('should render multiple concurrent progress bars', async () => {
      console.log('\n=== Multiple Concurrent Progress Bars ===\n');

      ProgressLogger.setLoggerInterval(1000);

      const downloading = ProgressLogger('downloading');
      const processing = ProgressLogger('processing');
      const uploading = ProgressLogger('uploading');

      downloading.setTotal(100);
      processing.setTotal(200);
      uploading.setTotal(150);

      // Simulate different progress rates
      for (let i = 0; i < 50; i++) {
        downloading.increment(2); // Faster
        processing.increment(2); // Medium
        uploading.increment(1); // Slower

        await wait(100);
      }

      await wait(1500); // Wait to see final state

      downloading.done();
      processing.done();
      uploading.done();
    }, 15000);

    it('should show pause and resume', async () => {
      console.log('\n=== Pause and Resume Test ===\n');

      ProgressLogger.setLoggerInterval(1000);

      const task = ProgressLogger('processing');
      task.setTotal(100);

      // Progress to 30%
      for (let i = 0; i < 30; i++) {
        task.increment(1);
        await wait(50);
      }

      console.log('\n>>> Pausing...\n');
      task.pause();
      await wait(2000); // Paused for 2 seconds

      console.log('\n>>> Resuming...\n');
      task.resume();

      // Continue to 100%
      for (let i = 30; i < 100; i++) {
        task.increment(1);
        await wait(50);
      }

      await wait(1500); // Wait to see finished state

      task.done();
    }, 15000);

    it('should show different states', async () => {
      console.log('\n=== Different States Test ===\n');

      ProgressLogger.setLoggerInterval(1000);

      const initial = ProgressLogger('initial-task');
      const running = ProgressLogger('running-task');
      const paused = ProgressLogger('paused-task');

      await wait(1500); // Show initial state

      running.setTotal(100);
      paused.setTotal(100);

      await wait(1500); // Show running state

      // Make some progress
      for (let i = 0; i < 50; i++) {
        running.increment(1);
        paused.increment(1);
        await wait(50);
      }

      paused.pause();
      await wait(2000); // Show paused state

      // Finish running task
      for (let i = 50; i < 100; i++) {
        running.increment(1);
        await wait(50);
      }

      await wait(2000); // Show finished state

      // Start initial task
      initial.setTotal(50);
      for (let i = 0; i < 50; i++) {
        initial.increment(1);
        await wait(50);
      }

      await wait(1500);

      initial.done();
      running.done();
      paused.done();
    }, 20000);

    it('should show real-world batch processing', async () => {
      console.log('\n=== Real-World Batch Processing ===\n');

      ProgressLogger.setLoggerInterval(1000);

      const fetching = ProgressLogger('fetching-records');
      const validating = ProgressLogger('validating');
      const saving = ProgressLogger('saving');

      fetching.setTotal(1000);
      validating.setTotal(1000);
      saving.setTotal(1000);

      // Phase 1: Fetch all
      console.log('\n>>> Phase 1: Fetching records...\n');
      for (let i = 0; i < 1000; i += 50) {
        fetching.increment(50);
        await wait(200);
      }

      await wait(1000);

      // Phase 2: Validate all
      console.log('\n>>> Phase 2: Validating records...\n');
      for (let i = 0; i < 1000; i += 40) {
        validating.increment(40);
        await wait(200);
      }

      await wait(1000);

      // Phase 3: Save all
      console.log('\n>>> Phase 3: Saving records...\n');
      for (let i = 0; i < 1000; i += 30) {
        saving.increment(30);
        await wait(200);
      }

      await wait(1500);

      console.log('\n>>> All phases complete!\n');

      fetching.done();
      validating.done();
      saving.done();
    }, 25000);

    it('should show large numbers formatting', async () => {
      console.log('\n=== Large Numbers Formatting Test ===\n');

      ProgressLogger.setLoggerInterval(1000);

      const task = ProgressLogger('big-data-import');
      task.setTotal(1000000);

      // Increment by large amounts
      for (let i = 0; i < 1000000; i += 50000) {
        task.setCurrent(i);
        await wait(200);
      }

      await wait(1500);

      task.done();
    }, 15000);

    it('should show varying speeds', async () => {
      console.log('\n=== Varying Speed Progress Bars ===\n');

      ProgressLogger.setLoggerInterval(1000);

      const fast = ProgressLogger('fast-task');
      const medium = ProgressLogger('medium-task');
      const slow = ProgressLogger('slow-task');

      fast.setTotal(100);
      medium.setTotal(100);
      slow.setTotal(100);

      // Different speeds
      for (let i = 0; i < 100; i++) {
        if (i < 100) fast.increment(1);
        if (i % 2 === 0 && i < 100) medium.increment(1);
        if (i % 5 === 0 && i < 100) slow.increment(1);

        await wait(100);
      }

      await wait(1500);

      fast.done();
      medium.done();
      slow.done();
    }, 15000);
  });
});
