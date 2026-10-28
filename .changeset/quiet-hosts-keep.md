---
"@learningmap/learningmap": patch
"@learningmap/web-component": patch
---

Respect `disableFileOperations` and `disablePersist` everywhere in the editor

- The welcome screen no longer offers to open a file when file operations are disabled, and no longer says the data is stored in the browser when persistence is disabled
- The save shortcut (Ctrl/⌘+S) no longer downloads a copy when file operations are disabled; the keystroke is left to the host page
- The editor web component accepts `disable-persist`
