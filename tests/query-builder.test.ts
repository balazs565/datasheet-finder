import { describe, it, expect } from 'vitest';
import { analyzeProduct } from '../src/core/ai/manufacturer-detect';
import { buildQueries, buildPlainQueries } from '../src/core/ai/query-builder';

describe('buildQueries', () => {
  it('generates all generic + manufacturer-scoped queries', () => {
    const analysis = analyzeProduct('Brother MFC-L5715DN printer');
    const queries = buildQueries(analysis);
    const intents = queries.map((q) => q.intent);

    expect(intents).toContain('datasheet');
    expect(intents).toContain('spec-sheet');
    expect(intents).toContain('specifications');
    expect(intents).toContain('technical-specifications');
    expect(intents).toContain('product-brief');
    expect(intents).toContain('filetype-pdf');
    expect(intents).toContain('site-pdf');
    expect(intents).toContain('site-datasheet');

    // Highest-weight datasheet query leads, unquoted, with filetype:pdf.
    expect(queries.find((q) => q.intent === 'datasheet')?.query).toBe(
      'Brother MFC-L5715DN datasheet filetype:pdf',
    );
    expect(queries.find((q) => q.intent === 'filetype-pdf')?.query).toBe(
      'Brother MFC-L5715DN filetype:pdf',
    );
    expect(queries.find((q) => q.intent === 'site-pdf')?.query).toBe(
      'site:brother.com Brother MFC-L5715DN filetype:pdf',
    );
  });

  it('weights broad queries above manufacturer-scoped ones', () => {
    const analysis = analyzeProduct('Brother MFC-L5715DN printer');
    const queries = buildQueries(analysis);
    const broadMax = Math.max(
      ...queries.filter((q) => !q.manufacturerScoped).map((q) => q.weight),
    );
    const siteMax = Math.max(
      ...queries.filter((q) => q.manufacturerScoped).map((q) => q.weight),
    );
    expect(broadMax).toBeGreaterThan(siteMax);
  });

  it('omits site: queries when no manufacturer is detected', () => {
    const analysis = analyzeProduct('Foobar 9000');
    const queries = buildQueries(analysis);
    expect(queries.some((q) => q.manufacturerScoped)).toBe(false);
  });

  it('returns empty for empty input', () => {
    const analysis = analyzeProduct('');
    expect(buildQueries(analysis)).toEqual([]);
  });
});

describe('buildPlainQueries', () => {
  it('matches the spec example shape', () => {
    const analysis = analyzeProduct('Brother MFC-L5715DN printer');
    const plain = buildPlainQueries(analysis);
    expect(plain).toContain('Brother MFC-L5715DN datasheet pdf');
    expect(plain).toContain('Brother MFC-L5715DN spec sheet pdf');
    expect(plain).toContain('site:brother.com Brother MFC-L5715DN pdf');
  });
});
