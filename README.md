<div align="center">
  <h1>cliete</h1>
  <p>
    <strong>⚠️ Alpha Status Notice: This package is in early development. APIs may change without notice.</strong>
  </p>
  <p>
    <a alt="NPM Version"><img src="https://img.shields.io/npm/v/cliete?style=social&logo=npm" /></a>
    <a alt="NPM Downloads"><img src="https://img.shields.io/npm/dw/cliete?style=social&logo=npm" /></a>
    <a alt="NPM Last Update"><img src="https://img.shields.io/npm/last-update/cliete?style=social&logo=npm" /></a>
  </p>
    <p>
    <a alt="Libraries.io dependency status for GitHub repo"><img src="https://img.shields.io/librariesio/github/wannabewayno/cliete?style=plastic" /></a>
    <a alt="GitHub Issues or Pull Requests"><img src="https://img.shields.io/github/issues/wannabewayno/cliete?style=plastic&logo=github" /></a>
  </p>
</div>

Command Line Interface End-To-End test framework with a natural language interface for writing expressive and maintainable tests.

## Natural Language Design

Cliete's API reads like natural English, making tests self-documenting:

```typescript
// Instead of cryptic timing functions:
setTimeout(() => assert(condition), 2000);

// Write expressive, readable code:
await I.wait.for.two.seconds.and.see('Expected output');
await I.wait.until.I.see('Dynamic content appears');
```

## Key Features

### 🔄 Smart Waiting Strategies
- **`wait.for`**: Explicit delays for known timing requirements
- **`wait.until`**: Retry logic for dynamic content and async operations
- **`action.until`**: Repeat actions until conditions are met
- **Natural language**: `wait.for.two.seconds` vs `setTimeout(2000)`

### 📝 Self-Documenting Tests
```typescript
// Clear intent and readable flow
await I.type('npm start').and.wait.until.I.spot('Server running')
await I.wait.for.one.second.and.see('Ready to accept connections');

// Dynamic navigation until target found
await I.press.down.until.I.see('Target Item');
```

### 🎯 Precise Terminal Control
- Real TTY environment using node-pty
- ANSI escape sequence handling
- Accurate screen state capture

## Installation

```bash
npm install cliete
```

## Usage
```typescript
import Cliete from 'cliete';

const I = await Cliete.openTerminal('git log', { width: 40, height: 20 });

// Natural language interface for CLI testing
I.press.up.three.times.and.press.enter.once.and.see(
  '1234567 Fix: bugs',
  '7654321 count: chickens'
);
```

## Real World Example

```typescript
import { execSync } from 'node:child_process';
import { expect } from 'chai';
import Cliete from 'cliete';

describe('Cliete integration tests', () => {
  describe('Node', () => {
    let nodeVersion: string;
    before(() => {
      nodeVersion = execSync('node --version').toString().trim();
      // Set defaults to avoid repetition across tests
      Cliete.setDefault('width', 40);
      Cliete.setDefault('height', 30);
    });

    it('Should spawn an interactive node shell and run basic commands', async () => {
      // Uses defaults set above
      const I = await Cliete.openTerminal('node');

      // Wait for REPL to start (retry until success)
      await I.wait.until.I.see(
        `Welcome to Node.js ${nodeVersion}.`,
        'Type ".help" for more information.',
        '>'
      );

      // Type command and wait for preview
      await I.type('2 + 2').and.wait.until.I.see(
        `Welcome to Node.js ${nodeVersion}.`,
        'Type ".help" for more information.',
        '> 2 + 2',
        '4'
      );

      // Execute command and wait for result
      await I.press.enter.and.wait.until.I.see(
        `Welcome to Node.js ${nodeVersion}.`,
        'Type ".help" for more information.',
        '> 2 + 2',
        '4',
        '>'
      );

      // Demonstrate explicit timing
      await I.wait.for.one.hundred.milliseconds.and.see(
        `Welcome to Node.js ${nodeVersion}.`,
        'Type ".help" for more information.',
        '> 2 + 2',
        '4',
        '>'
      );

      // Clean exit
      await I.type('.exit').and.press.enter.and.wait.for.the.process.to.exit.with.exit.code.zero;
    });
  });
});
```

## API Reference

### `Cliete.setDefault(type: defaultOptionKey, value: defaultOptionType)`
Sets default options for the `openTerminal` method to avoid repetitive configuration.

