import { defineManifest } from '@crxjs/vite-plugin';

/**
 * Manifest V3 definition for Datasheet Finder.
 *
 * Host permissions are scoped to the search-provider API endpoints. The
 * content script is injected on demand via `chrome.scripting`, so we rely on
 * `activeTab` + `scripting` rather than a broad static content-script match.
 */
export default defineManifest({
  manifest_version: 3,
  name: 'Datasheet Finder',
  version: '1.0.0',
  description:
    'Quickly find official datasheets, spec sheets, manuals and technical PDFs for any product.',
  icons: {
    '16': 'icons/icon16.png',
    '32': 'icons/icon32.png',
    '48': 'icons/icon48.png',
    '128': 'icons/icon128.png',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'Datasheet Finder',
    default_icon: {
      '16': 'icons/icon16.png',
      '32': 'icons/icon32.png',
      '48': 'icons/icon48.png',
    },
  },
  options_page: 'src/options/index.html',
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['src/content/content-script.ts'],
      run_at: 'document_idle',
    },
  ],
  permissions: ['contextMenus', 'storage', 'activeTab', 'scripting', 'downloads'],
  host_permissions: [
    // Free default provider — baked in so it works on install with no prompt.
    'https://html.duckduckgo.com/*',
    'https://duckduckgo.com/*',
    'https://lite.duckduckgo.com/*',
    // Optional paid providers (only used when a key is configured).
    'https://api.bing.microsoft.com/*',
    'https://api.search.brave.com/*',
    'https://www.googleapis.com/*',
  ],
  // A SearXNG instance URL is user-supplied, so access is requested at runtime
  // (chrome.permissions.request) when the user saves a URL in Settings.
  optional_host_permissions: ['http://*/*', 'https://*/*'],
  web_accessible_resources: [
    {
      resources: ['src/viewer/index.html', 'icons/*'],
      matches: ['<all_urls>'],
    },
  ],
  commands: {
    _execute_action: {
      suggested_key: {
        default: 'Ctrl+Shift+D',
        mac: 'Command+Shift+D',
      },
      description: 'Open Datasheet Finder',
    },
    'search-selection': {
      suggested_key: {
        default: 'Ctrl+Shift+F',
        mac: 'Command+Shift+F',
      },
      description: 'Find datasheet for the selected text',
    },
  },
});
