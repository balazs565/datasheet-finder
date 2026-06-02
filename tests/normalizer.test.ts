import { describe, it, expect } from 'vitest';
import {
  normalizeProductName,
  extractModelNumbers,
  looksLikeModelNumber,
} from '../src/core/ai/normalizer';

describe('normalizeProductName', () => {
  it('removes category noise but keeps brand + model', () => {
    expect(normalizeProductName('Brother MFC-L5715DN printer')).toBe('Brother MFC-L5715DN');
  });

  it('strips marketing words and quotes', () => {
    expect(normalizeProductName('"Best cheap Dell XPS 15 laptop deal"')).toBe('Dell XPS 15');
  });

  it('collapses whitespace', () => {
    expect(normalizeProductName('  HP   ProBook   450   ')).toBe('HP ProBook 450');
  });

  it('never returns empty for non-empty input', () => {
    expect(normalizeProductName('laptop printer')).not.toBe('');
  });
});

describe('looksLikeModelNumber', () => {
  it('detects alphanumeric model numbers', () => {
    expect(looksLikeModelNumber('MFC-L5715DN')).toBe(true);
    expect(looksLikeModelNumber('i7-13700K')).toBe(true);
    expect(looksLikeModelNumber('RB5009')).toBe(true);
    expect(looksLikeModelNumber('5715')).toBe(true);
  });

  it('rejects plain words', () => {
    expect(looksLikeModelNumber('printer')).toBe(false);
    expect(looksLikeModelNumber('Dell')).toBe(false);
  });
});

describe('extractModelNumbers', () => {
  it('pulls model tokens from a name', () => {
    expect(extractModelNumbers('Brother MFC-L5715DN')).toEqual(['MFC-L5715DN']);
  });
});
