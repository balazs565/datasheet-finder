import { ensureSettingsSeeded } from '../core/storage/settings';
import { PENDING_QUERY_KEY, type PendingQuery } from '../core/messaging/messages';

/**
 * Background service worker (MV3):
 *  - seeds default settings on install
 *  - registers context menus ("Find Datasheet" / "Search Datasheet")
 *  - handles the keyboard command to search the current selection
 *  - hands the selected text to the popup via storage, then opens the popup
 */

const MENU_FIND = 'datasheet-finder-find';
const MENU_SEARCH = 'datasheet-finder-search';

function registerContextMenus(): void {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_FIND,
      title: 'Find Datasheet for "%s"',
      contexts: ['selection'],
    });
    chrome.contextMenus.create({
      id: MENU_SEARCH,
      title: 'Search Datasheet for "%s"',
      contexts: ['selection'],
    });
  });
}

/** Store the selected text so the popup can pick it up when it opens. */
async function stagePendingQuery(text: string): Promise<void> {
  const payload: PendingQuery = { text: text.trim(), timestamp: Date.now() };
  await chrome.storage.local.set({ [PENDING_QUERY_KEY]: payload });
}

/**
 * Open the popup programmatically. `chrome.action.openPopup` is only available
 * in newer Chrome and only from a user gesture; we fall back to opening the
 * popup page in a tab so the flow always works.
 */
async function openInterface(): Promise<void> {
  try {
    if (chrome.action.openPopup) {
      await chrome.action.openPopup();
      return;
    }
  } catch {
    // fall through to tab fallback
  }
  await chrome.tabs.create({ url: chrome.runtime.getURL('src/popup/index.html') });
}

chrome.runtime.onInstalled.addListener(async () => {
  await ensureSettingsSeeded();
  registerContextMenus();
});

// Service workers can be torn down; re-register menus on startup too.
chrome.runtime.onStartup?.addListener(() => {
  registerContextMenus();
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_FIND && info.menuItemId !== MENU_SEARCH) return;
  const text = info.selectionText ?? '';
  if (!text.trim()) return;
  await stagePendingQuery(text);
  await openInterface();
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'search-selection') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection()?.toString() ?? '',
    });
    if (result && result.trim()) {
      await stagePendingQuery(result);
    }
  } catch {
    // page may disallow injection (e.g. chrome:// pages) — open popup anyway
  }
  await openInterface();
});
