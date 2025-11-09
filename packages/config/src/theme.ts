/**
 * Global color palette for meform
 * All components should use these theme tokens via CSS variables
 */
export const PALETTE = {
  dark: "#201e1f",
  accent: "#ff4000",
  accentSoft: "#faaa8d",
  backgroundSoft: "#feefdd",
  info: "#50b2c0",
} as const;

export type PaletteKey = keyof typeof PALETTE;

