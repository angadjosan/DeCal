import express from 'express';
import multer from 'multer';
import { adminMiddleware, authMiddleware } from '../middleware/auth.js';
import { courseService, approvedCourseService, crossValidateCourse } from '../services/dbService.js';
import { sendApprovalEmail, sendRejectionEmail } from '../services/emailService.js';
import { supabase } from '../app.js';

const router = express.Router();

// Configure multer for file upload handling (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Helper function to get current semester
function getCurrentSemester() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  
  if (month >= 8) {
    return `Fall ${year}`;
  } else if (month >= 1 && month <= 5) {
    return `Spring ${year}`;
  } else {
    return `Summer ${year}`;
  }
}

router.post('/submitCourse', authMiddleware, upload.single('cpf_file'), async (req, res) => {
  try {
    // Parse the JSON data from the form
    const courseData = JSON.parse(req.body.data);
    const cpfFile = req.file;

    if (!cpfFile) {
      return res.status(400).json({ 
        error: 'CPF file is required' 
      });
    }

    if (!courseData.title || !courseData.faculty_sponsor_email) {
      return res.status(400).json({ 
        error: 'Missing required fields: title and faculty_sponsor_email are required' 
      });
    }

    if (!courseData.semester) {
      courseData.semester = getCurrentSemester();
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedTitle = courseData.title
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .substring(0, 50); // Limit length
    const fileName = `${timestamp}_${sanitizedTitle}.pdf`;
    const filePath = `cpf-forms/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('decal-submissions')
      .upload(filePath, cpfFile.buffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return res.status(500).json({ 
        error: 'Failed to upload CPF file', 
        details: uploadError.message 
      });
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('decal-submissions')
      .getPublicUrl(filePath);

    // Extract sections and facilitators before creating course
    const { sections, facilitators, facilitatorEmails, ...coreFields } = courseData;

    // Add file URL to course data
    const courseObj = {
      ...coreFields,
      cpf: urlData.publicUrl
    };

    // Create course in database
    const { data, error } = await courseService.create(courseObj);

    if (error) {
      // If database insert fails, delete the uploaded file
      await supabase.storage
        .from('decal-submissions')
        .remove([filePath]);
      
      console.error('Error creating course:', error);
      return res.status(500).json({ 
        error: 'Failed to create course', 
        details: error.message 
      });
    }

    // Insert sections if provided
    if (sections && sections.length > 0) {
      const sectionsToInsert = sections.map(section => ({
        course_id: data.id,
        enrollment_status: section.enrollment_status,
        day: section.day,
        time: section.time,
        room: section.room,
        notes: section.notes || null
      }));

      const { error: sectionsError } = await supabase
        .from('course_sections')
        .insert(sectionsToInsert);

      if (sectionsError) {
        console.error('Error inserting sections:', sectionsError);
      }
    }

    // Insert facilitators if provided
    if (facilitators && facilitators.length > 0) {
      const facilitatorsToInsert = facilitators.map(facilitator => ({
        course_id: data.id,
        name: facilitator.name,
        email: facilitator.email
      }));

      const { error: facilitatorsError } = await supabase
        .from('course_facilitators')
        .insert(facilitatorsToInsert);

      if (facilitatorsError) {
        console.error('Error inserting facilitators:', facilitatorsError);
      }
    }

    // Perform cross-validation
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
    
    // Handle multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 50MB limit' });
    }
    
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
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