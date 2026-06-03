import { describe, it, expect } from 'vitest';
import { resultsToCsv } from '../src/core/export/csv';
import type { SearchResult } from '../src/core/types';

const result: SearchResult = {
  title: 'MFC-L5715DN, "Datasheet"',
  url: 'https://www.brother.com/d.pdf',
  domain: 'www.brother.com',
  isPdf: true,
  source: 'official',
  confidence: 96,
  provider: 'bing',
  docType: 'datasheet',
};

describe('resultsToCsv', () => {
  it('includes a header row', () => {
    const csv = resultsToCsv([result]);
    expect(csv.split('\r\n')[0]).toBe('Title,Domain,URL,PDF,Source,Confidence,Provider');
  });

  it('escapes quotes and commas', () => {
    const csv = resultsToCsv([result]);
    expect(csv).toContain('"MFC-L5715DN, ""Datasheet"""');
  });
});
