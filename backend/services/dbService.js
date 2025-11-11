import { supabase } from '../app.js';

export const getCurrentSemester = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  if (month >= 1 && month <= 5) {
    return `sp${year.toString().slice(-2)}`;
  } else {
    return `fa${year.toString().slice(-2)}`;
  }
};

export const getAvailableSemesters = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const semesters = [];
  
  const current = getCurrentSemester();
  semesters.push(current);
  
  if (month >= 1 && month <= 5) {
    semesters.push(`fa${year.toString().slice(-2)}`);
  } else {
    semesters.push(`sp${(year + 1).toString().slice(-2)}`);
  }
  
  return semesters;
};

export const courseService = {
  async create(courseData) {
    try {
      const semester = courseData.semester || getCurrentSemester();
      
      const { data, error } = await supabase
        .from('courses')
        .insert({
          ...courseData,
          semester,
          status: 'Pending'
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating course:', error);
      return { data: null, error };
    }
  },

  async getAll(status = null) {
    try {
      let query = supabase.from('courses').select('*');
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { data: null, error };
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching course:', error);
      return { data: null, error };
    }
  },

  async updateStatus(id, status) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating course status:', error);
      return { data: null, error };
    }
  },

  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating course:', error);
      return { data: null, error };
    }
  }
};

export const approvedCourseService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('approved_courses')
        .select('*');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching approved courses:', error);
      return { data: null, error };
    }
  },

  async findByInstructorEmail(email, semester) {
    try {
      const { data, error } = await supabase
        .from('approved_courses')
        .select('*')
        .eq('instructor_of_record_email', email)
        .eq('semester', semester);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error finding approved course:', error);
      return { data: null, error };
    }
  }
};

export const crossValidateCourse = async (facultySponsorEmail, semester) => {
  try {
    const { data: approvedCourses, error } = await approvedCourseService.findByInstructorEmail(
      facultySponsorEmail,
      semester
    );

    if (error) {
      return { success: false, error, match: null };
    }

    const match = approvedCourses && approvedCourses.length > 0 ? approvedCourses[0] : null;
    
    return {
      success: true,
      error: null,
      match: match !== null,
      approvedCourse: match
    };
  } catch (error) {
    console.error('Cross-validation error:', error);
    return { success: false, error, match: false };
  }
};

