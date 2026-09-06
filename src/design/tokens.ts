/**
 * Design Tokens - Single Source of Truth
 * 
 * All spacing, colors, typography, and sizing values.
 * Import these tokens instead of using arbitrary Tailwind classes.
 */

// ============================================================================
// SPACING SCALE (8px base unit)
// ============================================================================
export const spacing = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
} as const;

// ============================================================================
// COLOR PALETTE (Simplified)
// ============================================================================
export const colors = {
  // Primary: Emerald (AI/Education theme)
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',  // Main
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  
  // Secondary: Slate (Neutral)
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',  // Main
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Accent: Amber (CTAs/Highlights)
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',  // Main
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Semantic Colors
  success: {
    light: '#10b981',
    main: '#059669',
    dark: '#047857',
  },
  
  warning: {
    light: '#f59e0b',
    main: '#d97706',
    dark: '#b45309',
  },
  
  error: {
    light: '#ef4444',
    main: '#dc2626',
    dark: '#b91c1c',
  },
  
  info: {
    light: '#3b82f6',
    main: '#2563eb',
    dark: '#1d4ed8',
  },
} as const;

// ============================================================================
// TYPOGRAPHY SCALE
// ============================================================================
export const typography = {
  fontSize: {
    xs: '0.75rem',    // 12px - badges, captions
    sm: '0.875rem',   // 14px - secondary body
    base: '1rem',     // 16px - primary body
    lg: '1.125rem',   // 18px - subheading
    xl: '1.25rem',    // 20px - h3
    '2xl': '1.5rem',  // 24px - h2
    '3xl': '1.875rem',// 30px - h1
    '4xl': '2.25rem', // 36px - hero
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,  // Use sparingly
  },
  
  lineHeight: {
    tight: 1.25,     // Headings
    normal: 1.5,     // Captions
    relaxed: 1.625,  // Body text
  },
  
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================
export const borderRadius = {
  sm: '0.5rem',   // 8px - inputs, small buttons
  md: '0.75rem',  // 12px - cards, medium components
  lg: '1rem',     // 16px - modals, large cards
  xl: '1.5rem',   // 24px - feature cards, heroes
  full: '9999px', // pills, avatars
} as const;

// ============================================================================
// COMPONENT SIZES
// ============================================================================
export const componentSizes = {
  button: {
    sm: {
      padding: 'px-3 py-1.5',
      fontSize: typography.fontSize.sm,
      height: '2rem', // 32px
    },
    md: {
      padding: 'px-4 py-2.5',
      fontSize: typography.fontSize.base,
      height: '2.75rem', // 44px - touch target
    },
    lg: {
      padding: 'px-6 py-3',
      fontSize: typography.fontSize.lg,
      height: '3rem', // 48px
    },
  },
  
  icon: {
    sm: 'w-4 h-4',   // 16px
    md: 'w-5 h-5',   // 20px
    lg: 'w-6 h-6',   // 24px
    xl: 'w-8 h-8',   // 32px
    '2xl': 'w-12 h-12', // 48px
  },
  
  input: {
    height: '2.75rem', // 44px - consistent with button.md
    padding: 'px-3 py-2.5',
  },
  
  card: {
    sm: 'p-4',  // 16px
    md: 'p-6',  // 24px
    lg: 'p-8',  // 32px
  },
} as const;

// ============================================================================
// SHADOWS
// ============================================================================
export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  popover: 40,
  tooltip: 50,
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================
export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
