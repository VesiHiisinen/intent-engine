import { describe, it, expect } from 'vitest';
import { parseCommand } from './parser.js';

describe('unit: Command Parser', () => {
  describe('add command', () => {
    it('should parse task addition with +', () => {
      const result = parseCommand('+ walk 20 min');
      expect(result.type).toBe('add');
      expect(result.args).toEqual(['walk 20 min']);
      expect(result.raw).toBe('+ walk 20 min');
    });

    it('should trim whitespace after +', () => {
      const result = parseCommand('+   fix bug  ');
      expect(result.type).toBe('add');
      expect(result.args).toEqual(['fix bug']);
    });

    it('should handle empty task text', () => {
      const result = parseCommand('+');
      expect(result.type).toBe('add');
      expect(result.args).toEqual(['']);
    });
  });

  describe('slash commands', () => {
    it('should parse /alltasks command', () => {
      const result = parseCommand('/alltasks');
      expect(result.type).toBe('alltasks');
      expect(result.args).toEqual([]);
    });

    it('should parse /done with argument', () => {
      const result = parseCommand('/done 2');
      expect(result.type).toBe('done');
      expect(result.args).toEqual(['2']);
    });

    it('should parse /done with multiple arguments', () => {
      const result = parseCommand('/done 1 extra');
      expect(result.type).toBe('done');
      expect(result.args).toEqual(['1', 'extra']);
    });

    it('should parse /help command', () => {
      const result = parseCommand('/help');
      expect(result.type).toBe('help');
      expect(result.args).toEqual([]);
    });

    it('should parse /start command', () => {
      const result = parseCommand('/start');
      expect(result.type).toBe('start');
      expect(result.args).toEqual([]);
    });

    it('should handle unknown slash commands', () => {
      const result = parseCommand('/unknown');
      expect(result.type).toBe('unknown');
      expect(result.args).toEqual([]);
    });
  });

  describe('unknown commands', () => {
    it('should mark regular text as unknown', () => {
      const result = parseCommand('just some text');
      expect(result.type).toBe('unknown');
      expect(result.args).toEqual([]);
      expect(result.raw).toBe('just some text');
    });

    it('should handle empty string', () => {
      const result = parseCommand('');
      expect(result.type).toBe('unknown');
      expect(result.args).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should trim leading/trailing whitespace', () => {
      const result = parseCommand('  /help  ');
      expect(result.type).toBe('help');
    });

    it('should handle multiple spaces in arguments', () => {
      const result = parseCommand('/done   1   ');
      expect(result.type).toBe('done');
      expect(result.args).toEqual(['1']);
    });
  });
});
