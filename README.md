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
// { current, total, startedAt, lastUpdatedAt, status, pauseBuffer }
```

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
- `pause-resume.js` - Handling pauses and resumes
- `batch-processing.js` - Real-world batch workflow
- `quiet-mode.js` - Silent execution mode
- `chaining.js` - Method chaining patterns

Run any example:

```bash
npm run build
node examples/basic.js
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
