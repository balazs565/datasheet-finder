import { useState } from 'react';
import type { SearchResult } from '../core/types';
import { ConfidenceBadge } from './ConfidenceBadge';
import { PdfBadge } from './PdfBadge';
import { ManufacturerLogo } from './ManufacturerLogo';
import {
  copyToClipboard,
  downloadUrl,
  filenameFromUrl,
  openInNewTab,
  openViewer,
} from '../core/util/actions';
import { bareDomain } from '../core/util/url';

interface Props {
  result: SearchResult;
  manufacturer: string | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const SOURCE_LABEL: Record<SearchResult['source'], string> = {
  official: 'Official',
  manual: 'Manual',
  brief: 'Product brief',
  retailer: 'Retailer',
  mirror: 'Mirror',
  unknown: 'Web',
};

/** A single ranked result with open/copy/download/favorite actions. */
export function ResultCard({ result, manufacturer, isFavorite, onToggleFavorite }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (await copyToClipboard(result.url)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <article className="result">
      <ManufacturerLogo name={manufacturer} domain={result.domain} size={30} />
      <div className="result-body">
        <div className="result-titleline">
          <button
            className="result-title truncate"
            onClick={() => openInNewTab(result.url)}
            title={result.title}
          >
            {result.title}
          </button>
          <ConfidenceBadge confidence={result.confidence} />
        </div>

        <div className="result-meta">
          <span className="subtle truncate" title={result.domain}>
            {bareDomain(result.domain)}
          </span>
          <span className="dot">·</span>
          <span className="subtle">{SOURCE_LABEL[result.source]}</span>
          {result.isPdf && <PdfBadge />}
        </div>

        {result.snippet && <p className="result-snippet">{result.snippet}</p>}

        <div className="result-actions">
          <button className="btn btn-sm" onClick={() => openInNewTab(result.url)}>
            Open
          </button>
          {result.isPdf && (
            <button
              className="btn btn-sm"
              onClick={() => openViewer(result.url, result.title)}
            >
              Preview
            </button>
          )}
          <button className="btn btn-sm" onClick={copy}>
            {copied ? 'Copied!' : 'Copy URL'}
          </button>
          {result.isPdf && (
            <button
              className="btn btn-sm"
              onClick={() => downloadUrl(result.url, filenameFromUrl(result.url))}
            >
              Download
            </button>
          )}
          <button
            className={`btn btn-sm btn-fav ${isFavorite ? 'is-active' : ''}`}
            onClick={onToggleFavorite}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFavorite}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </div>
      </div>
    </article>
  );
}
