import { describe, it, expect } from 'vitest';
import { generateId, cn } from './utils';

describe('utils', () => {
  describe('generateId', () => {
    it('should return a string', () => {
      expect(typeof generateId()).toBe('string');
    });

    it('should generate unique ids', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('cn', () => {
    it('should merge classes correctly', () => {
      expect(cn('a', 'b')).toBe('a b');
      expect(cn('a', { b: true, c: false })).toBe('a b');
    });

    it('should handle tailwind conflicts', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
    });
  });
});
