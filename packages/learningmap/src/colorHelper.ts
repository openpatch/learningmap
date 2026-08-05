/** Fallback used when no background colour has been configured. */
const DEFAULT_BACKGROUND = "#ffffff";

const DARK_TEXT = "#111827";
const LIGHT_TEXT = "#f9fafb";

function parseHexColor(color: string): [number, number, number] | null {
  const hex = color.trim().replace(/^#/, "");

  if (hex.length === 3) {
    const [r, g, b] = hex.split("");
    return [
      parseInt(r + r, 16),
      parseInt(g + g, 16),
      parseInt(b + b, 16),
    ];
  }

  if (hex.length === 6) {
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }

  return null;
}

/** Relative luminance per WCAG 2.1, from 0 (black) to 1 (white). */
export function getRelativeLuminance(color: string): number {
  const rgb = parseHexColor(color);
  if (!rgb || rgb.some(Number.isNaN)) return 1;

  const [r, g, b] = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Text colour that stays readable on `background`.
 *
 * Used as the default for text nodes: the previous fixed default (#e5e7eb)
 * sits at a contrast ratio of roughly 1.2:1 on the default white background,
 * which makes a freshly added text node effectively invisible.
 */
export function getReadableTextColor(background?: string): string {
  return getRelativeLuminance(background || DEFAULT_BACKGROUND) > 0.5
    ? DARK_TEXT
    : LIGHT_TEXT;
}
