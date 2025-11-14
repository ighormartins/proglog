# proglog

> A tiny Node.js library to track multiple long-running tasks and auto-render a live, aggregated progress table in the console.

[![npm version](https://img.shields.io/npm/v/proglog.svg)](https://www.npmjs.com/package/proglog)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/proglog.svg)](https://nodejs.org)

Built for CLI scripts, Node workers, cron jobs, and API servers. **Zero dependencies, fully typed, lightweight.**

## Why ProgressLogger?

**Super simple.** Just call `ProgressLogger('task-name')` (or `PLG('task-name')`) anywhere in your code. No setup, no initialization, no cleanup needed.

```javascript
import { PLG } from 'proglog';

// That's it! Just call and chain
PLG('download').setTotal(100);

for (let i = 0; i < 100; i++) {
  PLG('download').increment();
  // ... do work ...
}
```

**Output:**

```
Task                 Current/Total    %    Progress              Rate      ETA       Elapsed
────────────────────────────────────────────────────────────────────────────────────────────────────
download             100/100          100%  [████████████████████] 650/min   —          9s
```

## Features

- ⚡ **Zero setup** - No initialization, just call and use
- 🧹 **Auto cleanup** - Trackers automatically remove themselves when done
- 📊 **Live progress table** - Auto-renders every 10 seconds (configurable)
- 🔄 **Multiple tasks** - Track unlimited concurrent operations
- ⏸️ **Pause/Resume** - Handle rate limits and resource constraints
- 📈 **Smart metrics** - ETA, rate, elapsed time, and completion percentage
- 🔢 **Counters** - Track errors, warnings, retries, or any custom metrics per task
- 🎨 **TTY adaptive** - Beautiful ANSI output in terminals, clean logs in files
- 🔗 **Chainable API** - All methods return `this`
- 📦 **Zero dependencies** - Lightweight and fast
- 🔒 **TypeScript first** - Full type safety with ESM and CJS support

## Installation

```bash
npm install proglog
```

## Quick Start

**ESM (recommended):**
```javascript
import ProgressLogger from 'proglog';
// Or use the short alias:
import { PLG } from 'proglog';

// No need to store in a variable - just call it!
ProgressLogger('processing').setTotal(1000);

for (let i = 0; i < 1000; i++) {
  ProgressLogger('processing').increment();
  await processItem(i);
}
```

**CommonJS:**
```javascript
const ProgressLogger = require('proglog').default;
// Or use the short alias:
const { PLG } = require('proglog');

ProgressLogger('processing').setTotal(1000);
// ... rest is the same
```

**Output:**

```
Task                 Current/Total    %    Progress              Rate      ETA       Elapsed
────────────────────────────────────────────────────────────────────────────────────────────────────
downloading-files    50/100           50%  [██████████░░░░░░░░░░] 120/min   <1m       25s
```

## Table of Contents

- [Usage Examples](#usage-examples)
  - [Basic Usage](#basic-usage)
  - [Multiple Tasks](#multiple-tasks)
  - [Tracking Counters](#tracking-counters)
  - [Pause and Resume](#pause-and-resume)
  - [Batch Processing](#batch-processing)
  - [Method Chaining](#method-chaining)
- [API Reference](#api-reference)
  - [Factory Function](#factory-function)
  - [Progress Instance Methods](#progress-instance-methods)
  - [Static Methods](#static-methods)
- [Configuration](#configuration)
- [How It Works](#how-it-works)
- [Advanced Usage](#advanced-usage)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Usage Examples

### Basic Usage

```javascript
import ProgressLogger from 'proglog';
// Or use the short alias for less typing:
import { PLG } from 'proglog';

// Just call it directly - no variables needed!
PLG('my-task').setTotal(100);

for (let i = 0; i < 100; i++) {
  PLG('my-task').increment();
  // ... process item ...
}
```

### Multiple Tasks

Track multiple tasks simultaneously - each one automatically appears in the live table:

```javascript
import { PLG } from 'proglog';

// Set up multiple tasks
PLG('fetching-data').setTotal(50);
PLG('processing-items').setTotal(200);
PLG('uploading-results').setTotal(150);

// Update anywhere in your code
PLG('fetching-data').increment();
PLG('processing-items').increment();
PLG('uploading-results').increment();

// All tasks show in a single auto-updating table!
```

### Tracking Counters

Need to track errors, warnings, retries, or any other metrics alongside your progress? Use counters!

```javascript
import { PLG } from 'proglog';

PLG('processing').setTotal(100);

for (let i = 0; i < 100; i++) {
  PLG('processing').increment();

  try {
    await processItem(i);
  } catch (err) {
    PLG('processing').count('errors');  // Increment error counter

    if (shouldRetry(err)) {
      PLG('processing').count('retries', 2);  // Add 2 to retries counter
      await retry();
    }
  }

  if (needsWarning(i)) {
    PLG('processing').count('warnings');
  }
}
```

**Output:**

```
Task                 Current/Total    %    Progress              Rate      ETA       Elapsed
────────────────────────────────────────────────────────────────────────────────────────────────────
processing           75/100           75%  [███████████████░░░░░] 150/min   <1m       30s
  └─ errors: 3, retries: 6, warnings: 12
```

Counters show up as a sub-row beneath each tracker, automatically sorted alphabetically. Perfect for keeping an eye on issues as they happen!

### Pause and Resume

Handle rate limits or resource constraints:

```javascript
import ProgressLogger from 'proglog';

ProgressLogger('api-calls').setTotal(1000);

for (let i = 0; i < 1000; i++) {
  ProgressLogger('api-calls').increment();

  // Rate limited? Pause!
  if (rateLimitHit) {
    ProgressLogger('api-calls').pause();
    await wait(60000); // Wait 1 minute
    ProgressLogger('api-calls').resume();
  }

  await makeApiCall();
}
```

### Batch Processing

Real-world batch processing workflow:

```javascript
import ProgressLogger from 'proglog';

async function processBatch(records) {
  // Phase 1: Fetch
  ProgressLogger('fetch-records').setTotal(records.length);
  for (const record of records) {
    await fetchRecord(record);
    ProgressLogger('fetch-records').increment();
  }

  // Phase 2: Process
  ProgressLogger('process-records').setTotal(records.length);
  for (const record of records) {
    await processRecord(record);
    ProgressLogger('process-records').increment();
  }

  // Phase 3: Save
  ProgressLogger('save-records').setTotal(records.length);
  for (const record of records) {
    await saveRecord(record);
    ProgressLogger('save-records').increment();
  }
}
```

### Method Chaining

All methods return the tracker, so you can chain everything:

```javascript
import ProgressLogger from 'proglog';

// Chain everything in one go
ProgressLogger('my-task')
  .setTotal(100)
  .setCurrent(50)
  .increment(10);

// Later, pause and resume
ProgressLogger('my-task').pause();
await doSomething();
ProgressLogger('my-task').resume().increment(5);
```

## API Reference

### Factory Function

#### `ProgressLogger(name: string): Progress`

Creates or retrieves a progress tracker.

- **name** - Unique identifier for the tracker
- **Returns** - Progress instance

```javascript
import ProgressLogger from 'proglog';

ProgressLogger('my-task').setTotal(100);
```

**Note:** Calling with the same name returns the same instance (singleton pattern per name). You don't need to store it in a variable - just call `ProgressLogger('name')` anywhere!

### Progress Instance Methods

#### `.setTotal(total: number): this`

Sets the total number of items and transitions tracker to "running" state.

```javascript
ProgressLogger('task').setTotal(100);
```

#### `.setCurrent(current: number): this`

Sets the current progress value.

```javascript
ProgressLogger('task').setCurrent(50);
```

#### `.increment(by?: number): this`

Increments the current value (default: 1).

```javascript
ProgressLogger('task').increment();    // +1
ProgressLogger('task').increment(5);   // +5
```

#### `.count(name: string, value?: number): this`

Tracks custom counters for errors, warnings, retries, or any other metrics you want to monitor.

- **Without value:** Increments the counter by 1 (creates it with 1 if it doesn't exist)
- **With value:** Increments the counter by the specified amount (creates it with that value if it doesn't exist)

```javascript
ProgressLogger('task').count('errors');        // errors = 1
ProgressLogger('task').count('errors');        // errors = 2
ProgressLogger('task').count('warnings', 5);   // warnings = 5
ProgressLogger('task').count('warnings', 3);   // warnings = 8

// Also works with negative numbers for decrements
ProgressLogger('task').count('delta', -2);     // delta = -2
```

Counters automatically appear as a sub-row beneath the task in the progress table, sorted alphabetically.

#### `.resetCounter(name: string): this`

Resets a counter back to 0.

```javascript
ProgressLogger('task').resetCounter('errors'); // errors = 0
```

If the counter doesn't exist yet, it will be created with value 0.

#### `.pause(): this`

Pauses the tracker and saves elapsed time to buffer.

```javascript
ProgressLogger('task').pause();
```

#### `.resume(): this`

Resumes a paused tracker.

```javascript
ProgressLogger('task').resume();
```

#### `.done(): this`

Manually removes the tracker from the registry. **Optional** - trackers automatically remove themselves 3 seconds after reaching 100%.

Use this only if you need to remove a tracker before it completes:

```javascript
// Remove manually if needed
ProgressLogger('task').done();
```

#### `.getName(): string`

Returns the tracker's name.

```javascript
const name = ProgressLogger('task').getName(); // 'task'
```

#### `.isActive(): boolean`

Returns true if tracker is in "running" state.

```javascript
if (ProgressLogger('task').isActive()) {
  // Currently running
}
```

#### `.getState(): ProgressState`

Returns a copy of the current state.

```javascript
const state = ProgressLogger('task').getState();
// { current, total, startedAt, lastUpdatedAt, status, pauseBuffer, counters }
```

The `counters` property is a `Map<string, number>` containing all counter values.

### Static Methods

#### `ProgressLogger.stopAll(): void`

Removes all trackers from the registry.

```javascript
ProgressLogger.stopAll();
```

#### `ProgressLogger.setLoggerInterval(ms: number): void`

Sets the render interval in milliseconds (default: 10000).

```javascript
ProgressLogger.setLoggerInterval(5000); // Update every 5 seconds
```

#### `ProgressLogger.setQuiet(quiet: boolean): void`

Enables or disables output (useful for tests).

```javascript
ProgressLogger.setQuiet(true);  // No output
ProgressLogger.setQuiet(false); // Normal output
```

## Configuration

### Render Interval

Default is 10 seconds. Adjust for faster/slower updates:

```javascript
ProgressLogger.setLoggerInterval(5000);  // 5 seconds
ProgressLogger.setLoggerInterval(30000); // 30 seconds
```

### Quiet Mode

Disable output completely:

```javascript
ProgressLogger.setQuiet(true);
```

Useful for:
- Unit tests
- CI/CD environments
- When you want to track progress programmatically without visual output


### Output Modes

**TTY Mode** (interactive terminal):
- Uses ANSI escape codes to clear and rewrite
- Updates in place

**Non-TTY Mode** (pipes, logs):
- Appends new snapshots as plain text
- Works in log files and CI/CD

## Advanced Usage

### TypeScript

Full TypeScript support with type inference:

```typescript
import ProgressLogger from 'proglog';

ProgressLogger('my-task').setTotal(100);
```

### ESM and CommonJS

Works with both module systems:

```javascript
// ESM (recommended)
import ProgressLogger from 'proglog';
// Or short alias:
import { PLG } from 'proglog';

// CommonJS
const ProgressLogger = require('proglog').default;
// Or short alias:
const { PLG } = require('proglog');
```


### Process Signals

For graceful shutdown in long-running processes (though trackers auto-cleanup on completion):

```javascript
process.on('SIGINT', () => {
  ProgressLogger.stopAll(); // Immediately remove all trackers
  process.exit(0);
});
```

## Examples

See the [`examples/`](./examples) directory for runnable demos:

- `basic.js` - Simple single-task tracking
- `short-alias.js` - Using the PLG alias for less typing
- `multiple-tasks.js` - Concurrent task tracking
- `counter-example.js` - Tracking errors, warnings, and custom metrics
- `pause-resume.js` - Handling pauses and resumes
- `batch-processing.js` - Real-world batch workflow
- `quiet-mode.js` - Silent execution mode
- `chaining.js` - Method chaining patterns

Run any example:

```bash
npm run build
node examples/basic.js
node examples/counter-example.js
```

## FAQ

### Why is my progress not showing?

Make sure you call `.setTotal()` to start tracking:

```javascript
ProgressLogger('task').setTotal(100); // This starts the tracker
```

### Can I use this in production?

Yes! It's designed for production use in:
- Background job processors
- Data migration scripts
- API servers with worker threads
- Cron jobs and scheduled tasks

### Does it affect performance?

No. The library has minimal overhead and only renders periodically. When no trackers are active, there's zero performance impact.

### Can I track tasks without totals?

Yes! Just don't call `.setTotal()`. The task will show as "starting" with a current count but no percentage or ETA.

```javascript
ProgressLogger('streaming-data').increment(); // Just counts items
```

### When should I use counters vs separate trackers?

Use **counters** when you want to track metrics that are related to a main task (errors during processing, retries, warnings, etc.). They show up as a sub-row beneath the task.

Use **separate trackers** when you have independent tasks that need their own progress bars (fetching, processing, uploading as separate operations).

```javascript
// Good use of counters - metrics related to one task
PLG('processing').setTotal(100);
PLG('processing').count('errors');
PLG('processing').count('warnings');

// Good use of separate trackers - independent operations
PLG('fetching').setTotal(50);
PLG('processing').setTotal(100);
PLG('uploading').setTotal(75);
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
git clone https://github.com/ighormartins/proglog.git
cd proglog
npm install
npm run build
npm test
```

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Code Quality

```bash
npm run lint          # Lint code
npm run format        # Format code
npm run type-check    # TypeScript check
npm run validate      # Run all checks
```

## License

MIT © [Ighor Martins](https://github.com/ighormartins)
