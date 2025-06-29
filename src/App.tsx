import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Student, Subject, AttendanceRecord, User, BackupData } from './types';
import { backupManager } from './utils/backupUtils';
import Login from './components/Login';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import SubjectManagement from './components/SubjectManagement';
import AttendanceMarking from './components/AttendanceMarking';
import AttendanceReports from './components/AttendanceReports';
import PDFExport from './components/PDFExport';
import BackupManager from './components/BackupManager';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [students, setStudents] = useLocalStorage<Student[]>('students', []);
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('subjects', []);
  const [attendanceRecords, setAttendanceRecords] = useLocalStorage<AttendanceRecord[]>('attendanceRecords', []);
  const [users, setUsers] = useLocalStorage<User[]>('users', [
    {
      id: 'admin-1',
      username: 'BSCS',
      password: 'SECOND',
      role: 'admin',
      createdAt: new Date().toISOString()
    },
    {
      id: 'student-1',
      username: 'student',
      password: 'student123',
      role: 'student',
      createdAt: new Date().toISOString()
    }
  ]);

  // Initialize automatic backup
  useEffect(() => {
    if (currentUser) {
      backupManager.startAutomaticBackup(() => ({
        students,
        subjects,
        attendanceRecords,
        users
      }));
    }

    return () => {
      backupManager.stopAutomaticBackup();
    };
  }, [currentUser, students, subjects, attendanceRecords, users]);

  // Handle login
  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('dashboard');
  };

  // Handle create account
  const handleCreateAccount = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
  };

  // Student management functions
  const handleAddStudent = (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...studentData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const handleUpdateStudent = (id: string, studentData: Omit<Student, 'id' | 'createdAt'>) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === id ? { ...student, ...studentData } : student
      )
    );
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Are you sure you want to delete this student? This will also delete all their attendance records.')) {
      setStudents(prev => prev.filter(student => student.id !== id));
      setAttendanceRecords(prev => prev.filter(record => record.studentId !== id));
    }
  };

  // Subject management functions
  const handleAddSubject = (subjectData: Omit<Subject, 'id' | 'createdAt'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    setSubjects(prev => [...prev, newSubject]);
  };

  const handleUpdateSubject = (id: string, subjectData: Omit<Subject, 'id' | 'createdAt'>) => {
    setSubjects(prev => 
      prev.map(subject => 
        subject.id === id ? { ...subject, ...subjectData } : subject
      )
    );
  };

  const handleDeleteSubject = (id: string) => {
    if (confirm('Are you sure you want to delete this subject? This will also delete all related attendance records.')) {
      setSubjects(prev => prev.filter(subject => subject.id !== id));
      setAttendanceRecords(prev => prev.filter(record => record.subjectId !== id));
    }
  };

  // Attendance management functions
  const handleMarkAttendance = (records: Omit<AttendanceRecord, 'id' | 'createdAt'>[]) => {
    // Remove existing records for the same date and subject
    const filteredRecords = attendanceRecords.filter(record => 
      !(record.date === records[0]?.date && record.subjectId === records[0]?.subjectId)
    );

    // Add new records
    const newRecords: AttendanceRecord[] = records.map(record => ({
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    }));

    setAttendanceRecords([...filteredRecords, ...newRecords]);
  };

  // Backup and restore functions
  const handleRestoreBackup = (backupData: BackupData) => {
    if (backupData.students) setStudents(backupData.students);
    if (backupData.subjects) setSubjects(backupData.subjects);
    if (backupData.attendanceRecords) setAttendanceRecords(backupData.attendanceRecords);
    if (backupData.users) {
      // Restore users but keep passwords as they were (since we don't backup passwords)
      const restoredUsers = backupData.users.map(user => ({
        ...user,
        password: users.find(u => u.username === user.username)?.password || 'defaultpass123'
      }));
      setUsers(restoredUsers);
    }
  };

  // IMPROVED: Filter data based on user role - Better student data filtering
  const getFilteredData = () => {
    if (!currentUser) return { students: [], subjects: [], attendanceRecords: [] };
    
    if (currentUser.role === 'admin') {
      return { students, subjects, attendanceRecords };
    } else {
      // For students - find their record using multiple methods
      let studentRecord = null;
      
      // Method 1: Try to find by studentId if provided
      if (currentUser.studentId) {
        studentRecord = students.find(s => s.id === currentUser.studentId);
      }
      
      // Method 2: If not found by studentId, try username match with roll number
      if (!studentRecord) {
        studentRecord = students.find(s => 
          s.rollNumber && s.rollNumber.toLowerCase() === currentUser.username.toLowerCase()
        );
      }
      
      // Method 3: Try partial name match
      if (!studentRecord) {
        studentRecord = students.find(s => 
          s.name && s.name.toLowerCase().includes(currentUser.username.toLowerCase()) ||
          currentUser.username.toLowerCase().includes(s.name && s.name.toLowerCase().split(' ')[0])
        );
      }
      
      // Method 4: For demo purposes, if username is 'student', find any student
      if (!studentRecord && currentUser.username === 'student' && students.length > 0) {
        studentRecord = students[0]; // Use first student for demo
      }
      
      const filteredStudents = studentRecord ? [studentRecord] : [];
      const filteredRecords = studentRecord 
        ? attendanceRecords.filter(r => r.studentId === studentRecord.id)
        : [];
      
      return {
        students: filteredStudents,
        subjects, // Show all subjects
        attendanceRecords: filteredRecords
      };
    }
  };

  const renderActiveView = () => {
    if (!currentUser) return null;

    const { students: filteredStudents, subjects: filteredSubjects, attendanceRecords: filteredRecords } = getFilteredData();

    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard
            students={filteredStudents}
            subjects={filteredSubjects}
            attendanceRecords={filteredRecords}
            onViewChange={setActiveView}
          />
        );
      case 'students':
        return (
          <StudentManagement
            students={filteredStudents}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            currentUser={currentUser}
          />
        );
      case 'subjects':
        return (
          <SubjectManagement
            subjects={filteredSubjects}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
            currentUser={currentUser}
          />
        );
      case 'attendance':
        return (
          <AttendanceMarking
            students={students} // Admin needs to see all students for marking attendance
            subjects={filteredSubjects}
            attendanceRecords={attendanceRecords}
            onMarkAttendance={handleMarkAttendance}
            currentUser={currentUser}
          />
        );
      case 'reports':
        return (
          <AttendanceReports
            students={filteredStudents}
            subjects={filteredSubjects}
            attendanceRecords={filteredRecords}
          />
        );
      case 'export':
        return (
          <PDFExport
            students={filteredStudents}
            subjects={filteredSubjects}
            attendanceRecords={filteredRecords}
          />
        );
      case 'backup':
        return currentUser.role === 'admin' ? (
          <BackupManager
            students={students}
            subjects={subjects}
            attendanceRecords={attendanceRecords}
            users={users}
            onRestore={handleRestoreBackup}
          />
        ) : null;
      default:
        return (
          <Dashboard
            students={filteredStudents}
            subjects={filteredSubjects}
            attendanceRecords={filteredRecords}
            onViewChange={setActiveView}
          />
        );
    }
  };

  // Show login screen if not authenticated
  if (!currentUser) {
    return (
      <Login
        users={users}
        onLogin={handleLogin}
        onCreateAccount={handleCreateAccount}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        activeView={activeView} 
        onViewChange={setActiveView}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main>{renderActiveView()}</main>
    </div>
  );
}

export default App;