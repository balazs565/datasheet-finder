import { describe, it, expect } from 'vitest';
import { mapSearxngResults } from '../src/core/search/searxng-provider';

describe('mapSearxngResults', () => {
  it('maps results[] to RawResult[]', () => {
    const raws = mapSearxngResults({
      results: [
        {
          title: 'MFC-L5715DN Datasheet',
          url: 'https://www.brother.com/d.pdf',
          content: 'Specs',
        },
        { title: 'No content', url: 'https://example.com/x' },
      ],
    });
    expect(raws).toHaveLength(2);
    expect(raws[0]).toEqual({
      title: 'MFC-L5715DN Datasheet',
      url: 'https://www.brother.com/d.pdf',
      snippet: 'Specs',
    });
    expect(raws[1].snippet).toBeUndefined();
  });

  it('skips entries missing a url or title', () => {
    const raws = mapSearxngResults({
      results: [
        { title: '', url: 'https://x.com' },
        { title: 'No url', url: '' },
        { title: 'ok', url: 'https://ok.com' },
      ],
    });
    expect(raws).toHaveLength(1);
    expect(raws[0].title).toBe('ok');
  });

  it('handles a missing results field', () => {
    expect(mapSearxngResults({})).toEqual([]);
  });
});
