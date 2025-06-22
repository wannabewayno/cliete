import { expect } from 'chai';
import Style from './Style.js';

describe('Style', () => {
  let style: Style;

  beforeEach(() => {
    style = new Style();
  });

  describe('weight methods', () => {
    it('should set bright weight', () => {
      const result = style.weight('bright').apply('test');
      expect(result).to.equal('\u001b[1mtest\u001b[m');
    });

    it('should set dim weight', () => {
      const result = style.weight('dim').apply('test');
      expect(result).to.equal('\u001b[2mtest\u001b[m');
    });

    it('should support method chaining', () => {
      const result = style.weight('bright');
      expect(result).to.equal(style);
    });
  });

  describe('decoration methods', () => {
    it('should enable strikethrough', () => {
      const result = style.strikethrough().apply('test');
      expect(result).to.equal('\u001b[9mtest\u001b[m');
    });

    it('should enable underline', () => {
      const result = style.underline().apply('test');
      expect(result).to.equal('\u001b[4mtest\u001b[m');
    });

    it('should enable italics', () => {
      const result = style.italicize().apply('test');
      expect(result).to.equal('\u001b[3mtest\u001b[m');
    });

    it('should disable decorations', () => {
      style.strikethrough().underline().italicize();
      style.strikethrough(false).underline(false).italicize(false);
      const result = style.apply('test');
      expect(result).to.equal('\u001b[mtest\u001b[m');
    });
  });

  describe('convenience methods', () => {
    it('should brighten text', () => {
      const result = style.brighten().apply('test');
      expect(result).to.equal('\u001b[1mtest\u001b[m');
    });

    it('should darken text', () => {
      const result = style.darken().apply('test');
      expect(result).to.equal('\u001b[2mtest\u001b[m');
    });

    it('should normalize text', () => {
      style.brighten();
      const result = style.normal().apply('test');
      expect(result).to.equal('\u001b[mtest\u001b[m');
    });
  });

  describe('color methods', () => {
    it('should set named text color', () => {
      const result = style.color('Red').apply('test');
      expect(result).to.equal('\u001b[31mtest\u001b[m');
    });

    it('should set 8-bit palette color', () => {
      const result = style.color(196).apply('test');
      expect(result).to.equal('\u001b[38;5;196mtest\u001b[m');
    });

    it('should set RGB color', () => {
      const result = style.color('255', '0', '0').apply('test');
      expect(result).to.equal('\u001b[38;2;255;0;0mtest\u001b[m');
    });

    it('should reset color', () => {
      style.color('Red');
      style.color(null);
      const result = style.apply('test');
      expect(result).to.equal('\u001b[mtest\u001b[m');
    });

    it('should set named background color', () => {
      const result = style.bgColor('Blue').apply('test');
      expect(result).to.equal('\u001b[44mtest\u001b[m');
    });
  });

  describe('reset and clone', () => {
    it('should reset all styling', () => {
      style.brighten().italicize().color('Red').bgColor('Blue');
      const result = style.reset().apply('test');
      expect(result).to.equal('\u001b[mtest\u001b[m');
    });

    it('should clone style instance', () => {
      style.brighten().italicize().color('Red');
      const cloned = style.clone();
      const result = cloned.apply('test');
      expect(result).to.equal('\u001b[1;3;31mtest\u001b[m');
    });
  });

  describe('isAnsiStyle', () => {
    it('should detect ANSI style sequences', () => {
      expect(style.isAnsiStyle('\u001b[31m')).to.be.true;
      expect(style.isAnsiStyle('\u001b[1;31;42m')).to.be.true;
      expect(style.isAnsiStyle('\u001b[0m')).to.be.true;
    });

    it('should reject non-ANSI sequences', () => {
      expect(style.isAnsiStyle('hello world')).to.be.false;
      expect(style.isAnsiStyle('\u001b[2A')).to.be.false;
      expect(style.isAnsiStyle('')).to.be.false;
    });
  });

  describe('interpret method', () => {
    it('should interpret weight codes', () => {
      const result = style.interpret('\u001b[1m remaining text');
      expect(result).to.equal(' remaining text');
      expect(style.apply('test')).to.include('1m');
    });

    it('should interpret decoration codes', () => {
      style.interpret('\u001b[3;4;9m');
      const result = style.apply('test');
      expect(result).to.include('3');
      expect(result).to.include('4');
      expect(result).to.include('9');
    });

    it('should interpret color codes', () => {
      style.interpret('\u001b[31;42m');
      const result = style.apply('test');
      expect(result).to.include('31');
      expect(result).to.include('42');
    });

    it('should handle reset sequence', () => {
      style.brighten().color('Red');
      style.interpret('\u001b[0m');
      const result = style.apply('test');
      expect(result).to.equal('\u001b[mtest\u001b[m');
    });

    it('should return original text when no ANSI sequence found', () => {
      const result = style.interpret('hello world');
      expect(result).to.equal('hello world');
    });
  });

  describe('fromString static method', () => {
    it('should create style from ANSI sequence', () => {
      const newStyle = Style.fromString('\u001b[1;31m');
      const result = newStyle.apply('test');
      expect(result).to.include('1');
      expect(result).to.include('31');
    });
  });

  describe('combined styling', () => {
    it('should combine multiple styles', () => {
      const result = style.brighten().italicize().underline().color('Red').bgColor('Blue').apply('test');

      expect(result).to.equal('\u001b[1;3;4;31;44mtest\u001b[m');
    });
  });
});
