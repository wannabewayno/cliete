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

### `I.wait(ms: number)`
Waits for a specified duration.

```typescript
await I.wait(1000); // Wait 1 second
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
describe('CLI E2E Tests', () => {
  let I: Cliete;

  before(async () => {
    I = await cliete.openTerminal('commitional', {
      width: 100,
      height: 50,
    });
  });

  it('should display typed input', async () => {
    await I.see(
      "? Select the type of change that you're committing:",
      '❯ feat',
      '  fix',
      '  chore',
      '  docs',
      '  style',
      '  refactor',
      '  perf',
      '(Use arrow keys to reveal more choices)',
    );

    await I.press.down.twice.and.see(
      "? Select the type of change that you're committing:",
      '  feat',
      '  fix',
      '❯ chore',
      '  docs',
      '  style',
      '  refactor',
      '  perf',
    );
  });
});
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT