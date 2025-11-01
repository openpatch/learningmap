// Font size constants for node labels

export type FontSizeOption = "S" | "M" | "L" | "XL";

export const FONT_SIZE_VALUES: Record<FontSizeOption, number> = {
  S: 10,
  M: 14,
  L: 18,
  XL: 24,
};

export const DEFAULT_FONT_SIZE: FontSizeOption = "M";

export function getFontSizeValue(size?: number | FontSizeOption): number {
  if (typeof size === "number") {
    // Convert old numeric values to closest size
    if (size <= 10) return FONT_SIZE_VALUES.S;
    if (size <= 14) return FONT_SIZE_VALUES.M;
    if (size <= 18) return FONT_SIZE_VALUES.L;
    return FONT_SIZE_VALUES.XL;
  }
  if (size && size in FONT_SIZE_VALUES) {
    return FONT_SIZE_VALUES[size as FontSizeOption];
  }
  return FONT_SIZE_VALUES[DEFAULT_FONT_SIZE];
}

export function getFontSizeOption(value?: number): FontSizeOption {
  if (!value) return DEFAULT_FONT_SIZE;
  // Find closest match
  if (value <= 10) return "S";
  if (value <= 14) return "M";
  if (value <= 18) return "L";
  return "XL";
}
