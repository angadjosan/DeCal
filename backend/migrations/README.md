# Migrations

Plain SQL, applied in filename order. There is no migration runner — paste each
file into the Supabase SQL editor (Dashboard → SQL Editor) and run it, oldest
first. Every file is idempotent, so re-running a file that already applied is
safe.

| File | What it does |
|---|---|
| `001_semester_sort_key.sql` | Adds `semesters.sort_key` so semesters sort chronologically instead of alphabetically, dedupes the table, and inserts **Fall 2026**. |
| `002_performance_indexes.sql` | Indexes for every filter the API issues, most importantly `course_sections.course_id` and `course_facilitators.course_id`. |

## Applying 001

`001` must be applied **before** deploying the backend changes that go with it —
`app.js` and `routes/routes.js` now order by `sort_key`, which does not exist
until the migration runs. Order of operations:

1. Run `001_semester_sort_key.sql` in the Supabase SQL editor.
2. Run `002_performance_indexes.sql`.
3. Merge to `main` (deploys backend + frontend via GitHub Actions).

Verify afterwards — the first row is what the submission form and the courses
dropdown default to, and it should now be Fall 2026:

```sql
select semester, sort_key from semesters order by sort_key desc;
```

```
 semester    | sort_key
-------------+----------
 Fall 2026   |    20262
 Spring 2026 |    20260
```

## Adding future semesters

The cron (`backend/cron/semesters.js`, scheduled by `backend/cron.yaml`) inserts
them automatically. To add one by hand, use the same `year * 10 + season`
convention as `AdminDashboard.tsx` — Spring = 0, Summer = 1, Fall = 2:

```sql
insert into semesters (semester, sort_key)
values ('Spring 2027', 20270)
on conflict (semester) do nothing;
```
