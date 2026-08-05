import { describe, it, expect } from "vitest";
import { getReadableTextColor, getRelativeLuminance } from "./colorHelper";

describe("getRelativeLuminance", () => {
  it("returns 0 for black and 1 for white", () => {
    expect(getRelativeLuminance("#000000")).toBeCloseTo(0);
    expect(getRelativeLuminance("#ffffff")).toBeCloseTo(1);
  });

  it("supports the short hex form", () => {
    expect(getRelativeLuminance("#fff")).toBeCloseTo(
      getRelativeLuminance("#ffffff"),
    );
  });

  it("treats an unparseable colour as light", () => {
    expect(getRelativeLuminance("not-a-colour")).toBe(1);
  });
});

describe("getReadableTextColor", () => {
  it("uses dark text on a light background", () => {
    expect(getReadableTextColor("#ffffff")).toBe("#111827");
  });

  it("uses light text on a dark background", () => {
    expect(getReadableTextColor("#111827")).toBe("#f9fafb");
  });

  it("defaults to the white background when none is given", () => {
    expect(getReadableTextColor()).toBe("#111827");
    expect(getReadableTextColor("")).toBe("#111827");
  });
});
