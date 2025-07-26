import { expect } from 'chai';
import Shell from './ShellCmd.js';

describe('Shell', () => {
  describe('constructor', () => {
    it('should create Shell with shell and args', () => {
      const shell = new Shell('git', 'status', '--short');

      expect(shell.shell).to.equal('git');
      expect(shell.args).to.deep.equal(['status', '--short']);
    });

    it('should filter out empty args', () => {
      const shell = new Shell('git', '', 'status', '', '--short');

      expect(shell.args).to.deep.equal(['status', '--short']);
    });

    it('should default shell to empty string', () => {
      const shell = new Shell();

      expect(shell.shell).to.equal('');
      expect(shell.args).to.deep.equal([]);
    });
  });

  describe('fromString', () => {
    it('should parse command string with quoted arguments', () => {
      const result = Shell.fromString(
        'my-progrom --type custom --quotes \'quoated arg\' --double-quotes "double quoted arg" --no-quotes no-quotes_here  --boolean',
      );

      expect(result.shell).to.equal('my-progrom');
      expect(result.args).to.deep.equal([
        '--type',
        'custom',
        '--quotes',
        'quoated arg',
        '--double-quotes',
        'double quoted arg',
        '--no-quotes',
        'no-quotes_here',
        '--boolean',
      ]);
    });

    it('should handle simple command without quotes', () => {
      const result = Shell.fromString('git status --short');

      expect(result.shell).to.equal('git');
      expect(result.args).to.deep.equal(['status', '--short']);
    });

    it('should handle empty string', () => {
      const result = Shell.fromString('');

      expect(result.shell).to.equal('');
      expect(result.args).to.deep.equal([]);
    });
  });
});
