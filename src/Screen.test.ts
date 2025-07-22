import { PassThrough } from 'node:stream';
import { expect } from 'chai';
import { Screen } from './Screen.js';

describe('Screen', () => {
  let screen: Screen;

  beforeEach(() => {
    screen = new Screen(80, 24);
  });

  describe('constructor', () => {
    it('should initialize with specified dimensions', () => {
      const customScreen = new Screen(120, 30);
      expect(customScreen).to.be.instanceOf(Screen);
    });

    it('should start with empty screen', () => {
      expect(screen.render()).to.equal('');
    });
  });

  describe('pipe method', () => {
    it('should pipe single stream', () => {
      const stream = new PassThrough();
      screen.pipe(stream);

      expect(() => stream.write('test')).to.not.throw();
    });

    it('should pipe multiple streams', () => {
      const stream1 = new PassThrough();
      const stream2 = new PassThrough();
      screen.pipe(stream1, stream2);

      expect(() => {
        stream1.write('test1');
        stream2.write('test2');
      }).to.not.throw();
    });
  });

  describe('getCombinedStream', () => {
    it('should return PassThrough stream', () => {
      const combined = screen.getCombinedStream();
      expect(combined).to.be.instanceOf(PassThrough);
    });
  });

  describe('text processing', () => {
    it('should process simple text', async () => {
      const stream = new PassThrough();
      screen.pipe(stream);

      const waitForUpdate = screen.waitForUpdate();
      stream.write('hello world');
      await waitForUpdate;

      expect(screen.render()).to.include('hello world');
    });

    it('should handle multiple lines', async () => {
      const stream = new PassThrough();
      screen.pipe(stream);

      const waitForUpdate = screen.waitForUpdate();
      stream.write('line1\nline2\nline3');
      await waitForUpdate;

      const output = screen.render();
      expect(output).to.include('line1');
      expect(output).to.include('line2');
      expect(output).to.include('line3');
    });

    it('should handle line wrapping', async () => {
      const shortScreen = new Screen(10, 5);
      const stream = new PassThrough();
      shortScreen.pipe(stream);

      const waitForUpdate = shortScreen.waitForUpdate();
      stream.write('this is a very long line that should wrap');
      await waitForUpdate;

      const output = shortScreen.render();
      expect(output).to.include('this is a');
      expect(output).to.include('very long');
    });
  });

  describe('ANSI sequence handling', () => {
    it('should handle cursor movement', async () => {
      const stream = new PassThrough();
      screen.pipe(stream);

      const waitForUpdate = screen.waitForUpdate();
      stream.write('hello\x1b[A world');
      await waitForUpdate;

      expect(screen.render()).to.include('hello');
    });

    it('should handle line clear command', async () => {
      const stream = new PassThrough();
      screen.pipe(stream);

      const waitForUpdate = screen.waitForUpdate();
      stream.write('initial text\x1b[2K');
      await waitForUpdate;

      const output = screen.render();
      expect(output).to.not.include('initial text');
    });

    it('should handle styled text', async () => {
      const stream = new PassThrough();
      screen.pipe(stream);

      const waitForUpdate = screen.waitForUpdate();
      stream.write('\x1b[31mred text\x1b[m');
      await waitForUpdate;

      expect(screen.render()).to.include('red text');
    });
  });

  describe('waitForUpdate', () => {
    it('should resolve on screen update', async () => {
      const stream = new PassThrough();
      screen.pipe(stream);

      setTimeout(() => stream.write('test'), 10);

      await expect(screen.waitForUpdate()).to.be.fulfilled;
    });

    it('should timeout if no update occurs', async () => {
      await expect(screen.waitForUpdate(100)).to.be.rejectedWith('Screen update timeout');
    });

    it('should disable timeout when 0 is passed', async () => {
      const stream = new PassThrough();
      screen.pipe(stream);

      setTimeout(() => stream.write('test'), 200);

      await expect(screen.waitForUpdate(0)).to.be.fulfilled;
    });
  });

  describe('waitForIdle', () => {
    it('should resolve when screen becomes idle', async () => {
      const stream = new PassThrough();
      screen.pipe(stream);

      stream.write('initial');
      setTimeout(() => stream.write(' final'), 50);

      await expect(screen.waitForIdle(100, 1000)).to.be.fulfilled;
    });

    it('should timeout if screen never becomes idle', async () => {
      const stream = new PassThrough();
      screen.pipe(stream);

      const interval = setInterval(() => stream.write('update'), 50);

      try {
        await expect(screen.waitForIdle(100, 200)).to.be.rejectedWith('Screen idle timeout');
      } finally {
        clearInterval(interval);
      }
    });
  });

  describe('screen dimensions', () => {
    it('should respect height limit', async () => {
      const smallScreen = new Screen(80, 2);
      const stream = new PassThrough();
      smallScreen.pipe(stream);

      const waitForUpdate = smallScreen.waitForUpdate();
      stream.write('line1\nline2\nline3\nline4');
      await waitForUpdate;

      const lines = smallScreen.render().split('\n');
      expect(lines.length).to.be.at.most(2);
    });

    it('should handle empty lines', async () => {
      const stream = new PassThrough();
      screen.pipe(stream);

      const waitForUpdate = screen.waitForUpdate();
      stream.write('\n\n\n');
      await waitForUpdate;

      expect(screen.render()).to.include('\n');
    });
  });
});
