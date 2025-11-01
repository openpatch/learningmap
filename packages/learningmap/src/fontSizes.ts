// Font size constants for node labels

export type FontSizeOption = "S" | "M" | "L" | "XL";

export const FONT_SIZE_VALUES: Record<FontSizeOption, number> = {
  S: 10,
  M: 14,
  L: 18,
  XL: 24,
};

export const DEFAULT_FONT_SIZE: FontSizeOption = "M";

// Helper function to map numeric value to closest font size option
function mapNumericToOption(value: number): FontSizeOption {
  if (value <= 10) return "S";
  if (value <= 14) return "M";
  if (value <= 18) return "L";
  return "XL";
}

export function getFontSizeValue(size?: number | FontSizeOption): number {
  if (typeof size === "number") {
    // Convert old numeric values to closest size
    return FONT_SIZE_VALUES[mapNumericToOption(size)];
  }
  if (size && size in FONT_SIZE_VALUES) {
    return FONT_SIZE_VALUES[size as FontSizeOption];
  }
  return FONT_SIZE_VALUES[DEFAULT_FONT_SIZE];
}

export function getFontSizeOption(value?: number): FontSizeOption {
  if (!value) return DEFAULT_FONT_SIZE;
  return mapNumericToOption(value);
}
