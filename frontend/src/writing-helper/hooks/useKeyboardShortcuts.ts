import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onSave?: () => void;
  onAIAssist?: () => void;
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
  onQuickTemplate?: () => void;
  onExport?: () => void;
  onFocusMode?: () => void;
  onQuickPost?: () => void;
}

export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Check if user is typing in an input or textarea
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      // Only handle global shortcuts when in input/textarea
      if (!event.ctrlKey && !event.metaKey) return;
    }

    // Ctrl/Cmd + Key shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 's':
          event.preventDefault();
          handlers.onSave?.();
          break;
        case 'e':
          event.preventDefault();
          handlers.onExport?.();
          break;
        case '/':
          event.preventDefault();
          handlers.onAIAssist?.();
          break;
        case '[':
          event.preventDefault();
          handlers.onToggleLeftPanel?.();
          break;
        case ']':
          event.preventDefault();
          handlers.onToggleRightPanel?.();
          break;
        case 't':
          event.preventDefault();
          handlers.onQuickTemplate?.();
          break;
        case 'p':
          event.preventDefault();
          handlers.onQuickPost?.();
          break;
      }
    }

    // Alt + Key shortcuts
    if (event.altKey) {
      switch (event.key.toLowerCase()) {
        case 'z':
          event.preventDefault();
          handlers.onFocusMode?.();
          break;
      }
    }
  }, [handlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
};

export const KEYBOARD_SHORTCUTS = {
  SAVE: 'Ctrl/Cmd + S',
  EXPORT: 'Ctrl/Cmd + E',
  AI_ASSIST: 'Ctrl/Cmd + /',
  TOGGLE_LEFT: 'Ctrl/Cmd + [',
  TOGGLE_RIGHT: 'Ctrl/Cmd + ]',
  QUICK_TEMPLATE: 'Ctrl/Cmd + T',
  FOCUS_MODE: 'Alt + Z',
  QUICK_POST: 'Ctrl/Cmd + P'
} as const; 