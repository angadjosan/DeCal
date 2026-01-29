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

// Configure multer to accept multiple files
const uploadFields = upload.fields([
  { name: 'cpf_file', maxCount: 1 },
  { name: 'syllabus_file', maxCount: 1 }
]);

// Cache for unapproved courses
let unapprovedCoursesCache = {
  data: null,
  timestamp: null,
  ttl: 30 * 1000 // 30 seconds in milliseconds
};

// Helper function to check if cache is valid
const isCacheValid = (cache) => {
  return cache.data !== null && cache.timestamp !== null && (Date.now() - cache.timestamp) < cache.ttl;
};

// Function to clear the unapproved courses cache
export const clearUnapprovedCoursesCache = () => {
  unapprovedCoursesCache.data = null;
  unapprovedCoursesCache.timestamp = null;
};

// Helper function to get current semester
async function getCurrentSemester() {
  try {
      var semesters = await supabase.from('semesters').select('*').order('semester', { ascending: false });
      if (semesters.data && semesters.data.length > 0) {
        return semesters.data[0].semester;
      } else {
        throw new Error('No semesters found');
      }
  } catch (error) {
    console.error('Error in semesters endpoint:', error);
    throw error; // Re-throw so caller can handle it
  }
}

// Get user profile (including admin status)
router.get('/profile', async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
    }

    res.status(200).json({
      success: true,
      profile: {
        id: req.user.id,
        email: req.user.email,
        is_admin: profile?.is_admin || false
      }
    });
  } catch (error) {
    console.error('Error in profile endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.post('/submitCourse', uploadFields, async (req, res) => {
  try {
    // Parse the JSON data from the form
    const courseData = JSON.parse(req.body.data);
    const cpfFile = req.files?.cpf_file?.[0];
    const syllabusFile = req.files?.syllabus_file?.[0];

    if (!cpfFile) {
      return res.status(400).json({ 
        error: 'CPF file is required' 
      });
    }

    if (!syllabusFile) {
      return res.status(400).json({ 
        error: 'Syllabus file is required' 
      });
    }

    if (!courseData.title || !courseData.faculty_sponsor_email) {
      return res.status(400).json({ 
        error: 'Missing required fields: title and faculty_sponsor_email are required' 
      });
    }

    if (!courseData.semester) {
      courseData.semester = await getCurrentSemester();
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

    // Upload syllabus file to Supabase Storage
    const syllabusTimestamp = Date.now();
    const syllabusSanitizedTitle = courseData.title
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()
      .substring(0, 50);
    const syllabusFileName = `${syllabusTimestamp}_${syllabusSanitizedTitle}_syllabus.pdf`;
    const syllabusFilePath = `syllabus-files/${syllabusFileName}`;

    const { data: syllabusUploadData, error: syllabusUploadError } = await supabase.storage
      .from('decal-submissions')
      .upload(syllabusFilePath, syllabusFile.buffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false
      });

    if (syllabusUploadError) {
      // If syllabus upload fails, delete the CPF file
      await supabase.storage
        .from('decal-submissions')
        .remove([filePath]);
      
      console.error('Syllabus file upload error:', syllabusUploadError);
      return res.status(500).json({ 
        error: 'Failed to upload Syllabus file', 
        details: syllabusUploadError.message 
      });
    }

    // Get public URL for the syllabus file
    const { data: syllabusUrlData } = supabase.storage
      .from('decal-submissions')
      .getPublicUrl(syllabusFilePath);

    // Extract sections and facilitators before creating course
    const { sections, facilitators, facilitatorEmails, ...coreFields } = courseData;

    // Add file URLs to course data
    const courseObj = {
      ...coreFields,
      cpf: urlData.publicUrl,
      syllabus_url: syllabusUrlData.publicUrl
    };

    // Create course in database
    const { data, error } = await courseService.create(courseObj);

    if (error) {
      // If database insert fails, delete the uploaded files
      await supabase.storage
        .from('decal-submissions')
        .remove([filePath, syllabusFilePath]);
      
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
        section_type: section.section_type || 'Lecture',
        enrollment_status: section.enrollment_status,
        day: section.day,
        time: section.time,
        room: section.room,
        capacity: section.capacity || null,
        start_date: section.start_date || null,
        ccn_ld: section.ccn_ld || null,
        ccn_ud: section.ccn_ud || null,
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
    // Check if cache is valid
    if (isCacheValid(unapprovedCoursesCache)) {
      return res.status(200).json({
        success: true,
        courses: unapprovedCoursesCache.data,
        cached: true
      });
    }

    // Cache miss or expired - fetch from database (fetch all courses for admin dashboard)
    const { data: courses, error } = await courseService.getAll();

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
          facilitators: facilitators || [],
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
      syllabus_url: course.syllabus_url,
      sections: course.sections,
      facilitators: course.facilitators,
      created_at: course.created_at
    }));

    // Update cache
    unapprovedCoursesCache.data = sanitizedCourses;
    unapprovedCoursesCache.timestamp = Date.now();

    res.status(200).json({
      success: true,
      courses: sanitizedCourses,
      cached: false
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

    // Clear caches since data has changed
    clearUnapprovedCoursesCache();

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

    // Clear caches since data has changed
    clearUnapprovedCoursesCache();

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

// Download CPF file by course ID (admin only)
router.get('/downloadCPF/:courseId', adminMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    // Get course data to retrieve CPF URL
    const { data: course, error: fetchError } = await courseService.getById(courseId);

    if (fetchError || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (!course.cpf) {
      return res.status(404).json({ error: 'CPF file not found for this course' });
    }

    // Extract the file path from the CPF URL
    // CPF URL format: https://{project}.supabase.co/storage/v1/object/public/decal-submissions/cpf-forms/{filename}
    const cpfUrl = course.cpf;
    const urlParts = cpfUrl.split('/cpf-forms/');
    
    if (urlParts.length < 2) {
      return res.status(500).json({ error: 'Invalid CPF URL format' });
    }

    const fileName = urlParts[1];
    const filePath = `cpf-forms/${fileName}`;

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('decal-submissions')
      .download(filePath);

    if (downloadError) {
      console.error('File download error:', downloadError);
      return res.status(500).json({ 
        error: 'Failed to download CPF file', 
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
    console.error('Error in downloadCPF endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Helper function to check if user can edit course (owner or admin)
async function canEditCourse(user, course) {
  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  
  if (profile?.is_admin) {
    return true;
  }
  
  // Check if user's email matches course contact_email
  return user.email?.toLowerCase() === course.contact_email?.toLowerCase();
}

// Update course endpoint (owner or admin only)
router.put('/updateCourse/:id', uploadFields, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    // Fetch the course to check permissions
    const { data: course, error: fetchError } = await courseService.getById(id);

    if (fetchError || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user can edit this course
    const hasPermission = await canEditCourse(req.user, course);
    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to edit this course' });
    }

    // Parse the JSON data from the form
    const courseData = JSON.parse(req.body.data);
    const cpfFile = req.files?.cpf_file?.[0];
    const syllabusFile = req.files?.syllabus_file?.[0];

    // Extract sections and facilitators before updating course
    const { sections, facilitators, facilitatorEmails, ...coreFields } = courseData;

    // Handle file uploads if provided (optional - keep existing if not provided)
    let cpfUrl = course.cpf;
    let syllabusUrl = course.syllabus_url;

    if (cpfFile) {
      // Delete old CPF file if exists
      if (course.cpf) {
        const oldCpfUrl = course.cpf;
        const urlParts = oldCpfUrl.split('/cpf-forms/');
        if (urlParts.length >= 2) {
          const oldFilePath = `cpf-forms/${urlParts[1]}`;
          await supabase.storage.from('decal-submissions').remove([oldFilePath]);
        }
      }

      // Upload new CPF file
      const timestamp = Date.now();
      const sanitizedTitle = (courseData.title || course.title)
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .substring(0, 50);
      const fileName = `${timestamp}_${sanitizedTitle}.pdf`;
      const filePath = `cpf-forms/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('decal-submissions')
        .upload(filePath, cpfFile.buffer, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('CPF file upload error:', uploadError);
        return res.status(500).json({ 
          error: 'Failed to upload CPF file', 
          details: uploadError.message 
        });
      }

      const { data: urlData } = supabase.storage
        .from('decal-submissions')
        .getPublicUrl(filePath);
      cpfUrl = urlData.publicUrl;
    }

    if (syllabusFile) {
      // Delete old syllabus file if exists
      if (course.syllabus_url) {
        const oldSyllabusUrl = course.syllabus_url;
        const urlParts = oldSyllabusUrl.split('/syllabus-files/');
        if (urlParts.length >= 2) {
          const oldFilePath = `syllabus-files/${urlParts[1]}`;
          await supabase.storage.from('decal-submissions').remove([oldFilePath]);
        }
      }

      // Upload new syllabus file
      const timestamp = Date.now();
      const sanitizedTitle = (courseData.title || course.title)
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .substring(0, 50);
      const fileName = `${timestamp}_${sanitizedTitle}_syllabus.pdf`;
      const filePath = `syllabus-files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('decal-submissions')
        .upload(filePath, syllabusFile.buffer, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Syllabus file upload error:', uploadError);
        return res.status(500).json({ 
          error: 'Failed to upload Syllabus file', 
          details: uploadError.message 
        });
      }

      const { data: urlData } = supabase.storage
        .from('decal-submissions')
        .getPublicUrl(filePath);
      syllabusUrl = urlData.publicUrl;
    }

    // Prepare update data
    const updateData = {
      ...coreFields,
      cpf: cpfUrl,
      syllabus_url: syllabusUrl
    };

    // Remove undefined/null values to avoid overwriting with null
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    // Update course in database
    const { data: updatedCourse, error: updateError } = await courseService.update(id, updateData);

    if (updateError) {
      console.error('Error updating course:', updateError);
      return res.status(500).json({ 
        error: 'Failed to update course', 
        details: updateError.message 
      });
    }

    // Update sections: delete old ones and insert new ones
    if (sections !== undefined) {
      // Delete existing sections
      const { error: deleteSectionsError } = await supabase
        .from('course_sections')
        .delete()
        .eq('course_id', id);

      if (deleteSectionsError) {
        console.error('Error deleting sections:', deleteSectionsError);
      }

      // Insert new sections if provided
      if (sections && sections.length > 0) {
        const sectionsToInsert = sections.map(section => ({
          course_id: id,
          section_type: section.section_type || 'Lecture',
          enrollment_status: section.enrollment_status,
          day: section.day,
          time: section.time,
          room: section.room,
          capacity: section.capacity || null,
          start_date: section.start_date || null,
          ccn_ld: section.ccn_ld || null,
          ccn_ud: section.ccn_ud || null,
          notes: section.notes || null
        }));

        const { error: sectionsError } = await supabase
          .from('course_sections')
          .insert(sectionsToInsert);

        if (sectionsError) {
          console.error('Error inserting sections:', sectionsError);
        }
      }
    }

    // Update facilitators: delete old ones and insert new ones
    if (facilitators !== undefined) {
      // Delete existing facilitators
      const { error: deleteFacilitatorsError } = await supabase
        .from('course_facilitators')
        .delete()
        .eq('course_id', id);

      if (deleteFacilitatorsError) {
        console.error('Error deleting facilitators:', deleteFacilitatorsError);
      }

      // Insert new facilitators if provided
      if (facilitators && facilitators.length > 0) {
        const facilitatorsToInsert = facilitators.map(facilitator => ({
          course_id: id,
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
    }

    // Clear caches since data has changed
    clearUnapprovedCoursesCache();

    // Perform cross-validation if faculty sponsor email changed
    if (updateData.faculty_sponsor_email) {
      const validation = await crossValidateCourse(
        updateData.faculty_sponsor_email,
        updatedCourse.semester || course.semester
      );

      if (validation.success) {
        await courseService.update(id, {
          cross_reference_success: validation.match
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Course update error:', error);
    
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

// Get course for editing (owner or admin only)
router.get('/courseForEdit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    // Fetch the course
    const { data: course, error: fetchError } = await courseService.getById(id);

    if (fetchError || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user can edit this course
    const hasPermission = await canEditCourse(req.user, course);
    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to edit this course' });
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

    res.status(200).json({
      success: true,
      course: {
        ...course,
        sections: sections || [],
        facilitators: facilitators || []
      }
    });
  } catch (error) {
    console.error('Error fetching course for edit:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get courses by owner (user's courses)
router.get('/myCourses', async (req, res) => {
  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email not found' });
    }

    // Fetch all courses where contact_email matches user's email
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .eq('contact_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user courses:', error);
      return res.status(500).json({ error: 'Failed to fetch courses', details: error.message });
    }

    // Sanitize response - only return necessary fields
    const sanitizedCourses = (courses || []).map(course => ({
      id: course.id,
      semester: course.semester,
      status: course.status,
      title: course.title,
      department: course.department,
      category: course.category,
      units: course.units,
      contact_email: course.contact_email,
      created_at: course.created_at
    }));

    res.status(200).json({
      success: true,
      courses: sanitizedCourses
    });
  } catch (error) {
    console.error('Error in myCourses endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;