import { Course, CourseSubmission } from '../types';

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to AI and Machine Learning',
    department: 'Computer Science',
    category: 'Science & Technology',
    units: 2,
    description: 'Explore the fundamentals of artificial intelligence and machine learning through hands-on projects and real-world applications. Students will learn about neural networks, deep learning, and practical AI implementation.',
    facilitators: ['Jane Doe', 'Alex Chen'],
    facultySponsor: 'Prof. Sarah Johnson',
    enrolled: 25,
    capacity: 30,
    status: 'Open',
    meetingTimes: 'Mon/Wed 6:00-8:00 PM',
    location: 'Soda Hall 310',
    semester: 'Fall 2025',
    website: 'https://example.com/ai-ml',
    applicationUrl: 'https://example.com/apply',
    applicationDue: 'Aug 30, 2025',
    applicationTime: 15,
    startDate: 'Aug 26, 2025',
    endDate: 'Dec 6, 2025'
  },
  {
    id: '2',
    title: 'Creative Writing Workshop',
    department: 'English',
    category: 'Arts & Creativity',
    units: 1,
    description: 'A collaborative space for aspiring writers to develop their craft. Students will workshop their creative pieces, explore different genres, and receive constructive feedback from peers.',
    facilitators: ['Emma Wilson'],
    facultySponsor: 'Prof. Michael Brown',
    enrolled: 18,
    capacity: 20,
    status: 'Open',
    meetingTimes: 'Thu 5:00-7:00 PM',
    location: 'Wheeler 204',
    semester: 'Fall 2025',
    startDate: 'Aug 26, 2025',
    endDate: 'Dec 6, 2025'
  },
  {
    id: '3',
    title: 'Cryptocurrency and Blockchain Fundamentals',
    department: 'Economics',
    category: 'Business & Entrepreneurship',
    units: 2,
    description: 'Dive into the world of cryptocurrency, blockchain technology, and decentralized finance. Learn about Bitcoin, Ethereum, smart contracts, and the future of digital currencies.',
    facilitators: ['David Lee', 'Sophie Martinez'],
    facultySponsor: 'Prof. Robert Taylor',
    enrolled: 30,
    capacity: 30,
    status: 'Waitlist',
    meetingTimes: 'Tue/Thu 7:00-8:30 PM',
    location: 'Haas F295',
    semester: 'Fall 2025',
    applicationUrl: 'https://example.com/apply',
    applicationDue: 'Aug 25, 2025',
    applicationTime: 20,
    startDate: 'Aug 26, 2025',
    endDate: 'Dec 6, 2025'
  },
  {
    id: '4',
    title: 'Mindfulness and Mental Wellness',
    department: 'Public Health',
    category: 'Health & Wellness',
    units: 1,
    description: 'Learn practical techniques for managing stress, improving focus, and cultivating mental wellness. This course combines mindfulness meditation, breathing exercises, and evidence-based wellness practices.',
    facilitators: ['Maya Patel'],
    facultySponsor: 'Prof. Lisa Anderson',
    enrolled: 22,
    capacity: 25,
    status: 'Open',
    meetingTimes: 'Wed 4:00-5:30 PM',
    location: 'RSF 120',
    semester: 'Fall 2025',
    startDate: 'Aug 26, 2025',
    endDate: 'Dec 6, 2025'
  },
  {
    id: '5',
    title: 'Social Justice and Community Action',
    department: 'Sociology',
    category: 'Social Impact',
    units: 2,
    description: 'Examine social justice issues and learn how to create meaningful change in communities. Students will engage with local organizations and develop action plans for social impact.',
    facilitators: ['Omar Hassan', 'Jessica Kim'],
    facultySponsor: 'Prof. Angela Davis',
    enrolled: 28,
    capacity: 35,
    status: 'Open',
    meetingTimes: 'Mon 6:00-8:00 PM',
    location: 'Dwinelle 155',
    semester: 'Fall 2025',
    applicationUrl: 'https://example.com/apply',
    applicationDue: 'Aug 28, 2025',
    applicationTime: 10,
    startDate: 'Aug 26, 2025',
    endDate: 'Dec 6, 2025'
  },
  {
    id: '6',
    title: 'Startup Fundamentals',
    department: 'Business',
    category: 'Business & Entrepreneurship',
    units: 2,
    description: 'Learn how to build a startup from the ground up. Topics include ideation, product development, fundraising, and scaling. Guest speakers from successful Bay Area startups.',
    facilitators: ['Ryan Chang'],
    facultySponsor: 'Prof. Mark Stevens',
    enrolled: 35,
    capacity: 35,
    status: 'Closed',
    meetingTimes: 'Tue 6:30-8:30 PM',
    location: 'Haas S199',
    semester: 'Fall 2025',
    startDate: 'Aug 26, 2025',
    endDate: 'Dec 6, 2025'
  },
  {
    id: '7',
    title: 'Digital Photography and Storytelling',
    department: 'Art Practice',
    category: 'Arts & Creativity',
    units: 1,
    description: 'Master the art of visual storytelling through photography. Learn composition, lighting, editing, and how to create compelling photo narratives.',
    facilitators: ['Lily Zhang'],
    facultySponsor: 'Prof. James Lee',
    enrolled: 15,
    capacity: 20,
    status: 'Open',
    meetingTimes: 'Fri 3:00-5:00 PM',
    location: 'Wurster 112',
    semester: 'Fall 2025',
    startDate: 'Aug 26, 2025',
    endDate: 'Dec 6, 2025'
  },
  {
    id: '8',
    title: 'Climate Action and Sustainability',
    department: 'Environmental Science',
    category: 'Social Impact',
    units: 2,
    description: 'Explore climate change solutions and sustainable practices. Students will work on real projects to reduce campus carbon footprint and promote environmental stewardship.',
    facilitators: ['Carlos Rodriguez', 'Nina Gupta'],
    facultySponsor: 'Prof. Emily Green',
    enrolled: 20,
    capacity: 30,
    status: 'Open',
    meetingTimes: 'Thu 6:00-8:00 PM',
    location: 'Valley LSB 2040',
    semester: 'Fall 2025',
    startDate: 'Aug 26, 2025',
    endDate: 'Dec 6, 2025'
  }
];

