import { describe, it, expect } from 'vitest';
import { analyzeProduct } from '../src/core/ai/manufacturer-detect';

describe('analyzeProduct manufacturer detection', () => {
  it('detects brand from leading alias', () => {
    const a = analyzeProduct('Brother MFC-L5715DN printer');
    expect(a.manufacturer?.name).toBe('Brother');
    expect(a.manufacturer?.domain).toBe('brother.com');
    expect(a.manufacturerConfidence).toBeGreaterThanOrEqual(90);
    expect(a.normalized).toBe('Brother MFC-L5715DN');
  });

  it('detects brand from model prefix only', () => {
    const a = analyzeProduct('MFC-L5715DN');
    expect(a.manufacturer?.name).toBe('Brother');
    expect(a.manufacturerConfidence).toBeGreaterThan(0);
  });

  it('detects multi-word alias', () => {
    const a = analyzeProduct('TP-Link Archer AX55');
    expect(a.manufacturer?.name).toBe('TP-Link');
  });

  it('returns null for unknown brands', () => {
    const a = analyzeProduct('Foobar 9000 widget');
    expect(a.manufacturer).toBeNull();
    expect(a.manufacturerConfidence).toBe(0);
  });

  it('honors custom manufacturers', () => {
    const a = analyzeProduct('Contoso CX-100', [
      { name: 'Contoso', domain: 'contoso.com', aliases: ['contoso'] },
    ]);
    expect(a.manufacturer?.domain).toBe('contoso.com');
  });
});
