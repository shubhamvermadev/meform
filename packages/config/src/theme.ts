/**
 * Global color palette for meform (Gmail-inspired)
 * All components should use these theme tokens via CSS variables
 */
export const PALETTE = {
  dark: "#202124", // Gmail dark text
  accent: "#1a73e8", // Gmail blue
  accentSoft: "#e8f0fe", // Gmail light blue background
  backgroundSoft: "#f8f9fa", // Gmail light gray background
  info: "#1a73e8", // Same as accent
  // Gmail additional colors
  gray: "#5f6368", // Gmail gray text
  lightGray: "#dadce0", // Gmail border gray
  hoverGray: "#f1f3f4", // Gmail hover background
  white: "#ffffff",
} as const;

export type PaletteKey = keyof typeof PALETTE;

