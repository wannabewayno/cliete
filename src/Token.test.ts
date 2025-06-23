import { expect } from 'chai';
import Style from './Style.js';
import Token from './Token.js';

describe('Token', () => {
  describe('constructor', () => {
    it('should create token with text and default style', () => {
      const token = new Token('hello');

      expect(token.text).to.equal('hello');
      expect(token.style).to.be.instanceOf(Style);
    });

    it('should create token with text and custom style', () => {
      const style = new Style().color('Red');
      const token = new Token('error', style);

      expect(token.text).to.equal('error');
      expect(token.style).to.equal(style);
    });
  });

  describe('raw method', () => {
    it('should return plain text content', () => {
      const token = new Token('hello world');

      expect(token.raw()).to.equal('hello world');
    });

    it('should return text without styling applied', () => {
      const style = new Style().color('Red').weight('bright');
      const token = new Token('error message', style);

      expect(token.raw()).to.equal('error message');
    });
  });

  describe('styled method', () => {
    it('should return text with default styling', () => {
      const token = new Token('hello');

      expect(token.styled()).to.equal('\u001b[mhello\u001b[m');
    });

    it('should return text with applied styling', () => {
      const style = new Style().color('Red').weight('bright');
      const token = new Token('error', style);

      expect(token.styled()).to.equal('\u001b[1;31merror\u001b[m');
    });

    it('should return text with complex styling', () => {
      const style = new Style().color('Blue').bgColor('Yellow').italicize().underline();
      const token = new Token('styled text', style);

      expect(token.styled()).to.equal('\u001b[3;4;34;43mstyled text\u001b[m');
    });
  });

  describe('text and style separation', () => {
    it('should maintain separate text and style access', () => {
      const style = new Style().color('Green');
      const token = new Token('success', style);

      expect(token.raw()).to.equal('success');
      expect(token.styled()).to.include('32m');
      expect(token.styled()).to.include('success');
    });

    it('should handle empty text', () => {
      const token = new Token('');

      expect(token.raw()).to.equal('');
      expect(token.styled()).to.equal('\u001b[m\u001b[m');
    });

    it('should handle text with special characters', () => {
      const token = new Token('hello\nworld\ttab');

      expect(token.raw()).to.equal('hello\nworld\ttab');
      expect(token.styled()).to.include('hello\nworld\ttab');
    });
  });
});
