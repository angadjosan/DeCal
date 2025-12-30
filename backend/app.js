import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import routes from './routes/routes.js';
import { authMiddleware } from './middleware/auth.js';
import { courseService } from './services/dbService.js';

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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
// Rate limiter for private endpoints
const privateRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cache for approved courses
let approvedCoursesCache = {
  data: null,
  timestamp: null,
  ttl: 1 * 60 * 1000 // 1 minute in milliseconds
};

// Helper function to check if cache is valid
const isCacheValid = (cache) => {
  return cache.data !== null && cache.timestamp !== null && (Date.now() - cache.timestamp) < cache.ttl;
};

// Function to clear the approved courses cache (can be called when courses are updated)
export const clearApprovedCoursesCache = () => {
  approvedCoursesCache.data = null;
  approvedCoursesCache.timestamp = null;
};

app.get('/health', publicRateLimiter, (req, res) => {
  res.json({ status: 'ok', message: 'DeCal API is running' });
});

app.get('/api/semesters', publicRateLimiter, async (req, res) => {
  try {
      var semesters = await supabase.from('semesters').select('*').order('semester', { ascending: false });
      res.status(200).json({ success: true, semesters: semesters.data });
  } catch (error) {
    console.error('Error in semesters endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Public endpoint for approved courses
app.get('/api/approvedCourses', publicRateLimiter, async (req, res) => {
  try {
    // Check if cache is valid
    if (isCacheValid(approvedCoursesCache)) {
      return res.status(200).json({
        success: true,
        courses: approvedCoursesCache.data,
        cached: true
      });
    }

    // Cache miss or expired - fetch from database
    const { data: courses, error } = await courseService.getAll('Active');

    if (error) {
      console.error('Error fetching approved courses:', error);
      return res.status(500).json({ error: 'Failed to fetch courses', details: error.message });
    }

    const coursesWithDetails = await Promise.all(
      courses.map(async (course) => {
        // Fetch sections for this course
        const { data: sections } = await supabase
          .from('course_sections')
          .select('*')
          .eq('course_id', course.id);

        // Fetch facilitators for this course
        const { data: facilitators } = await supabase
          .from('course_facilitators')
          .select('*')
          .eq('course_id', course.id);

        return {
          ...course,
          sections: sections || [],
          facilitators: facilitators || []
        };
      })
    );

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
      sections: course.sections,
      facilitators: course.facilitators
    }));

    // Update cache
    approvedCoursesCache.data = sanitizedCourses;
    approvedCoursesCache.timestamp = Date.now();

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

    // Fetch course by ID
    const { data: course, error } = await courseService.getById(id);

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

    // Fetch sections for this course
    const { data: sections } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', course.id);

    // Fetch facilitators for this course
    const { data: facilitators } = await supabase
      .from('course_facilitators')
      .select('*')
      .eq('course_id', course.id);

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
      sections: sections || [],
      facilitators: facilitators || []
    };

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