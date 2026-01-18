---
name: Changelog
index: 3
---

# Changelog

The entire release archive of learningmap is available on [NPM](https://www.npmjs.com/package/@learningmap/learningmap).

:::alert{info}

If you need a new feature, open an [issue](https://github.com/openpatch/learningmap/issues) and let's discuss.

:::

## v0.5.0

::::tabs

:::tab{title="New :rocket:" id="new"}

- Add "Auto" language detection option in settings
- Add `getLanguage()` and `getTranslations()` methods to editor store

:::

:::tab{title="Improved :+1:" id="improved"}

- Default language is now "auto" which detects browser language automatically
- Better internationalization support with improved language selection logic
- Simplified translation access throughout components via store methods

:::

::::

## v0.3.1

::::tabs

:::tab{title="Fixed :bug:" id="fixed"}

- Fix text color in drawer for better readability

:::

::::

## v0.3.0

::::tabs

:::tab{title="Improved :+1:" id="improved"}

- Use sans-serif font instead of custom font for better readability
- Use CSS variable for font color

:::

:::tab{title="Fixed :bug:" id="fixed"}

- Fix React hook error

:::

::::

## v0.2.4

::::tabs

:::tab{title="Fixed :bug:" id="fixed"}

- Improve node dragging performance by throttling undo history updates
:::

::::

## v0.2.3

::::tabs

:::tab{title="Improved :+1:" id="improved"}

- Significantly improved node dragging performance by optimizing undo history updates
- Reduced lag when dragging nodes, especially noticeable in the VSCode platform
- Optimized temporal middleware throttling from 1000ms to 500ms with better batching strategy

:::

::::

## v0.2.2

::::tabs

:::tab{title="New :rocket:" id="new"}

- Add browser-based image compression for uploaded images to reduce file size by 70-90%
- Add support for WebP image format (JPG, PNG, WebP, and SVG now supported)

:::

:::tab{title="Improved :+1:" id="improved"}

- Automatically resize images to max 1920x1920px while maintaining aspect ratio
- Convert raster images to JPEG format for optimal compression
- Detect HTTP 413 (Payload Too Large) errors and show user-friendly message
- Add translations for file size error in English and German

:::

::::

## v0.2.1

::::tabs

:::tab{title="Fixed :bug:" id="fixed"}

- Fix share link.

:::

::::

## v0.2.0

::::tabs

:::tab{title="New :rocket:" id="new"}

- Make keyboard shortcuts configurable.

:::

::::

## v0.1.0

::::tabs

:::tab{title="New :rocket:" id="new"}

- Initial release of learningmap!

:::

::::
