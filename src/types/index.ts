export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  phone: string;
  program: string;
  semester: number;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  semester: number;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectId: string;
  date: string;
  status: 'present' | 'absent';
  createdAt: string;
}

export interface AttendanceStats {
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  percentage: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'student';
  studentId?: string;
  createdAt: string;
}

export interface BackupData {
  students: Student[];
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  users: User[];
  timestamp: string;
}