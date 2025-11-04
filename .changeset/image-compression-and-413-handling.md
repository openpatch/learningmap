---
"@learningmap/learningmap": patch
"@learningmap/web-component": patch
---

Add browser-based image compression and 413 error handling

- Compress uploaded images automatically using Canvas API (resize to max 1920x1920px, convert to JPEG at 0.85 quality)
- Add support for JPG, PNG, WebP, and SVG file formats
- Detect HTTP 413 (Payload Too Large) responses and show user-friendly error message
- Add translations for file size error in English and German
- Typical file size reduction: 70-90% for raster images
