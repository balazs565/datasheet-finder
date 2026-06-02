import { describe, it, expect } from 'vitest';
import { analyzeProduct } from '../src/core/ai/manufacturer-detect';
import { rankResults, scoreResult } from '../src/core/ranking/ranker';
import { DEFAULT_SETTINGS } from '../src/core/storage/settings';

const analysis = analyzeProduct('Brother MFC-L5715DN printer');

describe('scoreResult tiers', () => {
  it('scores an official datasheet PDF highest', () => {
    const r = scoreResult(
      {
        title: 'MFC-L5715DN Datasheet',
        url: 'https://www.brother.com/specs/mfc-l5715dn-datasheet.pdf',
      },
      analysis,
      DEFAULT_SETTINGS,
    );
    expect(r.source).toBe('official');
    expect(r.isPdf).toBe(true);
    expect(r.confidence).toBeGreaterThanOrEqual(90);
  });

  it('ranks a retailer PDF lower', () => {
    const r = scoreResult(
      { title: 'Brother MFC-L5715DN', url: 'https://www.amazon.com/dp/spec.pdf' },
      analysis,
      DEFAULT_SETTINGS,
    );
    expect(r.source).toBe('retailer');
    expect(r.confidence).toBeLessThan(50);
  });

  it('ranks a mirror site lower than official', () => {
    const r = scoreResult(
      { title: 'MFC-L5715DN manual', url: 'https://www.manualslib.com/manual/123.pdf' },
      analysis,
      DEFAULT_SETTINGS,
    );
    expect(r.source).toBe('mirror');
  });
});

describe('rankResults', () => {
  it('sorts by confidence, dedupes, and caps', () => {
    const ranked = rankResults(
      [
        { title: 'Brother MFC-L5715DN', url: 'https://www.amazon.com/x.pdf' },
        { title: 'MFC-L5715DN Datasheet', url: 'https://www.brother.com/d.pdf' },
        { title: 'dup', url: 'https://www.brother.com/d.pdf' },
      ],
      analysis,
      { ...DEFAULT_SETTINGS, maxResults: 10 },
      'bing',
    );
    expect(ranked).toHaveLength(2); // dedup removed the duplicate
    expect(ranked[0].domain).toContain('brother.com');
    expect(ranked[0].confidence).toBeGreaterThan(ranked[1].confidence);
  });
});
