/**
 * Keyboard shortcuts for web/desktop editing
 * Provides common shortcuts for productivity
 */

import { Platform } from 'react-native';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean; // Command key on Mac
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

export type ShortcutHandler = (event: KeyboardEvent) => void;

/**
 * Check if keyboard event matches a shortcut
 */
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: Omit<KeyboardShortcut, 'description' | 'action'>
): boolean {
  const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
  const ctrlMatches = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
  const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
  const altMatches = shortcut.alt ? event.altKey : !event.altKey;
  
  return keyMatches && ctrlMatches && shiftMatches && altMatches;
}

/**
 * Create a keyboard shortcut handler
 * @param shortcuts Array of keyboard shortcuts to handle
 * @returns Handler function to attach to window
 */
export function createShortcutHandler(shortcuts: KeyboardShortcut[]): ShortcutHandler {
  return (event: KeyboardEvent) => {
    // Only handle shortcuts on web/desktop
    if (Platform.OS !== 'web') return;
    
    for (const shortcut of shortcuts) {
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
        break;
      }
    }
  };
}

/**
 * Register keyboard shortcuts
 * @param shortcuts Array of shortcuts to register
 * @returns Cleanup function to remove listeners
 */
export function registerShortcuts(shortcuts: KeyboardShortcut[]): () => void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return () => {}; // No-op on non-web platforms
  }
  
  const handler = createShortcutHandler(shortcuts);
  window.addEventListener('keydown', handler);
  
  return () => {
    window.removeEventListener('keydown', handler);
  };
}

/**
 * Common keyboard shortcuts for editing
 */
export const COMMON_SHORTCUTS = {
  SAVE: { key: 's', ctrl: true, description: 'Save' },
  NEW: { key: 'n', ctrl: true, description: 'New item' },
  DELETE: { key: 'Delete', description: 'Delete item' },
  ESCAPE: { key: 'Escape', description: 'Cancel/Close' },
  ENTER: { key: 'Enter', description: 'Confirm' },
  ENTER_CTRL: { key: 'Enter', ctrl: true, description: 'Submit' },
  UNDO: { key: 'z', ctrl: true, description: 'Undo' },
  REDO: { key: 'z', ctrl: true, shift: true, description: 'Redo' },
  FIND: { key: 'f', ctrl: true, description: 'Find' },
  ARROW_UP: { key: 'ArrowUp', description: 'Move up' },
  ARROW_DOWN: { key: 'ArrowDown', description: 'Move down' },
  ARROW_UP_CTRL: { key: 'ArrowUp', ctrl: true, description: 'Move to top' },
  ARROW_DOWN_CTRL: { key: 'ArrowDown', ctrl: true, description: 'Move to bottom' },
};

/**
 * Format shortcut for display
 * @param shortcut Shortcut to format
 * @returns Human-readable string (e.g., "Ctrl+S", "Cmd+N")
 */
export function formatShortcut(shortcut: Omit<KeyboardShortcut, 'action'>): string {
  const parts: string[] = [];
  
  // Detect if we're on Mac
  const isMac = Platform.OS === 'web' && 
    typeof navigator !== 'undefined' && 
    /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  
  if (shortcut.ctrl || shortcut.meta) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  
  // Format key name
  let keyName = shortcut.key;
  if (keyName === 'ArrowUp') keyName = '↑';
  else if (keyName === 'ArrowDown') keyName = '↓';
  else if (keyName === 'ArrowLeft') keyName = '←';
  else if (keyName === 'ArrowRight') keyName = '→';
  else if (keyName === 'Enter') keyName = '↵';
  else if (keyName === 'Escape') keyName = 'Esc';
  else if (keyName === 'Delete') keyName = 'Del';
  else keyName = keyName.toUpperCase();
  
  parts.push(keyName);
  
  return parts.join('+');
}

/**
 * Get shortcut hint text for UI
 * @param shortcut Shortcut to get hint for
 * @returns Formatted hint (e.g., "Save (Ctrl+S)")
 */
export function getShortcutHint(shortcut: KeyboardShortcut): string {
  return `${shortcut.description} (${formatShortcut(shortcut)})`;
}
