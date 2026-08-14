-- 002_performance_indexes.sql
--
-- Indexes covering every filter the API actually issues. Without these,
-- Postgres sequential-scans `courses` (223 rows and growing by ~200/semester)
-- and both child tables on every request.
--
-- The child-table indexes matter most: the /api/approvedCourses and
-- /api/unapprovedCourses handlers join course_sections and course_facilitators
-- by course_id on every load.

-- courseService.getAll('Active') -> .eq('status', ...)
create index if not exists idx_courses_status
  on courses (status);

-- /api/approvedCourses?semester=... -> .eq('status', ...).eq('semester', ...)
-- Composite covers the status-only query above as well, but the single-column
-- index is kept since `status` alone is the more common access path.
create index if not exists idx_courses_status_semester
  on courses (status, semester);

-- courseService.getAll() orders by created_at desc (admin dashboard).
create index if not exists idx_courses_created_at
  on courses (created_at desc);

-- /api/myCourses -> .eq('contact_email', userEmail)
create index if not exists idx_courses_contact_email
  on courses (contact_email);

-- Child lookups joined on every course list request.
create index if not exists idx_course_sections_course_id
  on course_sections (course_id);

create index if not exists idx_course_facilitators_course_id
  on course_facilitators (course_id);

-- crossValidateCourse() -> .eq('instructor_of_record_email', ...).eq('semester', ...)
-- NOTE: crossref_courses is currently empty (0 rows), so cross-validation
-- always returns match=false. The index is here for when the Fall 2026
-- crossref data is imported.
create index if not exists idx_crossref_courses_lookup
  on crossref_courses (instructor_of_record_email, semester);
