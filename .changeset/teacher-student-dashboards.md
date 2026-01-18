---
"web": minor
---

Add role-based dashboards for teachers and students

- Add `/teach` route with teacher dashboard for managing created learning maps
- Add `/learn` route improvements with student-focused progress tracking
- Add TeacherEditor wrapper that automatically saves shared maps to teacher collection
- Add IndexedDB `teacherMaps` store for managing teacher's map collection
- Update landing page with clear role-based entry points ("I'm a Teacher" / "I'm a Student")
- Add consistent header navigation across all views with full-width layout
- Add clickable logo/title throughout app to return to homepage
- Teachers can now easily share maps with students via copy link functionality
- Students can track their progress across all their learning maps
