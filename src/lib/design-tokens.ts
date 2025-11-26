/**
 * Design Tokens for Unified System
 * نظام موحد للمسافات والأحجام والنقاط المرجعية
 */

export const DESIGN_TOKENS = {
  // Spacing System (based on 4px base)
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    '3xl': '3rem',    // 48px
    '4xl': '4rem',    // 64px
  },

  // Typography Scale
  typography: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },

  // Responsive Breakpoints
  breakpoints: {
    xs: '320px',  // Mobile small
    sm: '640px',  // Mobile
    md: '768px',  // Tablet
    lg: '1024px', // Desktop
    xl: '1280px', // Large Desktop
    '2xl': '1536px', // Extra Large
  },

  // Touch Targets (minimum 44x44px for accessibility)
  touchTargets: {
    minimum: '44px',
    comfortable: '48px',
    large: '56px',
  },

  // Border Radius
  radius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px',
  },

  // Container Widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Animation Durations
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  // Z-index Scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
