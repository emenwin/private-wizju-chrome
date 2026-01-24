/**
 * UI Constants for Xtream Series Detail View
 *
 * Centralized UI-related constants for consistent styling and layout.
 */

export const SERIES_DETAIL_UI = {
  // Layout dimensions
  BACKDROP_HEIGHT: 'h-64', // Reduced from h-96 to h-64 for more compact layout
  POSTER_ASPECT_RATIO: 'aspect-[3/4]', // Changed from 2/3 to 3/4 for more compact poster
  VIDEO_MAX_HEIGHT: 'max-h-[50vh]', // Reduced from 55vh to 50vh

  // Spacing
  SECTION_PADDING: 'p-4', // Reduced from p-6 to p-4
  CARD_PADDING: 'p-4', // Reduced from p-5 to p-4
  EPISODE_PADDING: 'p-3', // Reduced from p-4 to p-3
  GAP_SMALL: 'gap-2',
  GAP_MEDIUM: 'gap-3', // Reduced from gap-4 to gap-3
  GAP_LARGE: 'gap-4', // Reduced from gap-6 to gap-4
  GAP_EXTRA_LARGE: 'gap-5', // Reduced from gap-8 to gap-5

  // Border radius
  BORDER_RADIUS_SMALL: 'rounded-xl',
  BORDER_RADIUS_MEDIUM: 'rounded-2xl',
  BORDER_RADIUS_LARGE: 'rounded-3xl',

  // Shadows
  SHADOW_SMALL: 'shadow-sm',
  SHADOW_MEDIUM: 'shadow-md',
  SHADOW_LARGE: 'shadow-lg',

  // Gradients
  BACKDROP_GRADIENT: 'bg-gradient-to-r from-stream-bg via-stream-bg/90 to-stream-bg/30',
  OVERLAY_GRADIENT: 'bg-gradient-to-t from-black/80 via-black/40 to-transparent',

  // Animations
  TRANSITION_DURATION: 'transition-all duration-300',
  HOVER_SCALE: 'hover:scale-105',
  HOVER_SHADOW: 'hover:shadow-xl',

  // Text sizes
  TITLE_SIZE: 'text-3xl', // Reduced from text-4xl to text-3xl
  SUBTITLE_SIZE: 'text-base', // Reduced from text-lg to text-base
  BODY_SIZE: 'text-sm', // Reduced from text-base to text-sm
  SMALL_SIZE: 'text-xs', // Reduced from text-sm to text-xs
  EXTRA_SMALL_SIZE: 'text-xs',

  // Colors (using CSS variables)
  ACCENT_COLOR: 'bg-stream-accent',
  SURFACE_COLOR: 'bg-stream-surface',
  BORDER_COLOR: 'border-stream-border',
  TEXT_COLOR: 'text-stream-text',
  TEXT_MUTED_COLOR: 'text-stream-text-muted',

  // Button styles
  BUTTON_VARIANT_OUTLINE:
    'border border-stream-border text-stream-text-muted hover:text-stream-text hover:bg-stream-accent/10',
  BUTTON_VARIANT_SELECTED: 'bg-stream-accent text-white border-stream-accent',
  BUTTON_GRADIENT_PRIMARY: 'bg-gradient-primary',
  BUTTON_HOVER_ACCENT: 'hover:bg-stream-accent-hover',
} as const

// Export individual constants for convenience
export const {
  BACKDROP_HEIGHT,
  POSTER_ASPECT_RATIO,
  VIDEO_MAX_HEIGHT,
  SECTION_PADDING,
  CARD_PADDING,
  EPISODE_PADDING,
  GAP_SMALL,
  GAP_MEDIUM,
  GAP_LARGE,
  GAP_EXTRA_LARGE,
  BORDER_RADIUS_SMALL,
  BORDER_RADIUS_MEDIUM,
  BORDER_RADIUS_LARGE,
  SHADOW_SMALL,
  SHADOW_MEDIUM,
  SHADOW_LARGE,
  BACKDROP_GRADIENT,
  OVERLAY_GRADIENT,
  TRANSITION_DURATION,
  HOVER_SCALE,
  HOVER_SHADOW,
  TITLE_SIZE,
  SUBTITLE_SIZE,
  BODY_SIZE,
  SMALL_SIZE,
  EXTRA_SMALL_SIZE,
  ACCENT_COLOR,
  SURFACE_COLOR,
  BORDER_COLOR,
  TEXT_COLOR,
  TEXT_MUTED_COLOR,
  BUTTON_VARIANT_OUTLINE,
  BUTTON_VARIANT_SELECTED,
  BUTTON_GRADIENT_PRIMARY,
  BUTTON_HOVER_ACCENT,
} = SERIES_DETAIL_UI
