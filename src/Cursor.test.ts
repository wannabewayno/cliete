import { expect } from 'chai';
import Cursor from './Cursor.js';

describe('Cursor', () => {
  let cursor: Cursor;

  beforeEach(() => {
    cursor = new Cursor();
  });

  describe('constructor', () => {
    it('should initialize at origin by default', () => {
      expect(cursor.x).to.equal(0);
      expect(cursor.y).to.equal(0);
    });

    it('should initialize at specified position', () => {
      const customCursor = new Cursor(5, 3);
      expect(customCursor.x).to.equal(5);
      expect(customCursor.y).to.equal(3);
    });
  });

  describe('movement methods', () => {
    it('should move up and decrease y coordinate', () => {
      cursor.up(2);
      expect(cursor.y).to.equal(-2);
    });

    it('should move down and increase y coordinate', () => {
      cursor.down(3);
      expect(cursor.y).to.equal(3);
    });

    it('should move left and increase x coordinate', () => {
      cursor.left(4);
      expect(cursor.x).to.equal(4);
    });

    it('should move right and decrease x coordinate', () => {
      cursor.right(2);
      expect(cursor.x).to.equal(-2);
    });

    it('should support method chaining', () => {
      const result = cursor.up(1).down(2).left(3).right(1);
      expect(result).to.equal(cursor);
      expect(cursor.x).to.equal(2);
      expect(cursor.y).to.equal(1);
    });
  });

  describe('home method', () => {
    it('should reset cursor to origin', () => {
      cursor.up(5).left(3);
      cursor.home();
      expect(cursor.x).to.equal(0);
      expect(cursor.y).to.equal(0);
    });

    it('should support method chaining', () => {
      const result = cursor.home();
      expect(result).to.equal(cursor);
    });
  });

  describe('isAnsiCursor', () => {
    it('should detect cursor movement sequences', () => {
      expect(cursor.isAnsiCursor('\x1b[A')).to.be.true;
      expect(cursor.isAnsiCursor('\x1b[2B')).to.be.true;
      expect(cursor.isAnsiCursor('\x1b[10C')).to.be.true;
      expect(cursor.isAnsiCursor('\x1b[5D')).to.be.true;
      expect(cursor.isAnsiCursor('\x1b[35G')).to.be.true;
    });

    it('should detect cursor visibility sequences', () => {
      expect(cursor.isAnsiCursor('[?25l')).to.be.true;
      expect(cursor.isAnsiCursor('[?25h')).to.be.true;
    });

    it('should reject non-cursor sequences', () => {
      expect(cursor.isAnsiCursor('hello world')).to.be.false;
      expect(cursor.isAnsiCursor('\x1b[31m')).to.be.false;
      expect(cursor.isAnsiCursor('')).to.be.false;
    });
  });

  describe('interpret method', () => {
    it('should interpret up movement', () => {
      const result = cursor.interpret('\x1b[2A remaining text');
      expect(cursor.y).to.equal(-2);
      expect(result).to.equal(' remaining text');
    });

    it('should interpret down movement', () => {
      const result = cursor.interpret('\x1b[3B remaining text');
      expect(cursor.y).to.equal(3);
      expect(result).to.equal(' remaining text');
    });

    it('should interpret left movement', () => {
      const result = cursor.interpret('\x1b[4C remaining text');
      expect(cursor.x).to.equal(4);
      expect(result).to.equal(' remaining text');
    });

    it('should interpret right movement', () => {
      const result = cursor.interpret('\x1b[2D remaining text');
      expect(cursor.x).to.equal(-2);
      expect(result).to.equal(' remaining text');
    });

    it('should interpret absolute column positioning', () => {
      const result = cursor.interpret('\x1b[35G remaining text');
      expect(cursor.x).to.equal(35);
      expect(result).to.equal(' remaining text');
    });

    it('should default to 1 when no amount specified', () => {
      cursor.interpret('\x1b[A');
      expect(cursor.y).to.equal(-1);
    });

    it('should handle cursor hide sequence', () => {
      const result = cursor.interpret('[?25l remaining text');
      expect(result).to.equal(' remaining text');
      expect(cursor.hidden).to.be.true;
    });

    it('should handle cursor show sequence', () => {
      const result = cursor.interpret('[?25h remaining text');
      expect(result).to.equal(' remaining text');
      expect(cursor.hidden).to.be.false;
    });

    it('should return original text when no ANSI sequence found', () => {
      const result = cursor.interpret('hello world');
      expect(result).to.equal('hello world');
      expect(cursor.x).to.equal(0);
      expect(cursor.y).to.equal(0);
    });
  });
});
