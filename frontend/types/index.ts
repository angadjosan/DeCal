export interface CourseSection {
  id?: number;
  course_id?: number;
  section_type: string;
  enrollment_status: string;
  day: string;
  time: string;
  room: string;
  capacity?: number;
  start_date?: string;
  ccn_ld?: string;
  ccn_ud?: string;
  notes?: string;
}

export interface CourseFacilitator {
  id?: number;
  course_id?: number;
  name: string;
  email: string;
}

export interface Course {
  id: string;
  title: string;
  department: string;
  category: string;
  units: number;
  description: string;
  semester: string;
  contact_email: string;
  website?: string;
  faculty_sponsor_name: string;
  enrollment_information?: string;
  application_url?: string;
  application_due_date?: string;
  time_to_complete?: number;
  syllabus?: string;
  syllabus_url?: string;
  sections: CourseSection[];
  facilitators: CourseFacilitator[];
}

export interface CourseSubmission {
  id: string;
  title: string;
  department: string;
  semester: string;
  category: string;
  units: number;
  description: string;
  website?: string;
  enrollmentInfo?: string;
  facilitators: string[];
  facultySponsor: {
    name: string;
    email: string;
  };
  meetingTimes: Array<{
    days: string[];
    startTime: string;
    endTime: string;
  }>;
  location?: string;
  capacity: number;
  applicationUrl?: string;
  applicationDue?: string;
  applicationTime?: number;
  syllabus?: File;
  cpf?: File;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submittedDate: string;
  feedback?: string;
}

export type Category = 
  | 'Publication'
  | 'Health'
  | 'Environment'
  | 'Cultural'
  | 'Political/Social'
  | 'Media'
  | 'Professional/Business'
  | 'Food';

export type UserRole = 'student' | 'facilitator' | 'admin';
