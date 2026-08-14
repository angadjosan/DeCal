// Keeps the `semesters` table current.
//
// This used to be a standalone script that nothing ever invoked -- there was no
// cron.yaml and no scheduled workflow -- which is why the table still held a
// single "Spring 2026" row inserted in December 2025. It is now a pure function
// driven by App Engine cron via GET /api/tasks/ensureSemester (see cron.yaml).
//
// The old month logic (`month === 7` / `month === 12`) only fired in those two
// exact months and inserted `semester: ''` in every other month. This version:
//   - never writes a blank semester
//   - is idempotent, so a missed or repeated run is harmless
//   - self-heals, because each run re-asserts the semester that should exist by
//     now rather than only acting on one specific month

const SEASON_ORDER = { Spring: 0, Summer: 1, Fall: 2 };

// Sort key convention shared with AdminDashboard.tsx parseSemester():
// year * 10 + season. Fall 2026 -> 20262.
export function semesterSortKey(semester) {
  const [season, year] = semester.split(' ');
  const seasonValue = SEASON_ORDER[season];

  if (seasonValue === undefined || !/^\d{4}$/.test(year || '')) {
    throw new Error(`Cannot derive a sort_key from semester "${semester}"`);
  }

  return Number(year) * 10 + seasonValue;
}

// Which semester should exist by a given date.
//
// Submissions open a couple of months before the term, so Fall is added from
// July onward and Spring from December onward. January through June re-asserts
// the current Spring, which covers a missed December run.
export function semesterForDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 12) return `Spring ${year + 1}`;
  if (month >= 7) return `Fall ${year}`;
  return `Spring ${year}`;
}

export async function ensureCurrentSemester(supabase, now = new Date()) {
  const semester = semesterForDate(now);
  const sort_key = semesterSortKey(semester);

  // Relies on the unique index on semesters.semester.
  const { data, error } = await supabase
    .from('semesters')
    .upsert({ semester, sort_key }, { onConflict: 'semester', ignoreDuplicates: true })
    .select();

  if (error) {
    throw new Error(`Failed to upsert semester "${semester}": ${error.message}`);
  }

  const inserted = Array.isArray(data) && data.length > 0;
  console.log(
    inserted
      ? `Inserted semester "${semester}" (sort_key ${sort_key})`
      : `Semester "${semester}" already present, nothing to do`
  );

  return { semester, sort_key, inserted };
}
