import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import routes from './routes/routes.js';
import { authMiddleware } from './middleware/auth.js';
import { courseService } from './services/dbService.js';

dotenv.config();

const app = express();
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
// Rate limiter for public endpoints
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

app.get('/health', publicRateLimiter, (req, res) => {
  res.json({ status: 'ok', message: 'DeCal API is running' });
});

// Public endpoint for approved courses
app.get('/api/approvedCourses', publicRateLimiter, async (req, res) => {
  try {
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
      sections: course.sections,
      facilitators: course.facilitators
    }));

    res.status(200).json({
      success: true,
      courses: sanitizedCourses
    });
  } catch (error) {
    console.error('Error in approvedCourses endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Public endpoint for check if user is admin
router.get('/admin/check', async (req, res) => {
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

app.use('/api', privateRateLimiter, routes);

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