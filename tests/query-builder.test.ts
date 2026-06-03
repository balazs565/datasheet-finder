import { describe, it, expect } from 'vitest';
import { analyzeProduct } from '../src/core/ai/manufacturer-detect';
import { buildQueries, buildPlainQueries } from '../src/core/ai/query-builder';
import { DOC_TYPES } from '../src/core/doc-types';

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

describe('buildQueries for other document types', () => {
  it('uses the document type search terms (EU Declaration of Conformity)', () => {
    const analysis = analyzeProduct('Brother MFC-L5715DN printer');
    const queries = buildQueries(analysis, DOC_TYPES.doc);

    // Lead query and a `<term> pdf` query are built from the DoC search terms.
    expect(queries[0].query).toBe(
      'Brother MFC-L5715DN EU Declaration of Conformity filetype:pdf',
    );
    expect(queries.map((q) => q.query)).toContain(
      'Brother MFC-L5715DN Declaration of Conformity pdf',
    );
    expect(queries.map((q) => q.query)).toContain('Brother MFC-L5715DN CE Declaration pdf');

    // Every query is tagged with the doc type so results group correctly.
    expect(queries.every((q) => q.docType === 'doc')).toBe(true);

    // Manufacturer-scoped query uses the DoC lead term, not "datasheet".
    expect(queries.find((q) => q.intent === 'site-eu-declaration-of-conformity')?.query).toBe(
      'site:brother.com Brother MFC-L5715DN EU Declaration of Conformity',
    );
  });

  it('tags datasheet queries with the datasheet doc type', () => {
    const analysis = analyzeProduct('Brother MFC-L5715DN printer');
    expect(buildQueries(analysis).every((q) => q.docType === 'datasheet')).toBe(true);
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
