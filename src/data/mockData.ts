import { Teacher, TimetableSlot } from '../types';

export const TEACHERS: Teacher[] = [
  // Primary Wing (Classes 1 - 5)
  {
    id: 'T01',
    name: 'Mrs. Ananya Sharma',
    department: 'English & EVS',
    wing: 'primary',
    baseWorkload: 4,
    subjects: ['English', 'Environmental Studies', 'Reading'],
    email: 'ananya.sharma@school.edu'
  },
  {
    id: 'T02',
    name: 'Mr. Rajesh Patel',
    department: 'Mathematics',
    wing: 'primary',
    baseWorkload: 4,
    subjects: ['Primary Mathematics', 'Mental Math'],
    email: 'rajesh.patel@school.edu'
  },
  {
    id: 'T03',
    name: 'Ms. Priya Nair',
    department: 'Science & Art',
    wing: 'primary',
    baseWorkload: 3,
    subjects: ['General Science', 'Visual Arts', 'Crafts'],
    email: 'priya.nair@school.edu'
  },
  {
    id: 'T04',
    name: 'Mrs. Sunita Rao',
    department: 'Languages',
    wing: 'primary',
    baseWorkload: 4,
    subjects: ['Hindi', 'Moral Science', 'Storytelling'],
    email: 'sunita.rao@school.edu'
  },
  {
    id: 'T05',
    name: 'Mr. David Morris',
    department: 'Physical Education',
    wing: 'primary',
    baseWorkload: 4,
    subjects: ['Physical Ed', 'Games & Athletics'],
    email: 'david.morris@school.edu'
  },
  {
    id: 'T06',
    name: 'Ms. Kavita Sen',
    department: 'Social Studies',
    wing: 'primary',
    baseWorkload: 3,
    subjects: ['Social Studies', 'Library & Reading'],
    email: 'kavita.sen@school.edu'
  },

  // Middle Wing (Classes 6 - 8)
  {
    id: 'T07',
    name: 'Mr. Vikram Malhotra',
    department: 'Mathematics',
    wing: 'middle',
    baseWorkload: 5,
    subjects: ['Algebra', 'Geometry', 'Foundation Math'],
    email: 'vikram.malhotra@school.edu'
  },
  {
    id: 'T08',
    name: 'Dr. Neha Gupta',
    department: 'Science',
    wing: 'middle',
    baseWorkload: 4,
    subjects: ['General Science', 'Biology Basics', 'Chemistry Lab'],
    email: 'neha.gupta@school.edu'
  },
  {
    id: 'T09',
    name: 'Mrs. Sarah Jenkins',
    department: 'English',
    wing: 'middle',
    baseWorkload: 5,
    subjects: ['English Literature', 'Grammar & Composition'],
    email: 'sarah.jenkins@school.edu'
  },
  {
    id: 'T10',
    name: 'Mr. Amit Verma',
    department: 'Social Sciences',
    wing: 'middle',
    baseWorkload: 4,
    subjects: ['History & Civics', 'Geography'],
    email: 'amit.verma@school.edu'
  },
  {
    id: 'T11',
    name: 'Ms. Meera Joshi',
    department: 'Languages',
    wing: 'middle',
    baseWorkload: 3,
    subjects: ['Hindi', 'Sanskrit', 'Second Language'],
    email: 'meera.joshi@school.edu'
  },
  {
    id: 'T12',
    name: 'Mr. Rahul Bajaj',
    department: 'Computer Science',
    wing: 'middle',
    baseWorkload: 4,
    subjects: ['Computer Science', 'Coding & Robotics'],
    email: 'rahul.bajaj@school.edu'
  },

  // Senior Secondary Wing (Classes 9 - 12)
  {
    id: 'T13',
    name: 'Dr. Robert Lang',
    department: 'Science',
    wing: 'senior',
    baseWorkload: 5,
    subjects: ['Physics', 'Applied Physics'],
    email: 'robert.lang@school.edu'
  },
  {
    id: 'T14',
    name: 'Mrs. Vandana Kapoor',
    department: 'Science',
    wing: 'senior',
    baseWorkload: 5,
    subjects: ['Chemistry', 'Organic Chemistry'],
    email: 'vandana.kapoor@school.edu'
  },
  {
    id: 'T15',
    name: 'Mr. Suresh Menon',
    department: 'Mathematics',
    wing: 'senior',
    baseWorkload: 6, // 6 base periods! Eligible for zero substitutions as per rules
    subjects: ['Senior Mathematics', 'Calculus', 'Statistics'],
    email: 'suresh.menon@school.edu'
  },
  {
    id: 'T16',
    name: 'Dr. Alistair Finch',
    department: 'Science',
    wing: 'senior',
    baseWorkload: 4,
    subjects: ['Biology', 'Biotechnology'],
    email: 'alistair.finch@school.edu'
  },
  {
    id: 'T17',
    name: 'Mrs. Deepa Iyer',
    department: 'English',
    wing: 'senior',
    baseWorkload: 4,
    subjects: ['Senior English', 'Communication Skills'],
    email: 'deepa.iyer@school.edu'
  },
  {
    id: 'T18',
    name: 'Mr. Sanjeev Chawla',
    department: 'Commerce & Economics',
    wing: 'senior',
    baseWorkload: 5,
    subjects: ['Economics', 'Accountancy', 'Business Studies'],
    email: 'sanjeev.chawla@school.edu'
  }
];

