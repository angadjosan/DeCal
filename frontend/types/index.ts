export interface Course {
  id: string;
  title: string;
  department: string;
  category: string;
  units: number;
  description: string;
  facilitators: string[];
  facultySponsor: string;
  enrolled: number;
  capacity: number;
  status: 'Open' | 'Waitlist' | 'Closed';
  meetingTimes: string;
  location: string;
  semester: string;
  website?: string;
  applicationUrl?: string;
  applicationDue?: string;
  applicationTime?: number;
  startDate?: string;
  endDate?: string;
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
  | 'Arts & Creativity'
  | 'Business & Entrepreneurship'
  | 'Health & Wellness'
  | 'Science & Technology'
  | 'Social Impact'
  | 'Other';

export type UserRole = 'student' | 'facilitator' | 'admin';
