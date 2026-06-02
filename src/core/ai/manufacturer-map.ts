import type { Manufacturer } from '../types';

/**
 * Built-in, extendable manufacturer registry.
 *
 * To add a manufacturer, append an entry here, or let users add entries at
 * runtime via Settings (stored in `settings.customManufacturers` and merged
 * over this list by {@link buildManufacturerIndex}).
 */
export const BUILTIN_MANUFACTURERS: Manufacturer[] = [
  { name: 'Dell', domain: 'dell.com', aliases: ['dell'], modelPrefixes: ['latitude', 'optiplex', 'poweredge', 'xps', 'precision', 'inspiron'] },
  { name: 'HP', domain: 'hp.com', aliases: ['hp', 'hewlett packard', 'hewlett-packard'], modelPrefixes: ['probook', 'elitebook', 'pavilion', 'spectre', 'omen'] },
  { name: 'HPE', domain: 'hpe.com', aliases: ['hpe', 'hewlett packard enterprise'], modelPrefixes: ['proliant', 'aruba', 'synergy'] },
  { name: 'Lenovo', domain: 'lenovo.com', aliases: ['lenovo'], modelPrefixes: ['thinkpad', 'thinkcentre', 'ideapad', 'legion', 'yoga'] },
  { name: 'Cisco', domain: 'cisco.com', aliases: ['cisco'], modelPrefixes: ['catalyst', 'nexus', 'meraki', 'ws-c', 'isr', 'asr'] },
  { name: 'Synology', domain: 'synology.com', aliases: ['synology'], modelPrefixes: ['ds', 'rs', 'ds-', 'rs-', 'dva'] },
  { name: 'Brother', domain: 'brother.com', aliases: ['brother'], modelPrefixes: ['mfc-', 'hl-', 'dcp-', 'ql-', 'pt-'] },
  { name: 'Canon', domain: 'canon.com', aliases: ['canon'], modelPrefixes: ['pixma', 'imageclass', 'maxify', 'eos', 'imagerunner'] },
  { name: 'ASUS', domain: 'asus.com', aliases: ['asus', 'asustek'], modelPrefixes: ['rog', 'zenbook', 'vivobook', 'tuf', 'proart'] },
  { name: 'Acer', domain: 'acer.com', aliases: ['acer'], modelPrefixes: ['aspire', 'predator', 'swift', 'nitro', 'spin'] },
  { name: 'MSI', domain: 'msi.com', aliases: ['msi', 'micro-star'], modelPrefixes: ['stealth', 'raider', 'katana', 'cyborg', 'modern'] },
  { name: 'Samsung', domain: 'samsung.com', aliases: ['samsung'], modelPrefixes: ['galaxy', 'qn', 'un', 'odyssey'] },
  { name: 'LG', domain: 'lg.com', aliases: ['lg', 'lg electronics'], modelPrefixes: ['gram', 'ultragear', 'oled'] },
  { name: 'Intel', domain: 'intel.com', aliases: ['intel'], modelPrefixes: ['core', 'xeon', 'pentium', 'celeron', 'arc', 'i3-', 'i5-', 'i7-', 'i9-'] },
  { name: 'AMD', domain: 'amd.com', aliases: ['amd', 'advanced micro devices'], modelPrefixes: ['ryzen', 'epyc', 'radeon', 'threadripper', 'athlon'] },
  { name: 'MikroTik', domain: 'mikrotik.com', aliases: ['mikrotik'], modelPrefixes: ['rb', 'crs', 'ccr', 'hap', 'hex'] },
  { name: 'Ubiquiti', domain: 'ui.com', aliases: ['ubiquiti', 'unifi', 'ubnt'], modelPrefixes: ['unifi', 'usw', 'uap', 'udm', 'edgerouter'] },
  { name: 'TP-Link', domain: 'tp-link.com', aliases: ['tp-link', 'tp link', 'tplink'], modelPrefixes: ['archer', 'deco', 'tl-', 'omada'] },
  { name: 'QNAP', domain: 'qnap.com', aliases: ['qnap'], modelPrefixes: ['ts-', 'tvs-', 'tbs-'] },
  { name: 'Fortinet', domain: 'fortinet.com', aliases: ['fortinet', 'fortigate'], modelPrefixes: ['fortigate', 'fg-', 'fortiswitch', 'fortiap'] },
  { name: 'APC', domain: 'apc.com', aliases: ['apc', 'schneider electric'], modelPrefixes: ['smart-ups', 'smt', 'smx', 'srt', 'back-ups'] },
  { name: 'Epson', domain: 'epson.com', aliases: ['epson'], modelPrefixes: ['ecotank', 'workforce', 'expression', 'surecolor'] },
];

/** An index for fast lookup by alias and by model prefix. */
export interface ManufacturerIndex {
  all: Manufacturer[];
  /** alias (lower-cased) -> manufacturer */
  byAlias: Map<string, Manufacturer>;
  /** model prefix (lower-cased) -> manufacturer */
  byPrefix: Map<string, Manufacturer>;
}

/**
 * Merge built-in + custom manufacturers and build lookup indexes.
 * Custom entries override built-ins with the same (case-insensitive) name.
 */
export function buildManufacturerIndex(custom: Manufacturer[] = []): ManufacturerIndex {
  const merged = new Map<string, Manufacturer>();
  for (const m of BUILTIN_MANUFACTURERS) merged.set(m.name.toLowerCase(), m);
  for (const m of custom) merged.set(m.name.toLowerCase(), m);

  const all = [...merged.values()];
  const byAlias = new Map<string, Manufacturer>();
  const byPrefix = new Map<string, Manufacturer>();

  for (const m of all) {
    byAlias.set(m.name.toLowerCase(), m);
    for (const a of m.aliases) byAlias.set(a.toLowerCase(), m);
    for (const p of m.modelPrefixes ?? []) byPrefix.set(p.toLowerCase(), m);
  }

  return { all, byAlias, byPrefix };
}
