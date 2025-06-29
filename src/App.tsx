import React, { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Student, Subject, AttendanceRecord } from './types';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import SubjectManagement from './components/SubjectManagement';
import AttendanceMarking from './components/AttendanceMarking';
import AttendanceReports from './components/AttendanceReports';
import PDFExport from './components/PDFExport';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [students, setStudents] = useLocalStorage<Student[]>('students', []);
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('subjects', []);
  const [attendanceRecords, setAttendanceRecords] = useLocalStorage<AttendanceRecord[]>('attendanceRecords', []);

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

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard
            students={students}
            subjects={subjects}
            attendanceRecords={attendanceRecords}
            onViewChange={setActiveView}
          />
        );
      case 'students':
        return (
          <StudentManagement
            students={students}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        );
      case 'subjects':
        return (
          <SubjectManagement
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
          />
        );
      case 'attendance':
        return (
          <AttendanceMarking
            students={students}
            subjects={subjects}
            attendanceRecords={attendanceRecords}
            onMarkAttendance={handleMarkAttendance}
          />
        );
      case 'reports':
        return (
          <AttendanceReports
            students={students}
            subjects={subjects}
            attendanceRecords={attendanceRecords}
          />
        );
      case 'export':
        return (
          <PDFExport
            students={students}
            subjects={subjects}
            attendanceRecords={attendanceRecords}
          />
        );
      default:
        return (
          <Dashboard
            students={students}
            subjects={subjects}
            attendanceRecords={attendanceRecords}
            onViewChange={setActiveView}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeView={activeView} onViewChange={setActiveView} />
      <main>{renderActiveView()}</main>
    </div>
  );
}

export default App;