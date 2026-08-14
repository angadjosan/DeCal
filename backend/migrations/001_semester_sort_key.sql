-- 001_semester_sort_key.sql
--
-- Problem: both /api/semesters (app.js) and getCurrentSemester() (routes.js)
-- picked the "current" semester with `.order('semester', { ascending: false })`.
-- That is a lexicographic sort on the display string, so "Spring 2026" always
-- sorts above "Fall 2026" ('S' > 'F'). Inserting Fall 2026 alone would leave
-- Spring 2026 as the default in the submission form and the courses dropdown,
-- and every new Fall submission would be filed under Spring 2026.
--
-- Fix: sort on an explicit integer key instead of the display string.
-- Convention matches AdminDashboard.tsx parseSemester(): year * 10 + season,
-- with Spring = 0, Summer = 1, Fall = 2.  Fall 2026 -> 20262.

-- The old cron inserted `semester: ''` whenever it ran outside July/December.
-- Clear any such rows before adding constraints.
delete from semesters
where semester is null or btrim(semester) = '';

alter table semesters
  add column if not exists sort_key integer;

-- Backfill from the existing display strings.
update semesters
set sort_key = (split_part(semester, ' ', 2))::integer * 10
  + case split_part(semester, ' ', 1)
      when 'Spring' then 0
      when 'Summer' then 1
      when 'Fall'   then 2
    end
where sort_key is null
  and semester ~ '^(Spring|Summer|Fall) [0-9]{4}$';

-- Guard: refuse to continue if anything failed to parse, rather than leaving
-- unsortable rows behind.
do $$
declare unparsed integer;
begin
  select count(*) into unparsed from semesters where sort_key is null;
  if unparsed > 0 then
    raise exception '% semester row(s) could not be parsed into a sort_key; fix them before re-running', unparsed;
  end if;
end $$;

alter table semesters
  alter column sort_key set not null;

-- Lets the cron (and this file) re-run without creating duplicates.
create unique index if not exists semesters_semester_key on semesters (semester);
create index if not exists idx_semesters_sort_key on semesters (sort_key desc);

-- Add Fall 2026.
insert into semesters (semester, sort_key)
values ('Fall 2026', 20262)
on conflict (semester) do nothing;
