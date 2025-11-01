// Font size constants for node labels

export type FontSizeOption = "S" | "M" | "L" | "XL";

export const FONT_SIZE_VALUES: Record<FontSizeOption, number> = {
  S: 10,
  M: 14,
  L: 18,
  XL: 24,
};

export const DEFAULT_FONT_SIZE: FontSizeOption = "M";

// Thresholds for mapping numeric values to font size options
const THRESHOLD_S_TO_M = 10;
const THRESHOLD_M_TO_L = 14;
const THRESHOLD_L_TO_XL = 18;

// Helper function to map numeric value to closest font size option
function mapNumericToOption(value: number): FontSizeOption {
  if (value <= THRESHOLD_S_TO_M) return "S";
  if (value <= THRESHOLD_M_TO_L) return "M";
  if (value <= THRESHOLD_L_TO_XL) return "L";
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
