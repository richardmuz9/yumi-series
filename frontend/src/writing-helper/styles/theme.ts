interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: {
    main: string;
    alt: string;
    panel: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  border: {
    light: string;
    medium: string;
    focus: string;
  };
  status: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  ai: {
    suggestion: string;
    action: string;
    highlight: string;
  };
}

export const themes: Record<'light' | 'dark', ThemeColors> = {
  light: {
    primary: '#7C3AED', // Vibrant purple
    secondary: '#4F46E5', // Indigo
    accent: '#F59E0B', // Warm amber
    background: {
      main: '#FFFFFF',
      alt: '#F9FAFB',
      panel: '#F3F4F6'
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      muted: '#9CA3AF'
    },
    border: {
      light: '#E5E7EB',
      medium: '#D1D5DB',
      focus: '#7C3AED'
    },
    status: {
      success: '#059669',
      error: '#DC2626',
      warning: '#D97706',
      info: '#2563EB'
    },
    ai: {
      suggestion: '#EDE9FE',
      action: '#DDD6FE',
      highlight: '#C4B5FD'
    }
  },
  dark: {
    primary: '#8B5CF6', // Softer purple
    secondary: '#6366F1', // Softer indigo
    accent: '#F59E0B', // Warm amber
    background: {
      main: '#111827',
      alt: '#1F2937',
      panel: '#374151'
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      muted: '#6B7280'
    },
    border: {
      light: '#374151',
      medium: '#4B5563',
      focus: '#8B5CF6'
    },
    status: {
      success: '#059669',
      error: '#DC2626',
      warning: '#D97706',
      info: '#3B82F6'
    },
    ai: {
      suggestion: '#2E1065',
      action: '#4C1D95',
      highlight: '#5B21B6'
    }
  }
};

export type Theme = ThemeColors;
export type ThemeMode = keyof typeof themes;

// CSS variable generation
export const createThemeVariables = (theme: Theme) => {
  return {
    '--color-primary': theme.primary,
    '--color-secondary': theme.secondary,
    '--color-accent': theme.accent,
    '--color-bg-main': theme.background.main,
    '--color-bg-alt': theme.background.alt,
    '--color-bg-panel': theme.background.panel,
    '--color-text-primary': theme.text.primary,
    '--color-text-secondary': theme.text.secondary,
    '--color-text-muted': theme.text.muted,
    '--color-border-light': theme.border.light,
    '--color-border-medium': theme.border.medium,
    '--color-border-focus': theme.border.focus,
    '--color-status-success': theme.status.success,
    '--color-status-error': theme.status.error,
    '--color-status-warning': theme.status.warning,
    '--color-status-info': theme.status.info,
    '--color-ai-suggestion': theme.ai.suggestion,
    '--color-ai-action': theme.ai.action,
    '--color-ai-highlight': theme.ai.highlight
  };
}; 