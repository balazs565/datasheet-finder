import { describe, it, expect } from 'vitest';
import {
  parseDuckDuckGoHtml,
  resolveDdgHref,
} from '../src/core/search/duckduckgo-provider';

describe('resolveDdgHref', () => {
  it('decodes a uddg redirect link', () => {
    const href =
      '//duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.brother.com%2Fd%2Fmfc-l5715dn.pdf&rut=abc';
    expect(resolveDdgHref(href)).toBe('https://www.brother.com/d/mfc-l5715dn.pdf');
  });

  it('keeps a direct external href', () => {
    expect(resolveDdgHref('https://www.dell.com/spec.pdf')).toBe(
      'https://www.dell.com/spec.pdf',
    );
  });

  it('drops a non-redirect duckduckgo link', () => {
    expect(resolveDdgHref('//duckduckgo.com/y.js?ad=1')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(resolveDdgHref('')).toBeNull();
  });
});

describe('parseDuckDuckGoHtml', () => {
  const html = `
    <div class="result results_links results_links_deep web-result">
      <div class="result__body">
        <h2 class="result__title">
          <a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.brother.com%2Fmfc-l5715dn-datasheet.pdf">
            Brother MFC-L5715DN Datasheet (PDF)
          </a>
        </h2>
        <a class="result__snippet">Official specifications for the MFC-L5715DN.</a>
      </div>
    </div>
    <div class="result web-result">
      <h2 class="result__title">
        <a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.amazon.com%2Fdp%2Fx">
          Brother MFC-L5715DN at Amazon
        </a>
      </h2>
      <a class="result__snippet">Buy now.</a>
    </div>`;

  it('extracts titles, decoded urls and snippets', () => {
    const results = parseDuckDuckGoHtml(html);
    expect(results).toHaveLength(2);
    expect(results[0].title).toBe('Brother MFC-L5715DN Datasheet (PDF)');
    expect(results[0].url).toBe('https://www.brother.com/mfc-l5715dn-datasheet.pdf');
    expect(results[0].snippet).toContain('Official specifications');
    expect(results[1].url).toBe('https://www.amazon.com/dp/x');
  });

  it('returns an empty array for resultless html', () => {
    expect(parseDuckDuckGoHtml('<html><body>no results</body></html>')).toEqual([]);
  });
});
