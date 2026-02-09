/**
 * Generate SVG pattern background URL for profile photos
 * Creates a decorative cross/plus pattern with customizable color
 */
export function generatePatternSvg(color: string): string {
  // Convert color to URL-safe format
  // Replace # with %23 for URL encoding (do NOT use encodeURIComponent as it double-encodes)
  const urlSafeColor = color.startsWith('#') ? color.replace('#', '%23') : `%23${color}`;
  
  // Original cross/plus pattern (48x48) - user's specified design
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cg fill='${urlSafeColor}' fill-opacity='0.2'%3E%3Cpath d='M12 0h18v6h6v6h6v18h-6v6h-6v6H12v-6H6v-6H0V12h6V6h6V0zm12 6h-6v6h-6v6H6v6h6v6h6v6h6v-6h6v-6h6v-6h-6v-6h-6V6zm-6 12h6v6h-6v-6zm24 24h6v6h-6v-6z'%3E%3C/path%3E%3C/g%3E%3C/svg%3E`;
}

/**
 * Generate complete background style object for photo containers
 * Uses pattern with centered positioning for balanced/proportional appearance
 */
export function getPhotoPatternStyle(color: string): React.CSSProperties {
  return {
    backgroundImage: `url("${generatePatternSvg(color)}")`,
    backgroundPosition: 'center center',
    backgroundRepeat: 'repeat',
  };
}

// Default colors for HIMA Inti pattern (can be overridden via site_settings)
// Using brand purple that works well on both light and dark backgrounds
export const DEFAULT_HIMA_INTI_PATTERN_COLOR = '#7C3AED'; // Vivid Purple (Violet-600)
