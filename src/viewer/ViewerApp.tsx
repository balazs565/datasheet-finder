import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useSettings } from '../hooks/useSettings';
import {
  copyToClipboard,
  downloadUrl,
  filenameFromUrl,
  openInNewTab,
} from '../core/util/actions';
import { bareDomain, hostnameOf, isHttpUrl } from '../core/util/url';

function getParams(): { url: string; title: string } {
  const params = new URLSearchParams(window.location.search);
  return { url: params.get('url') ?? '', title: params.get('title') ?? '' };
}

export function ViewerApp() {
  const { settings } = useSettings();
  useTheme(settings.theme);
  const { url, title } = getParams();
  const [copied, setCopied] = useState(false);

  // Only ever frame/open http(s) URLs. The viewer page is web-accessible, so the
  // `?url=` param is untrusted — reject javascript:/data:/file: and the like.
  const safeUrl = isHttpUrl(url) ? url : '';

  const copy = async () => {
    if (await copyToClipboard(safeUrl)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  if (!safeUrl) {
    return (
      <div className="viewer">
        <div className="state">
          <div className="state-icon">📄</div>
          <p className="state-title">{url ? 'Unsupported URL' : 'No PDF specified'}</p>
          <p className="muted state-hint">
            {url
              ? 'Only http(s) PDF links can be previewed here.'
              : 'Open a PDF from a search result to preview it.'}
          </p>
        </div>
      </div>
    );
  }

  const domain = bareDomain(hostnameOf(safeUrl));

  return (
    <div className="viewer">
      <header className="viewer-header">
        <div className="viewer-meta">
          <span className="brand-mark">DF</span>
          <div className="viewer-titles">
            <span className="viewer-title truncate" title={title || safeUrl}>
              {title || filenameFromUrl(safeUrl)}
            </span>
            <span className="subtle truncate">{domain}</span>
          </div>
        </div>
        <div className="viewer-actions">
          <button className="btn btn-sm" onClick={() => openInNewTab(safeUrl)}>
            Open in new tab
          </button>
          <button className="btn btn-sm" onClick={copy}>
            {copied ? 'Copied!' : 'Copy URL'}
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => downloadUrl(safeUrl, filenameFromUrl(safeUrl))}
          >
            Download
          </button>
        </div>
      </header>

      <div className="viewer-frame">
        {/* Embeds the PDF using the browser's built-in viewer. */}
        <iframe title={title || 'PDF preview'} src={safeUrl} />
      </div>
    </div>
  );
}
