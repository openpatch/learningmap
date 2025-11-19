# @hyperbook/web-component-learningmap

## 0.3.1

### Patch Changes

- Updated dependencies [[`0cb5661`](https://github.com/openpatch/learningmap/commit/0cb56610bb09cf81884d8ec38eff9813066bcce4)]:
  - @learningmap/learningmap@0.3.1

## 0.3.0

### Minor Changes

- [`f986065`](https://github.com/openpatch/learningmap/commit/f9860658e4817f018694895aa27dd199a3f26120) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Use sans-serif instead of an unreadable custom font

### Patch Changes

- Updated dependencies [[`f986065`](https://github.com/openpatch/learningmap/commit/f9860658e4817f018694895aa27dd199a3f26120)]:
  - @learningmap/learningmap@0.3.0

## 0.2.4

### Patch Changes

- Updated dependencies [[`4c3857c`](https://github.com/openpatch/learningmap/commit/4c3857c9674524c5b097ee0ecb5657210f9e5476)]:
  - @learningmap/learningmap@0.2.4

## 0.2.3

### Patch Changes

- Updated dependencies [[`3927c35`](https://github.com/openpatch/learningmap/commit/3927c35749477c2e67be916b7beef473f1a59339)]:
  - @learningmap/learningmap@0.2.3

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
