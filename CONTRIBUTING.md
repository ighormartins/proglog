# Contributing to ProgressLogger

Thanks for considering contributing to ProgressLogger!

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, minimal reproductions)
- **Describe the behavior you observed** and what you expected
- **Include your environment details** (Node.js version, OS, terminal type)
- **Add screenshots or terminal output** if relevant

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the proposed enhancement
- **Explain why this enhancement would be useful** to most users
- **List any similar features** in other libraries (if applicable)
- **Provide code examples** showing how the feature would be used

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following the coding standards below
3. **Add tests** for any new functionality
4. **Ensure all tests pass** with `npm test`
5. **Update documentation** (README, JSDoc comments, examples)
6. **Run the validation** with `npm run validate`
7. **Write a clear commit message** following Conventional Commits
8. **Submit your pull request** with a comprehensive description

## Development Setup

### Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0

### Getting Started

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/ighormartins/proglog.git
   cd proglog
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run tests:
   ```bash
   npm test
   ```

### Development Workflow

```bash
# Run tests in watch mode
npm run test:watch

# Build in watch mode
npm run dev

# Type check
npm run type-check

# Lint code
npm run lint
npm run lint:fix

# Format code
npm run format

# Run all checks (recommended before committing)
npm run validate
```

## Project Structure

```
src/
  ├── index.ts           # Main entry point and factory function
  ├── progress.ts        # Progress class with chainable API
  ├── registry.ts        # Global singleton registry
  ├── renderer.ts        # Auto-rendering logic
  ├── calculator.ts      # ETA/rate calculations
  ├── formatter.ts       # String formatting
  ├── config.ts          # Configuration management
  ├── types.ts           # TypeScript type definitions
  └── __tests__/         # Test files
```

## Coding Standards

### TypeScript

- Use **TypeScript strict mode** - all checks enabled
- Provide **explicit return types** for public APIs
- Use **meaningful variable names** - clarity over brevity
- Avoid `any` - use proper types or `unknown`
- Document complex logic with comments

### Code Style

This project uses ESLint and Prettier for code quality:

- **Run `npm run format`** before committing
- **Run `npm run lint:fix`** to auto-fix issues
- Follow the existing code style and patterns
- Keep functions small and focused (single responsibility)
- Use pure functions where possible

### Testing

- **Write tests for all new features** - aim for >90% coverage
- **Use descriptive test names** - `it('should do X when Y')`
- **Test edge cases** - null/undefined, zero, negative, huge values
- **Use the existing test patterns** - see `src/__tests__/` for examples

Test categories:
- **Unit tests** - Pure functions (calculator, formatter)
- **Integration tests** - Component interactions (renderer, registry)
- **Visual tests** - Table output verification

### Documentation

- **Update README.md** for user-facing changes
- **Add JSDoc comments** to public APIs
- **Update CHANGELOG.md** following Keep a Changelog format
- **Provide code examples** for new features
- **Update type definitions** for TypeScript changes

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring (no functional change)
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Build process, tooling changes

**Examples:**
```
feat(renderer): add support for custom progress bar characters
fix(calculator): handle division by zero in rate calculation
docs(readme): add batch processing example
test(progress): add tests for pause/resume cycle
```

## Release Process

Maintainers will handle releases following this process:

1. Update CHANGELOG.md with changes
2. Bump version with `npm version [patch|minor|major]`
3. Push commits and tags: `git push && git push --tags`
4. Publish to npm: `npm publish`
5. Create GitHub release with release notes

## Need Help?

- **Questions?** Open a GitHub issue with the "question" label
- **Stuck?** Check existing issues or ask in discussions
- **Found a security issue?** Email the maintainers directly (do not open a public issue)

## Recognition

Contributors will be recognized in:
- CHANGELOG.md for their contributions
- GitHub contributors page
- Release notes (for significant contributions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