export const mockSubmissions: CourseSubmission[] = [
  {
    id: 's1',
    title: 'Introduction to Game Design',
    department: 'Computer Science',
    semester: 'Fall 2025',
    category: 'Science & Technology',
    units: 2,
    description: 'Learn the fundamentals of game design and development using Unity and Unreal Engine.',
    facilitators: ['student1@berkeley.edu', 'student2@berkeley.edu'],
    facultySponsor: {
      name: 'Prof. Game Developer',
      email: 'gamedev@berkeley.edu'
    },
    meetingTimes: [{
      days: ['Monday', 'Wednesday'],
      startTime: '18:00',
      endTime: '20:00'
    }],
    location: 'Soda Hall 405',
    capacity: 25,
    status: 'pending',
    submittedBy: 'student1@berkeley.edu',
    submittedDate: '2025-10-15'
  },
  {
    id: 's2',
    title: 'Poetry and Performance',
    department: 'English',
    semester: 'Fall 2025',
    category: 'Arts & Creativity',
    units: 1,
    description: 'Explore the intersection of poetry and performance art through workshops and public readings.',
    facilitators: ['poet@berkeley.edu'],
    facultySponsor: {
      name: 'Prof. Poetry Expert',
      email: 'poetry@berkeley.edu'
    },
    meetingTimes: [{
      days: ['Tuesday'],
      startTime: '17:00',
      endTime: '19:00'
    }],
    capacity: 20,
    status: 'approved',
    submittedBy: 'poet@berkeley.edu',
    submittedDate: '2025-10-10',
    feedback: 'Great course proposal! Approved for Fall 2025.'
  },
  {
    id: 's3',
    title: 'Intro to Day Trading',
    department: 'Economics',
    semester: 'Fall 2025',
    category: 'Business & Entrepreneurship',
    units: 2,
    description: 'Learn day trading strategies and technical analysis.',
    facilitators: ['trader@berkeley.edu'],
    facultySponsor: {
      name: 'Prof. Finance',
      email: 'finance@berkeley.edu'
    },
    meetingTimes: [{
      days: ['Thursday'],
      startTime: '19:00',
      endTime: '21:00'
    }],
    capacity: 30,
    status: 'rejected',
    submittedBy: 'trader@berkeley.edu',
    submittedDate: '2025-10-12',
    feedback: 'Course content involves excessive financial risk for students. Please revise to focus on investment theory rather than active trading.'
  }
];

export const departments = [
  'Computer Science',
  'English',
  'Economics',
  'Public Health',
  'Sociology',
  'Business',
  'Art Practice',
  'Environmental Science',
  'Psychology',
  'Political Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Philosophy'
];

export const semesters = [
  'Fall 2025',
  'Spring 2026',
  'Fall 2026',
  'Spring 2027'
];
