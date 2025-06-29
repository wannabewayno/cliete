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

## API Reference

### `Cliete.openTerminal(cmd: string, options: { width: number; height: number })`
Opens a new terminal session for CLI testing.

```typescript
const I = await Cliete.openTerminal('git log', { width: 80, height: 24 });
```

### `I.press`
Provides a natural language interface for keyboard interactions.

```typescript
I.press.up.three.times;
I.press.tab.twice;
I.press.enter.once;
```

### `I.type(text: string)`
Types text into the terminal.

```typescript
I.type('git status');
I.type('hello world').and.press.enter.once;
```

### `I.see(...expected: string[])`
Asserts that the current screen exactly matches the expected lines.

```typescript
await I.see(
  '$ git status',
  'On branch main'
);
```

### `I.spot(...expected: string[])`
Asserts that the current screen contains the specified substrings.

```typescript
await I.spot('Fix: bugs');
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
    });

    it('Should spawn an interactive node shell and run basic commands', async () => {
      const I = await Cliete.openTerminal('node', {
        width: 40,
        height: 30,
      });

      // Assert that we see the initial REPL message with the current node version
      await I.wait.until.I.see(`Welcome to Node.js ${nodeVersion}.`, 'Type ".help" for more information.', '>');

      // Type in 2 + 2 and see the preview shown below
      await I.type('2 + 2').and.wait.until.I.see(
        `Welcome to Node.js ${nodeVersion}.`,
        'Type ".help" for more information.',
        '> 2 + 2',
        '4',
      );

      // Hit enter and see the output
      await I.press.enter.and.wait.until.I.see(
        `Welcome to Node.js ${nodeVersion}.`,
        'Type ".help" for more information.',
        '> 2 + 2',
        '4',
        '>',
      );

      const before = performance.now();
      await I.wait.for.ninety.nine.milliseconds.and.see(
        `Welcome to Node.js ${nodeVersion}.`,
        'Type ".help" for more information.',
        '> 2 + 2',
        '4',
        '>',
      );
      const after = performance.now();
      expect(after - before).to.be.at.least(99);

      // exit the session
      await I.type('.exit').and.press.enter.and.wait.for.the.process.to.exit();
    });
  });
});
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT