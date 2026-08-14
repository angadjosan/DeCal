import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import routes from './routes/routes.js';
import { authMiddleware } from './middleware/auth.js';
import { ensureCurrentSemester } from './cron/semesters.js';

dotenv.config();

// Secret Manager helper functions
const sm = new SecretManagerServiceClient();

async function accessSecret(projectId, name, version = 'latest') {
  const [res] = await sm.accessSecretVersion({
    name: `projects/${projectId}/secrets/${name}/versions/${version}`,
  });
  return res.payload.data.toString('utf8');
}

async function loadSecrets() {
  // Only load from Secret Manager in production
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  // On App Engine, these are available automatically:
  const projectId = process.env.GCP_PROJECT;

  if (!projectId) {
    console.warn('Warning: GCP_PROJECT not set, skipping Secret Manager loading');
    return;
  }

  // Load once at startup (cache in memory):
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.startsWith('${')) {
    process.env.SUPABASE_URL = await accessSecret(projectId, 'SUPABASE_URL');
  }
  if (
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('${')
  ) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = await accessSecret(
      projectId,
      'SUPABASE_SERVICE_ROLE_KEY'
    );
  }
}

// Load secrets before creating Supabase client
await loadSecrets();

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Rate limiter for public endpoints
const publicRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
// Rate limiter for private endpoints
const privateRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cache for approved courses, keyed by semester ('all' when unfiltered).
// The TTL is long because course data only changes when an admin approves,
// rejects, or edits a course -- and all three paths call
// clearApprovedCoursesCache() below, so staleness is bounded by the write, not
// by the TTL.
const APPROVED_COURSES_TTL = 10 * 60 * 1000; // 10 minutes
const approvedCoursesCache = new Map(); // key -> { data, timestamp }

const readCache = (key) => {
  const entry = approvedCoursesCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp >= APPROVED_COURSES_TTL) {
    approvedCoursesCache.delete(key);
    return null;
  }
  return entry.data;
};

// Function to clear the approved courses cache (called when courses are updated)
export const clearApprovedCoursesCache = () => {
  approvedCoursesCache.clear();
};

// Cache for the semesters list -- a handful of rows that change a few times a
// year, previously re-queried on every page load of the courses page.
const SEMESTERS_TTL = 10 * 60 * 1000;
let semestersCache = { data: null, timestamp: 0 };

export const clearSemestersCache = () => {
  semestersCache = { data: null, timestamp: 0 };
};

app.get('/health', publicRateLimiter, (req, res) => {
  res.json({ status: 'ok', message: 'DeCal API is running' });
});