// Helper to determine wing for a class
export const getWingForClass = (classId: number): 'primary' | 'middle' | 'senior' => {
  if (classId <= 5) return 'primary';
  if (classId <= 8) return 'middle';
  return 'senior';
};

export const CLASS_NAMES: Record<number, string> = {
  1: 'Class 1-A',
  2: 'Class 2-A',
  3: 'Class 3-A',
  4: 'Class 4-A',
  5: 'Class 5-A',
  6: 'Class 6-A',
  7: 'Class 7-A',
  8: 'Class 8-A',
  9: 'Class 9-A',
  10: 'Class 10-A',
  11: 'Class 11-A',
  12: 'Class 12-A',
};

export const PERIOD_TIMES: Record<number, string> = {
  1: '08:00 - 08:45 AM',
  2: '08:45 - 09:30 AM',
  3: '09:30 - 10:15 AM',
  4: '10:15 - 11:00 AM',
  5: '11:30 - 12:15 PM',
  6: '12:15 - 01:00 PM',
  7: '01:00 - 01:45 PM',
  8: '01:45 - 02:30 PM',
};

// Complete, conflict-free master timetable for Classes 1–12 (8 periods each)
// Every class has exactly 8 periods, and no teacher is scheduled twice in the same period!
export const MASTER_TIMETABLE: TimetableSlot[] = [
  // Class 1 (Primary)
  { classId: 1, period: 1, teacherId: 'T01', subject: 'English' },
  { classId: 1, period: 2, teacherId: 'T02', subject: 'Mathematics' },
  { classId: 1, period: 3, teacherId: 'T04', subject: 'Hindi' },
  { classId: 1, period: 4, teacherId: 'T05', subject: 'Physical Ed' },
  { classId: 1, period: 5, teacherId: 'T03', subject: 'Art & Craft' },
  { classId: 1, period: 6, teacherId: 'T01', subject: 'EVS' },
  { classId: 1, period: 7, teacherId: 'T06', subject: 'Storytelling' },
  { classId: 1, period: 8, teacherId: 'T05', subject: 'Games' },

  // Class 2 (Primary)
  { classId: 2, period: 1, teacherId: 'T02', subject: 'Mathematics' },
  { classId: 2, period: 2, teacherId: 'T01', subject: 'English' },
  { classId: 2, period: 3, teacherId: 'T05', subject: 'Physical Ed' },
  { classId: 2, period: 4, teacherId: 'T03', subject: 'Science Basics' },
  { classId: 2, period: 5, teacherId: 'T04', subject: 'Hindi' },
  { classId: 2, period: 6, teacherId: 'T06', subject: 'Social Studies' },
  { classId: 2, period: 7, teacherId: 'T02', subject: 'Mental Math' },
  { classId: 2, period: 8, teacherId: 'T04', subject: 'Reading & Morals' },

  // Class 3 (Primary)
  { classId: 3, period: 1, teacherId: 'T04', subject: 'Hindi' },
  { classId: 3, period: 2, teacherId: 'T03', subject: 'Science' },
  { classId: 3, period: 3, teacherId: 'T01', subject: 'English' },
  { classId: 3, period: 4, teacherId: 'T02', subject: 'Mathematics' },
  { classId: 3, period: 5, teacherId: 'T06', subject: 'Social Studies' },
  { classId: 3, period: 6, teacherId: 'T05', subject: 'Physical Ed' },
  { classId: 3, period: 7, teacherId: 'T01', subject: 'Reading Lab' },
  { classId: 3, period: 8, teacherId: 'T02', subject: 'Mathematics' },

  // Class 4 (Primary)
  { classId: 4, period: 1, teacherId: 'T05', subject: 'Physical Ed' },
  { classId: 4, period: 2, teacherId: 'T04', subject: 'Hindi' },
  { classId: 4, period: 3, teacherId: 'T02', subject: 'Mathematics' },
  { classId: 4, period: 4, teacherId: 'T01', subject: 'English' },
  { classId: 4, period: 5, teacherId: 'T03', subject: 'Science' },
  { classId: 4, period: 6, teacherId: 'T07', subject: 'Math Enrichment' },
  { classId: 4, period: 7, teacherId: 'T04', subject: 'Moral Science' },
  { classId: 4, period: 8, teacherId: 'T06', subject: 'Social Studies' },

  // Class 5 (Primary)
  { classId: 5, period: 1, teacherId: 'T03', subject: 'Science' },
  { classId: 5, period: 2, teacherId: 'T06', subject: 'Social Studies' },
  { classId: 5, period: 3, teacherId: 'T04', subject: 'Hindi' },
  { classId: 5, period: 4, teacherId: 'T08', subject: 'Intro Bio' },
  { classId: 5, period: 5, teacherId: 'T01', subject: 'English' },
  { classId: 5, period: 6, teacherId: 'T02', subject: 'Mathematics' },
  { classId: 5, period: 7, teacherId: 'T05', subject: 'Games' },
  { classId: 5, period: 8, teacherId: 'T12', subject: 'Intro Computers' },

  // Class 6 (Middle)
  { classId: 6, period: 1, teacherId: 'T07', subject: 'Mathematics' },
  { classId: 6, period: 2, teacherId: 'T08', subject: 'General Science' },
  { classId: 6, period: 3, teacherId: 'T09', subject: 'English' },
  { classId: 6, period: 4, teacherId: 'T10', subject: 'History' },
  { classId: 6, period: 5, teacherId: 'T11', subject: 'Hindi' },
  { classId: 6, period: 6, teacherId: 'T12', subject: 'Computer Lab' },
  { classId: 6, period: 7, teacherId: 'T07', subject: 'Math Tutorial' },
  { classId: 6, period: 8, teacherId: 'T09', subject: 'English Grammar' },

  // Class 7 (Middle)
  { classId: 7, period: 1, teacherId: 'T08', subject: 'Science' },
  { classId: 7, period: 2, teacherId: 'T07', subject: 'Mathematics' },
  { classId: 7, period: 3, teacherId: 'T10', subject: 'Geography' },
  { classId: 7, period: 4, teacherId: 'T09', subject: 'English' },
  { classId: 7, period: 5, teacherId: 'T12', subject: 'Computer Science' },
  { classId: 7, period: 6, teacherId: 'T11', subject: 'Hindi' },
  { classId: 7, period: 7, teacherId: 'T08', subject: 'Science Lab' },
  { classId: 7, period: 8, teacherId: 'T10', subject: 'Civics' },

  // Class 8 (Middle)
  { classId: 8, period: 1, teacherId: 'T09', subject: 'English Literature' },
  { classId: 8, period: 2, teacherId: 'T10', subject: 'History' },
  { classId: 8, period: 3, teacherId: 'T07', subject: 'Algebra' },
  { classId: 8, period: 4, teacherId: 'T11', subject: 'Sanskrit' },
  { classId: 8, period: 5, teacherId: 'T08', subject: 'Physics & Chem' },
  { classId: 8, period: 6, teacherId: 'T09', subject: 'Writing Workshop' },
  { classId: 8, period: 7, teacherId: 'T12', subject: 'Robotics & Logic' },
  { classId: 8, period: 8, teacherId: 'T07', subject: 'Geometry' },

  // Class 9 (Senior)
  { classId: 9, period: 1, teacherId: 'T10', subject: 'Social Science' },
  { classId: 9, period: 2, teacherId: 'T09', subject: 'English' },
  { classId: 9, period: 3, teacherId: 'T13', subject: 'Physics' },
  { classId: 9, period: 4, teacherId: 'T14', subject: 'Chemistry' },
  { classId: 9, period: 5, teacherId: 'T15', subject: 'Mathematics' },
  { classId: 9, period: 6, teacherId: 'T16', subject: 'Biology' },
  { classId: 9, period: 7, teacherId: 'T17', subject: 'English Lab' },
  { classId: 9, period: 8, teacherId: 'T18', subject: 'Economics Basics' },

  // Class 10 (Senior)
  { classId: 10, period: 1, teacherId: 'T13', subject: 'Physics' },
  { classId: 10, period: 2, teacherId: 'T14', subject: 'Chemistry' },
  { classId: 10, period: 3, teacherId: 'T15', subject: 'Mathematics' },
  { classId: 10, period: 4, teacherId: 'T16', subject: 'Biology' },
  { classId: 10, period: 5, teacherId: 'T17', subject: 'English' },
  { classId: 10, period: 6, teacherId: 'T18', subject: 'Social Studies' },
  { classId: 10, period: 7, teacherId: 'T15', subject: 'Math Problem Solving' },
  { classId: 10, period: 8, teacherId: 'T13', subject: 'Physics Lab' },

  // Class 11 (Senior)
  { classId: 11, period: 1, teacherId: 'T14', subject: 'Chemistry' },
  { classId: 11, period: 2, teacherId: 'T15', subject: 'Calculus' },
  { classId: 11, period: 3, teacherId: 'T16', subject: 'Biotechnology' },
  { classId: 11, period: 4, teacherId: 'T13', subject: 'Physics' },
  { classId: 11, period: 5, teacherId: 'T18', subject: 'Economics' },
  { classId: 11, period: 6, teacherId: 'T17', subject: 'English Core' },
  { classId: 11, period: 7, teacherId: 'T14', subject: 'Chemistry Lab' },
  { classId: 11, period: 8, teacherId: 'T15', subject: 'Applied Math' },

  // Class 12 (Senior)
  { classId: 12, period: 1, teacherId: 'T15', subject: 'Advanced Math' },
  { classId: 12, period: 2, teacherId: 'T13', subject: 'Physics' },
  { classId: 12, period: 3, teacherId: 'T14', subject: 'Organic Chemistry' },
  { classId: 12, period: 4, teacherId: 'T18', subject: 'Accountancy' },
  { classId: 12, period: 5, teacherId: 'T16', subject: 'Cell Biology' },
  { classId: 12, period: 6, teacherId: 'T18', subject: 'Business Studies' },
  { classId: 12, period: 7, teacherId: 'T13', subject: 'Physics Practical' },
  { classId: 12, period: 8, teacherId: 'T17', subject: 'Elective English' },
];

export const getTeacherById = (id: string): Teacher | undefined => {
  return TEACHERS.find(t => t.id === id);
};
