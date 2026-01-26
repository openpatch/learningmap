# @hyperbook/web-component-learningmap

## 0.5.1

### Patch Changes

- [`c67d1c0`](https://github.com/openpatch/learningmap/commit/c67d1c01c2b23d8542798427d261ad21aeeba508) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Fix node completion state

## 0.5.0

### Minor Changes

- [`d6220ac`](https://github.com/openpatch/learningmap/commit/d6220aca0714cc65599289158456ad0bde20161c) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Add "Auto" language detection and improve i18n system
  - Add "Auto" option to language dropdown that automatically detects browser language
  - Add `getLanguage()` and `getTranslations()` methods to editor store for easier access
  - Change default language from "en" to "auto" for better user experience
  - Improve language selection logic: settings.language → defaultLanguage → browser detection
  - Simplify translation access throughout components via store methods
  - Better support for international users with automatic language detection

## 0.4.2

### Patch Changes

- [`9f632bf`](https://github.com/openpatch/learningmap/commit/9f632bfccf3a431b7509ba17c352b717f583cbe1) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Keep transparent pixels for png images

## 0.4.1

### Patch Changes

- [`b6fb7d8`](https://github.com/openpatch/learningmap/commit/b6fb7d87f2179b7acbad3270b87f004ac2e86363) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Fix completion state not using emojis"

## 0.4.0

### Minor Changes

- [`223bd6e`](https://github.com/openpatch/learningmap/commit/223bd6e69a5f4509f026623390791cb776d23f0c) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Fix debug edges getting removed when saving

- [`815f513`](https://github.com/openpatch/learningmap/commit/815f513483ea43174f1a137abd507ba18416d4d6) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Hide content in the drawer if the node is locked

## 0.3.2

### Patch Changes

- [`b6c19e0`](https://github.com/openpatch/learningmap/commit/b6c19e0ff43f965fc85751fa68289281d162035c) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Add missing styles for started nodes

## 0.3.1

### Patch Changes

- [`0cb5661`](https://github.com/openpatch/learningmap/commit/0cb56610bb09cf81884d8ec38eff9813066bcce4) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - use black text color in drawer

## 0.3.0

### Minor Changes

- [`f986065`](https://github.com/openpatch/learningmap/commit/f9860658e4817f018694895aa27dd199a3f26120) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Use sans-serif instead of an unreadable custom font

## 0.2.4

### Patch Changes

- [`4c3857c`](https://github.com/openpatch/learningmap/commit/4c3857c9674524c5b097ee0ecb5657210f9e5476) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Fix performance in vscode

## 0.2.3

### Patch Changes

- [`3927c35`](https://github.com/openpatch/learningmap/commit/3927c35749477c2e67be916b7beef473f1a59339) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Improve node dragging performance by throttling undo history updates

## 0.2.2

### Patch Changes

- [#45](https://github.com/openpatch/learningmap/pull/45) [`7f6a991`](https://github.com/openpatch/learningmap/commit/7f6a991066c84ddbd0f2c1088301a461cdb3c2d0) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Add browser-based image compression and 413 error handling
  - Compress uploaded images automatically using Canvas API (resize to max 1920x1920px, convert to JPEG at 0.85 quality)
  - Add support for JPG, PNG, WebP, and SVG file formats
  - Detect HTTP 413 (Payload Too Large) responses and show user-friendly error message
  - Add translations for file size error in English and German
  - Typical file size reduction: 70-90% for raster images

## 0.2.1

### Patch Changes

- [`474286f`](https://github.com/openpatch/learningmap/commit/474286ff474d305e692bfb4308599c57a37c029d) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Fix sharing link

## 0.2.0

### Minor Changes

- [`2f6c8b9`](https://github.com/openpatch/learningmap/commit/2f6c8b9b77bcdeddef9a66988c04f88b63df75f9) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Add new props and first release of vs code extension

## 0.1.0

### Minor Changes

- [`8011851`](https://github.com/openpatch/learningmap/commit/8011851793ebac305342a5d25254f62f7e85beb0) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Initial release

## 0.0.1

### Patch Changes

- [`4aa171e`](https://github.com/openpatch/learningmap/commit/4aa171e742b7d6bb88f21cac3121ec775206ec7f) Thanks [@mikebarkmin](https://github.com/mikebarkmin)! - Initial commit

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