app.get('/api/semesters', publicRateLimiter, async (req, res) => {
  try {
    if (semestersCache.data && (Date.now() - semestersCache.timestamp) < SEMESTERS_TTL) {
      res.set('Cache-Control', 'public, max-age=300');
      return res.status(200).json({ success: true, semesters: semestersCache.data, cached: true });
    }

    // Ordered by sort_key, NOT by the display string: ordering on `semester`
    // is lexicographic, which puts "Spring 2026" above "Fall 2026" and makes
    // the newest semester unreachable. sort_key is year * 10 + season
    // (Spring 0, Summer 1, Fall 2), so Fall 2026 is 20262.
    const { data, error } = await supabase
      .from('semesters')
      .select('*')
      .order('sort_key', { ascending: false });

    if (error) {
      console.error('Error fetching semesters:', error);
      return res.status(500).json({ error: 'Failed to fetch semesters', details: error.message });
    }

    semestersCache = { data, timestamp: Date.now() };

    res.set('Cache-Control', 'public, max-age=300');
    res.status(200).json({ success: true, semesters: data, cached: false });
  } catch (error) {
    console.error('Error in semesters endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Public endpoint for approved courses.
// Accepts an optional ?semester= filter so the courses page only downloads the
// semester it is displaying instead of every course ever approved.
app.get('/api/approvedCourses', publicRateLimiter, async (req, res) => {
  try {
    const semester = typeof req.query.semester === 'string' && req.query.semester.trim()
      ? req.query.semester.trim()
      : null;
    const cacheKey = semester || 'all';

    const cached = readCache(cacheKey);
    if (cached) {
      res.set('Cache-Control', 'public, max-age=300');
      return res.status(200).json({
        success: true,
        courses: cached,
        cached: true
      });
    }

    // Cache miss or expired - fetch from database.
    // Sections and facilitators are pulled in the same round trip via
    // PostgREST embedded resources. Fetching them per-course previously cost
    // 1 + 2N requests (335 for 167 active courses, ~3.0s); this is one request
    // (~0.45s).
    let query = supabase
      .from('courses')
      .select('*, course_sections(*), course_facilitators(*)')
      .eq('status', 'Active');

    if (semester) {
      query = query.eq('semester', semester);
    }

    const { data: courses, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching approved courses:', error);
      return res.status(500).json({ error: 'Failed to fetch courses', details: error.message });
    }

    const coursesWithDetails = courses.map(({ course_sections, course_facilitators, ...course }) => ({
      ...course,
      sections: course_sections || [],
      facilitators: course_facilitators || []
    }));

    const sanitizedCourses = coursesWithDetails.map(course => ({
      id: course.id,
      semester: course.semester,
      title: course.title,
      department: course.department,
      category: course.category,
      units: course.units,
      contact_email: course.contact_email,
      website: course.website,
      description: course.description,
      faculty_sponsor_name: course.faculty_sponsor_name,
      enrollment_information: course.enrollment_information,
      application_url: course.application_url,
      application_due_date: course.application_due_date,
      time_to_complete: course.time_to_complete,
      syllabus: course.syllabus,
      syllabus_url: course.syllabus_url,
      sections: course.sections,
      facilitators: course.facilitators
    }));

    // Update cache
    approvedCoursesCache.set(cacheKey, { data: sanitizedCourses, timestamp: Date.now() });

    res.set('Cache-Control', 'public, max-age=300');
    res.status(200).json({
      success: true,
      courses: sanitizedCourses,
      cached: false
    });
  } catch (error) {
    console.error('Error in approvedCourses endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Public endpoint for single course by ID
app.get('/api/courses/:id', publicRateLimiter, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid course ID format' });
    }

    // Fetch course, sections and facilitators in a single round trip.
    // maybeSingle() returns null rather than erroring when there is no match,
    // so a bad ID yields a 404 instead of a 500.
    const { data: course, error } = await supabase
      .from('courses')
      .select('*, course_sections(*), course_facilitators(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching course:', error);
      return res.status(500).json({ error: 'Failed to fetch course', details: error.message });
    }

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Only return Active courses
    if (course.status !== 'Active') {
      return res.status(404).json({ error: 'Course not found' });
    }

    const sections = course.course_sections;
    const facilitators = course.course_facilitators;

    // Sanitize response - only return public fields
    const sanitizedCourse = {
      id: course.id,
      semester: course.semester,
      title: course.title,
      department: course.department,
      category: course.category,
      units: course.units,
      contact_email: course.contact_email,
      website: course.website,
      description: course.description,
      faculty_sponsor_name: course.faculty_sponsor_name,
      enrollment_information: course.enrollment_information,
      application_url: course.application_url,
      application_due_date: course.application_due_date,
      time_to_complete: course.time_to_complete,
      syllabus: course.syllabus,
      syllabus_url: course.syllabus_url,
      sections: sections || [],
      facilitators: facilitators || []
    };

    res.set('Cache-Control', 'public, max-age=300');
    res.status(200).json({
      success: true,
      course: sanitizedCourse
    });
  } catch (error) {
    console.error('Error in course details endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Public endpoint for check if user is admin
app.get('/admin/check', publicRateLimiter, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ isAdmin: false });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return res.status(200).json({ isAdmin: false });
    }
    
    res.status(200).json({ isAdmin: profile.is_admin || false });
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(200).json({ isAdmin: false });
  }
});

// Public endpoint for downloading syllabus files (no auth required)
app.get('/api/downloadSyllabus/:courseId', publicRateLimiter, async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    // Get course data to retrieve syllabus URL
    const { data: course, error: fetchError } = await supabase
      .from('courses')
      .select('syllabus_url')
      .eq('id', courseId)
      .single();

    if (fetchError || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (!course.syllabus_url) {
      return res.status(404).json({ error: 'Syllabus file not found for this course' });
    }

    // Extract the file path from the syllabus URL
    // Syllabus URL format: https://{project}.supabase.co/storage/v1/object/public/decal-submissions/syllabus-files/{filename}
    const syllabusUrl = course.syllabus_url;
    const urlParts = syllabusUrl.split('/syllabus-files/');
    
    if (urlParts.length < 2) {
      return res.status(500).json({ error: 'Invalid syllabus URL format' });
    }

    const fileName = urlParts[1];
    const filePath = `syllabus-files/${fileName}`;

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('decal-submissions')
      .download(filePath);

    if (downloadError) {
      console.error('Syllabus file download error:', downloadError);
      return res.status(500).json({ 
        error: 'Failed to download syllabus file', 
        details: downloadError.message 
      });
    }

    // Convert blob to buffer
    const buffer = Buffer.from(await fileData.arrayBuffer());

    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', buffer.length);

    // Send the file
    res.send(buffer);

  } catch (error) {
    console.error('Error in downloadSyllabus endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Invoked by App Engine cron (see cron.yaml). Registered under /api so
// dispatch.yaml routes it to this service, and above the authMiddleware mount
// below so it is not treated as a user request.
//
// App Engine strips X-Appengine-Cron from inbound external requests, so its
// presence proves the call originated from the cron service.
app.get('/api/tasks/ensureSemester', publicRateLimiter, async (req, res) => {
  if (process.env.NODE_ENV === 'production' && req.get('X-Appengine-Cron') !== 'true') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const result = await ensureCurrentSemester(supabase);
    if (result.inserted) {
      clearSemestersCache();
    }
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Error ensuring current semester:', error);
    res.status(500).json({ error: 'Failed to ensure semester', details: error.message });
  }
});

app.use('/api', privateRateLimiter, authMiddleware, routes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;