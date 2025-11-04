# @hyperbook/web-component-learningmap

## 0.2.2

### Patch Changes

- [#45](https://github.com/openpatch/learningmap/pull/45) [`7f6a991`](https://github.com/openpatch/learningmap/commit/7f6a991066c84ddbd0f2c1088301a461cdb3c2d0) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Add browser-based image compression and 413 error handling
  - Compress uploaded images automatically using Canvas API (resize to max 1920x1920px, convert to JPEG at 0.85 quality)
  - Add support for JPG, PNG, WebP, and SVG file formats
  - Detect HTTP 413 (Payload Too Large) responses and show user-friendly error message
  - Add translations for file size error in English and German
  - Typical file size reduction: 70-90% for raster images

- Updated dependencies [[`7f6a991`](https://github.com/openpatch/learningmap/commit/7f6a991066c84ddbd0f2c1088301a461cdb3c2d0)]:
  - @learningmap/learningmap@0.2.2

## 0.2.1

### Patch Changes

- [`474286f`](https://github.com/openpatch/learningmap/commit/474286ff474d305e692bfb4308599c57a37c029d) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Fix sharing link

- Updated dependencies [[`474286f`](https://github.com/openpatch/learningmap/commit/474286ff474d305e692bfb4308599c57a37c029d)]:
  - @learningmap/learningmap@0.2.1

## 0.2.0

### Minor Changes

- [`2f6c8b9`](https://github.com/openpatch/learningmap/commit/2f6c8b9b77bcdeddef9a66988c04f88b63df75f9) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Add new props and first release of vs code extension

### Patch Changes

- Updated dependencies [[`2f6c8b9`](https://github.com/openpatch/learningmap/commit/2f6c8b9b77bcdeddef9a66988c04f88b63df75f9)]:
  - @learningmap/learningmap@0.2.0

## 0.1.0

### Minor Changes

- [`8011851`](https://github.com/openpatch/learningmap/commit/8011851793ebac305342a5d25254f62f7e85beb0) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Initial release

### Patch Changes

- Updated dependencies [[`8011851`](https://github.com/openpatch/learningmap/commit/8011851793ebac305342a5d25254f62f7e85beb0)]:
  - @learningmap/learningmap@0.1.0

## 0.0.1

### Patch Changes

- [`4aa171e`](https://github.com/openpatch/learningmap/commit/4aa171e742b7d6bb88f21cac3121ec775206ec7f) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Initial commit

- Updated dependencies [[`4aa171e`](https://github.com/openpatch/learningmap/commit/4aa171e742b7d6bb88f21cac3121ec775206ec7f)]:
  - @learningmap/learningmap@0.0.1

## 0.2.0

### Minor Changes

- [#1011](https://github.com/openpatch/hyperbook/pull/1011) [`f6f1b25`](https://github.com/openpatch/hyperbook/commit/f6f1b25f7a07e2cfcd8c2cfeb1807788aaa6c307) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Vastly improved learningmap element

## 0.1.0

### Minor Changes

- Initial release of the learningmap editor web component
- Visual editor for creating and editing learning maps
- Support for drag-and-drop node positioning
- Configurable node settings (label, description, resources, unlock rules, completion rules)
- Background customization (color and image)
- Auto-layout support using ELK algorithm
- Change event fires when saving