```typescript
// Set defaults once
Cliete.setDefault('width', 120);
Cliete.setDefault('height', 40);
Cliete.setDefault('cwd', '/my/project');
Cliete.setDefault('timeout', 2000); // Custom initial wait timeout
Cliete.setDefault('timeout', 0); // Disable initial wait (wait indefinitely)
Cliete.setDefault('timeout', null); // Skip initial wait entirely

// Now all terminals use these defaults unless overridden
const I1 = await Cliete.openTerminal('git log'); // Uses all defaults
const I2 = await Cliete.openTerminal('npm test', { width: 80 }); // Overrides width only
```

### `Cliete.setDefaults(defaults: OpenTerminalOpts)`
Sets multiple default options for the `openTerminal` method at once.

```typescript
// Set multiple defaults at once
Cliete.setDefaults({
  width: 120,
  height: 40,
  cwd: '/my/project',
  timeout: 2000
});

// Method chaining supported
Cliete
  .setDefaults({ width: 80, height: 30 }) // Set multiple defaults at once
  .setDefault('cwd', '/my/project') // set a specific default
  .clearDefaults(); // Clear all defaults
```

### `Cliete.clearDefaults()`
Clears all default options, resetting them to empty.

```typescript
// Set some defaults
Cliete.setDefault('width', 120);
Cliete.setDefault('height', 40);

// Clear all defaults
Cliete.clearDefaults();

// Now uses built-in defaults (width: 40, height: 30)
const I = await Cliete.openTerminal('git log');
```

### `Cliete.openTerminal(cmd: string, options?: { width?: number; height?: number; env?: Record<string, string>; cwd?: string; timeout?: number | null })`
Opens a new terminal session for CLI testing. Uses defaults set via `setDefault()` if options are not provided, otherwise falls back to built-in defaults (width: 40, height: 30, cwd: current working directory, env: current shell).

```typescript
const I = await Cliete.openTerminal('git log', { width: 80, height: 24 });
const I2 = await Cliete.openTerminal('npm start', { timeout: 10000 }); // Wait up to 10s for initial output
const I4 = await Cliete.openTerminal('echo test', { timeout: 0 }); // Wait indefinitely for initial output
const I3 = await Cliete.openTerminal('echo test', { timeout: null }); // Skip initial wait
```

### `I.press`
Provides a natural language interface for keyboard interactions.

```typescript
// Fixed repetition
I.press.up.three.times;
I.press.tab.twice;
I.press.enter.once;

// Dynamic repetition until condition met
await I.press.down.until.I.see('Target Item');
await I.press.up.until.I.spot(/Page \d+ of \d+/);
```

### `I.type(text: string)`
Types text into the terminal.

```typescript
// Basic typing
I.type('git status');
I.type('hello world').and.press.enter.once;

// Repeat typing until condition met
await I.type('search term').until.I.spot('Results found');
```

### `I.see(...expected: string[])`
Asserts that the current screen exactly matches the expected lines.

```typescript
await I.see(
  '$ git status',
  'On branch main'
);
```

### `I.spot(expected: string | RegExp)`
Asserts that the current screen contains the specified substring or matches a regular expression.

```typescript
await I.spot('Fix: bugs'); // Find substring anywhere on screen
await I.spot(/^commit: [a-f0-9]{40}$/m); // Match against regular expression
```

### `I.wait.for` - Explicit Waiting
Waits for a specific duration before continuing. Makes tests more readable by expressing timing intentions clearly.

```typescript
// Wait for specific durations
await I.wait.for.two.seconds.and.see('Loading complete');
await I.wait.for.five.hundred.milliseconds.and.press.enter;

// Wait for process to exit
await I.wait.for.the.process.to.exit;

// Wait for process with timeout and exit code validation
await I.wait.for.the.process.to.exit.with.timeout.of(2000);
await I.wait.for.the.process.to.exit.with.exit.code.zero;
await I.wait.for.the.process.to.exit.with.nonZero.exit.code;

// Screen settling
const stableScreen = await I.wait.for.the.screen.to.settle().and.printScreen('color');
// screen is in color!
console.log(stableScreen);
```

### `I.wait.until` - Retry Until Success
Repeats assertions until they succeed or timeout. Perfect for waiting for dynamic content or slow operations.

