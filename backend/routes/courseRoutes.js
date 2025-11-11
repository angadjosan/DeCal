import express from 'express';
import { courseService, getCurrentSemester } from '../services/dbService.js';
import { crossValidateCourse } from '../services/dbService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const courseObj = req.body;

    if (!courseObj.title || !courseObj.faculty_sponsor_email) {
      return res.status(400).json({ 
        error: 'Missing required fields: title and faculty_sponsor_email are required' 
      });
    }

    if (!courseObj.semester) {
      courseObj.semester = getCurrentSemester();
    }

    const { data, error } = await courseService.create(courseObj);

    if (error) {
      console.error('Error creating course:', error);
      return res.status(500).json({ error: 'Failed to create course', details: error.message });
    }

    const validation = await crossValidateCourse(
      courseObj.faculty_sponsor_email,
      courseObj.semester
    );

    if (validation.success) {
      await courseService.update(data.id, {
        cross_reference_success: validation.match
      });
    }

    res.status(200).json({
      success: true,
      course: data,
      crossValidation: {
        match: validation.match,
        success: validation.success
      }
    });
  } catch (error) {
    console.error('Course submission error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;

