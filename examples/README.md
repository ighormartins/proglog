# ProgressLogger Examples

This directory contains runnable examples demonstrating various features of ProgressLogger.

## Prerequisites

Build the project first:

```bash
npm run build
```

## Running Examples

Run any example with Node.js:

```bash
node examples/basic.js
node examples/multiple-tasks.js
node examples/pause-resume.js
node examples/batch-processing.js
node examples/quiet-mode.js
node examples/chaining.js
node examples/short-alias.js
```

## Examples Overview

### `basic.js`
The simplest example showing how to track a single task.

**Features demonstrated:**
- Creating a tracker
- Setting total
- Incrementing progress
- Automatic cleanup on completion

### `short-alias.js`
Using the PLG alias for less typing.

**Features demonstrated:**
- PLG short alias
- Convenient for many progress updates
- Same functionality, shorter code

### `multiple-tasks.js`
Track multiple concurrent tasks with different speeds and totals.

**Features demonstrated:**
- Multiple trackers running simultaneously
- Different update rates
- Auto-rendering of all active tasks

### `pause-resume.js`
Pause and resume a task during execution.

**Features demonstrated:**
- Pausing a task (e.g., during rate limiting)
- Resuming a task
- Elapsed time calculation excluding paused periods

### `batch-processing.js`
Real-world batch processing workflow with multiple phases.

**Features demonstrated:**
- Sequential task workflow
- Custom render interval
- Large-scale data processing pattern

### `quiet-mode.js`
Disable progress output for silent execution.

**Features demonstrated:**
- Enabling/disabling quiet mode
- Programmatic progress tracking without visual output
- Useful for testing and CI environments

### `chaining.js`
Method chaining for concise tracker configuration.

**Features demonstrated:**
- Chainable API
- Fluent interface pattern
- Combining multiple operations

## Tips

1. **Update Interval**: Default is 10 seconds. Adjust with:
   ```javascript
   ProgressLogger.setLoggerInterval(5000); // 5 seconds
   ```

2. **Quiet Mode**: Disable output during tests:
   ```javascript
   ProgressLogger.setQuiet(true);
   ```

3. **Stop All**: Remove all trackers at once:
   ```javascript
   ProgressLogger.stopAll();
   ```