```typescript
// Retry assertions until they pass
await I.wait.until.I.see('Build completed successfully');
await I.wait.until.I.spot('Server started on port 3000');

// Wait for process to exit
await I.wait.until.the.process.exits;

// Wait for process to exit with timeout
await I.wait.until.the.process.exits.with.timeout.of(5000);

// Wait for process to exit with specific exit code
await I.wait.until.the.process.exits.with.exit.code.zero;
await I.wait.until.the.process.exits.with.exit.code.of(1);
await I.wait.until.the.process.exits.with.nonZero.exit.code;

// Combine timeout and exit code validation
await I.wait.until.the.process.exits.with.timeout.of(3000).with.exit.code.zero;
```

### Action Repetition with `until`
Repeat actions until screen conditions are met. Perfect for dynamic CLI interfaces where content location changes.

```typescript
// Navigate through paginated lists
await I.press.down.until.I.see('Target Item');
await I.press.up.until.I.spot(/Page 1 of \d+/);

// Search until results appear
await I.type('query').until.I.spot('Results:');

// Navigate menus dynamically
await I.press.right.until.I.see('Settings Menu');
await I.press.tab.until.I.spot('Submit Button');

// Important: wait clears the action
await I.press.down.and.wait.until.I.see('Item'); // Only waits, doesn't repeat press
```

## Use Cases

### Dynamic CLI Navigation
Perfect for testing CLI applications with dynamic content:

```typescript
// Testing a file browser
await I.press.down.until.I.see('target-file.txt');
await I.press.enter.and.wait.until.I.see('File opened');

// Testing paginated command output
await I.press.space.until.I.spot('END OF FILE');

// Testing interactive menus
await I.press.right.until.I.see('Advanced Options');
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT

## v0.10.x - ⚠️ Breaking Changes
### Process Exit API Changes
The process exit API has been updated for consistency to provide a more fluent interface with enhanced functionality for exit code validation and timeout configuration; this aligns with the natural language design philosophy

```typescript
// Validate specific exit codes
await I.wait.for.the.process.to.exit.with.exit.code.zero;
await I.wait.for.the.process.to.exit.with.exit.code.of(1);
await I.wait.for.the.process.to.exit.with.nonZero.exit.code;

// Combine timeout and exit code validation
await I.wait.until.the.process.exits.with.timeout.of(3000).with.exit.code.zero;
```

**Before (v0.9.x and earlier):**
```typescript
// Function-based API
await I.wait.for.the.process.to.exit();
await I.wait.for.the.process.to.exit(5000); // with timeout
await I.wait.until.the.process.exits();
await I.wait.until.the.process.exits(5000); // with timeout
```

**After (v0.10.x and later):**
```typescript
// Property-based fluent API
await I.wait.for.the.process.to.exit;
await I.wait.for.the.process.to.exit.with.timeout.of(5000);
await I.wait.until.the.process.exits;
await I.wait.until.the.process.exits.with.timeout.of(5000);
```

### Spot Method API Changes
The `spot` method now accepts a single parameter (string or RegExp) instead of multiple string parameters and adds support for regular expression pattern matching.

```typescript
// String matching (existing)
await I.spot('substring');

// Regular expression matching (new)
await I.spot(/^commit: [a-f0-9]{40}$/m);
await I.spot(/error|warning/i);
```

### Migration Steps

##### Process Exit Migration
1. **Remove function calls** - Change `.exit()` to `.exit` and `.exits()` to `.exits`
2. **Update timeout syntax** - Change `.exit(timeout)` to `.exit.with.timeout.of(timeout)`

#### Migration Examples
| Before | After |
|--------|-------|
| `await I.wait.for.the.process.to.exit()` | `await I.wait.for.the.process.to.exit` |
| `await I.wait.for.the.process.to.exit(2000)` | `await I.wait.for.the.process.to.exit.with.timeout.of(2000)` |
| `await I.wait.until.the.process.exits()` | `await I.wait.until.the.process.exits` |
| `await I.wait.until.the.process.exits(5000)` | `await I.wait.until.the.process.exits.with.timeout.of(5000)` |

##### Spot Method Migration
1. **Update multiple parameters** - Change `spot('a', 'b')` to separate calls: `spot('a')` and `spot('b')`
2. **Consider RegExp** - Use regular expressions for complex pattern matching

##### Spot Method Examples
| Before | After |
|--------|---------|
| `await I.spot('first', 'second')` | `await I.spot('first'); await I.spot('second');` |
| `await I.spot('text')` | `await I.spot('text')` (no change) |
| N/A | `await I.spot(/pattern/)` (new RegExp support) |
