/**
 * Component Variant Classes
 * 
 * Pre-built class combinations for common components.
 * Use these instead of inline Tailwind classes.
 */

import { spacing, colors, typography, borderRadius, componentSizes, shadows } from './tokens';

// ============================================================================
// BUTTON VARIANTS
// ============================================================================
export const buttonVariants = {
  primary: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm',
  secondary: 'bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white',
  accent: 'bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-900 shadow-sm',
  outline: 'border-2 border-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 text-emerald-700 dark:hover:bg-emerald-950 dark:text-emerald-400',
  ghost: 'hover:bg-slate-100 active:bg-slate-200 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-300',
  danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm',
} as const;

export const buttonSizes = {
  sm: `${componentSizes.button.sm.padding} text-sm font-semibold rounded-lg h-8`,
  md: `${componentSizes.button.md.padding} text-base font-semibold rounded-xl h-11`,
  lg: `${componentSizes.button.lg.padding} text-lg font-bold rounded-xl h-12`,
} as const;

export const buttonBase = 'inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2';

// ============================================================================
// CARD VARIANTS
// ============================================================================
export const cardVariants = {
  default: 'bg-white dark:bg-slate-800 rounded-xl',
  bordered: 'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700',
  elevated: 'bg-white dark:bg-slate-800 rounded-xl shadow-md',
  interactive: 'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200',
} as const;

export const cardPadding = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const;

// ============================================================================
// BADGE VARIANTS
// ============================================================================
export const badgeVariants = {
  primary: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
  secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  accent: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
} as const;

export const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs font-semibold rounded-md',
  md: 'px-2.5 py-1 text-sm font-semibold rounded-lg',
} as const;

// ============================================================================
// INPUT VARIANTS
// ============================================================================
export const inputBase = 'w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors';

export const inputStates = {
  error: 'border-red-500 focus:ring-red-500',
  success: 'border-green-500 focus:ring-green-500',
  disabled: 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800',
} as const;

// ============================================================================
// HEADING VARIANTS
// ============================================================================
export const headingVariants = {
  h1: 'text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white',
  h2: 'text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white',
  h3: 'text-xl font-semibold leading-tight text-slate-900 dark:text-white',
  h4: 'text-lg font-semibold leading-tight text-slate-800 dark:text-slate-100',
} as const;

export const textVariants = {
  body: 'text-base leading-relaxed text-slate-700 dark:text-slate-300',
  bodySecondary: 'text-sm leading-relaxed text-slate-600 dark:text-slate-400',
  caption: 'text-sm leading-normal text-slate-500 dark:text-slate-400',
  label: 'text-xs font-medium leading-normal text-slate-700 dark:text-slate-300',
} as const;

// ============================================================================
// ICON SIZES
// ============================================================================
export const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-12 h-12',
} as const;

// ============================================================================
// UTILITY CLASSES
// ============================================================================
export const utils = {
  // Focus ring for keyboard navigation
  focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
  
  // Active scale feedback
  activeScale: 'active:scale-95 transition-transform',
  
  // Smooth transitions
  transition: 'transition-all duration-200',
  
  // Truncate text
  truncate: 'truncate',
  
  // Custom scrollbar
  customScrollbar: 'custom-scrollbar',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Combine multiple class strings
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get button classes
 */
export function getButtonClasses(
  variant: keyof typeof buttonVariants = 'primary',
  size: keyof typeof buttonSizes = 'md'
): string {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size]);
}

/**
 * Get card classes
 */
export function getCardClasses(
  variant: keyof typeof cardVariants = 'bordered',
  padding: keyof typeof cardPadding = 'md'
): string {
  return cn(cardVariants[variant], cardPadding[padding]);
}

/**
 * Get badge classes
 */
export function getBadgeClasses(
  variant: keyof typeof badgeVariants = 'primary',
  size: keyof typeof badgeSizes = 'sm'
): string {
  return cn(badgeVariants[variant], badgeSizes[size]);
}

/**
 * Get icon size class
 */
export function getIconSize(size: keyof typeof iconSizes = 'md'): string {
  return iconSizes[size];
}
