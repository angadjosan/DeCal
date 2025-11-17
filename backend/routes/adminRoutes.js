import express from 'express';
import { adminMiddleware } from '../middleware/auth.js';
import { courseService, approvedCourseService, crossValidateCourse } from '../services/dbService.js';
import { sendApprovalEmail, sendRejectionEmail } from '../services/emailService.js';

const router = express.Router();

router.post('/courses', async (req, res) => {
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

    // upload to database

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

router.get('/unapprovedCourses', adminMiddleware, async (req, res) => {
  try {
    const { data: courses, error } = await courseService.getAll('Pending');

    if (error) {
      console.error('Error fetching unapproved courses:', error);
      return res.status(500).json({ error: 'Failed to fetch courses', details: error.message });
    }

    const coursesWithValidation = await Promise.all(
      courses.map(async (course) => {
        const validation = await crossValidateCourse(
          course.faculty_sponsor_email,
          course.semester
        );

        let approvedCourseMatch = null;
        if (validation.match && validation.approvedCourse) {
          approvedCourseMatch = validation.approvedCourse;
        }

        return {
          ...course,
          crossValidation: {
            match: validation.match,
            approvedCourse: approvedCourseMatch
          }
        };
      })
    );

    const sanitizedCourses = coursesWithValidation.map(course => ({
      id: course.id,
      semester: course.semester,
      status: course.status,
      title: course.title,
      department: course.department,
      category: course.category,
      units: course.units,
      contact_email: course.contact_email,
      website: course.website,
      description: course.description,
      faculty_sponsor_name: course.faculty_sponsor_name,
      faculty_sponsor_email: course.faculty_sponsor_email,
      enrollment_information: course.enrollment_information,
      application_url: course.application_url,
      application_due_date: course.application_due_date,
      time_to_complete: course.time_to_complete,
      cross_reference_success: course.cross_reference_success,
      crossValidation: course.crossValidation,
      cpf: course.cpf,
      syllabus: course.syllabus,
      created_at: course.created_at
    }));

    res.status(200).json({
      success: true,
      courses: sanitizedCourses
    });
  } catch (error) {
    console.error('Error in unapprovedCourses endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.post('/approveCourse', adminMiddleware, async (req, res) => {
  try {
    const { id, facilitatorEmails } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    const { data: course, error: fetchError } = await courseService.getById(id);

    if (fetchError || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.status !== 'Pending') {
      return res.status(400).json({ error: 'Course is not in pending status' });
    }

    const { data: updatedCourse, error } = await courseService.updateStatus(id, 'Active');

    if (error) {
      console.error('Error approving course:', error);
      return res.status(500).json({ error: 'Failed to approve course', details: error.message });
    }

    const emails = facilitatorEmails || [course.contact_email];
    if (emails && emails.length > 0) {
      const emailResult = await sendApprovalEmail(emails, course.title);
      if (!emailResult.success) {
        console.error('Failed to send approval email:', emailResult.error);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Course approved successfully',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Error in approveCourse endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.post('/rejectCourse', adminMiddleware, async (req, res) => {
  try {
    const { id, feedback, facilitatorEmails } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    const { data: course, error: fetchError } = await courseService.getById(id);

    if (fetchError || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.status !== 'Pending') {
      return res.status(400).json({ error: 'Course is not in pending status' });
    }

    const { data: updatedCourse, error } = await courseService.updateStatus(id, 'Rejected');

    if (error) {
      console.error('Error rejecting course:', error);
      return res.status(500).json({ error: 'Failed to reject course', details: error.message });
    }

    const emails = facilitatorEmails || [course.contact_email];
    if (emails && emails.length > 0) {
      const emailResult = await sendRejectionEmail(emails, course.title, feedback);
      if (!emailResult.success) {
        console.error('Failed to send rejection email:', emailResult.error);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Course rejected successfully',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Error in rejectCourse endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.get('/approvedCourses', async (req, res) => {
  try {
    const { data: courses, error } = await courseService.getAll('Active');

    if (error) {
      console.error('Error fetching approved courses:', error);
      return res.status(500).json({ error: 'Failed to fetch courses', details: error.message });
    }

    const sanitizedCourses = courses.map(course => ({
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
      time_to_complete: course.time_to_complete
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

export default router;