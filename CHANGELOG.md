# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-11-04

### Added
- Initial release of ProgressLogger
- Core progress tracking functionality with automatic table rendering
- Support for multiple concurrent task tracking
- Pause/resume functionality with accurate elapsed time calculation
- Chainable API for fluent progress updates
- Smart metrics: ETA, rate (items/min), elapsed time, percentage
- TTY-adaptive output (ANSI codes in terminals, plain text in logs)
- Zero dependencies, lightweight implementation
- Full TypeScript support with type definitions
- Dual package support (ESM and CommonJS)
- Static methods:
  - `ProgressLogger(name)` - Factory function for creating/retrieving trackers
  - `ProgressLogger.stopAll()` - Remove all trackers
  - `ProgressLogger.setLoggerInterval(ms)` - Configure render interval
  - `ProgressLogger.setQuiet(boolean)` - Enable/disable output
- Instance methods:
  - `.setTotal(total)` - Set total items and start tracking
  - `.setCurrent(current)` - Set current progress
  - `.increment(by)` - Increment progress
  - `.pause()` - Pause tracking
  - `.resume()` - Resume tracking
  - `.done()` - Remove tracker from registry
  - `.getName()` - Get tracker name
  - `.isActive()` - Check if tracker is running
  - `.getState()` - Get current state snapshot
- State machine with four states: initial, running, paused, finished
- Auto-transition to finished state when progress reaches 100%
- Immediate render on task completion
- Edge case handling:
  - Zero or null totals
  - Current > total (capped at 100%)
  - Negative increments (clamped to 0)
  - Very slow rates (epsilon guard)
  - Large numbers (thousands separators)
  - Long task names (truncation with ellipsis)
- Comprehensive test suite with 184 tests
- Example scripts demonstrating common use cases

### Documentation
- Comprehensive README with API documentation
- Runnable examples in `examples/` directory
- JSDoc comments on all public APIs
- TypeScript type definitions

[Unreleased]: https://github.com/ighormartins/proglog/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ighormartins/proglog/releases/tag/v0.1.0
