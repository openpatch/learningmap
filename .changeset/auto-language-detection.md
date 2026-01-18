---
"@learningmap/learningmap": minor
---

Add "Auto" language detection and improve i18n system

- Add "Auto" option to language dropdown that automatically detects browser language
- Add `getLanguage()` and `getTranslations()` methods to editor store for easier access
- Change default language from "en" to "auto" for better user experience
- Improve language selection logic: settings.language → defaultLanguage → browser detection
- Simplify translation access throughout components via store methods
- Better support for international users with automatic language detection
