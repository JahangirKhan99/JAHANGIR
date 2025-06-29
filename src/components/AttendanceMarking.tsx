import React, { useState } from 'react';
import { Calendar, Users, CheckSquare, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Student, Subject, AttendanceRecord, User } from '../types';

interface AttendanceMarkingProps {
  students: Student[];
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  onMarkAttendance: (records: Omit<AttendanceRecord, 'id' | 'createdAt'>[]) => void;
  currentUser?: User;
}

const AttendanceMarking: React.FC<AttendanceMarkingProps> = ({
  students,
  subjects,
  attendanceRecords,
  onMarkAttendance,
  currentUser
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent'>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // Only admins can mark attendance
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">Only administrators can mark attendance.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
    // Reset attendance data when subject changes
    setAttendanceData({});
    
    // Check if attendance for this subject and date already exists
    const existingRecords = attendanceRecords.filter(
      record => record.subjectId === subjectId && record.date === selectedDate
    );
    
    if (existingRecords.length > 0) {
      const existingData: Record<string, 'present' | 'absent'> = {};
      existingRecords.forEach(record => {
        existingData[record.studentId] = record.status;
      });
      setAttendanceData(existingData);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (selectedSubject) {
      // Reset and reload attendance data for new date
      setAttendanceData({});
      
      const existingRecords = attendanceRecords.filter(
        record => record.subjectId === selectedSubject && record.date === date
      );
      
      if (existingRecords.length > 0) {
        const existingData: Record<string, 'present' | 'absent'> = {};
        existingRecords.forEach(record => {
          existingData[record.studentId] = record.status;
        });
        setAttendanceData(existingData);
      }
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSelectAll = (status: 'present' | 'absent') => {
    const newData: Record<string, 'present' | 'absent'> = {};
    students.forEach(student => {
      newData[student.id] = status;
    });
    setAttendanceData(newData);
  };

  const handleSubmit = () => {
    if (!selectedSubject || !selectedDate) return;
    
    const records: Omit<AttendanceRecord, 'id' | 'createdAt'>[] = Object.entries(attendanceData).map(([studentId, status]) => ({
      studentId,
      subjectId: selectedSubject,
      date: selectedDate,
      status
    }));
    
    onMarkAttendance(records);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 3000);
  };

  const selectedSubjectData = subjects.find(s => s.id === selectedSubject);
  const presentCount = Object.values(attendanceData).filter(status => status === 'present').length;
  const absentCount = Object.values(attendanceData).filter(status => status === 'absent').length;
  const totalMarked = presentCount + absentCount;

  const canSubmit = selectedSubject && selectedDate && totalMarked > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Mark Attendance</h2>
          <p className="text-gray-600 text-sm sm:text-base">Record student attendance for each subject</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Subject *
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="">Choose a subject...</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>
          
          {selectedSubjectData && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-1">
                <CheckSquare className="h-4 w-4" />
                <span>Subject: {selectedSubjectData.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Date: {format(new Date(selectedDate), 'PPP')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Students: {students.length}</span>
              </div>
            </div>
          )}
        </div>

        {/* Attendance Marking */}
        {selectedSubject && students.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  Student Attendance
                </h3>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => handleSelectAll('present')}
                    className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Mark All Present
                  </button>
                  <button
                    onClick={() => handleSelectAll('absent')}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>
              
              {totalMarked > 0 && (
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <span className="text-green-600 font-medium">Present: {presentCount}</span>
                  <span className="text-red-600 font-medium">Absent: {absentCount}</span>
                  <span className="text-gray-600">Total: {totalMarked}/{students.length}</span>
                </div>
              )}
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {students.map((student) => (
                <div key={student.id} className="px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.rollNumber}</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleAttendanceChange(student.id, 'present')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        attendanceData[student.id] === 'present'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(student.id, 'absent')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        attendanceData[student.id] === 'absent'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                  canSubmit
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {canSubmit ? 'Save Attendance' : 'Select subject and mark attendance'}
              </button>
            </div>
          </div>
        )}

        {/* No Students Message */}
        {students.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600">Please add students first before marking attendance.</p>
          </div>
        )}

        {/* No Subjects Message */}
        {subjects.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Found</h3>
            <p className="text-gray-600">Please add subjects first before marking attendance.</p>
          </div>
        )}

        {/* Success Message */}
        {showConfirmation && (
          <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 flex items-center space-x-2">
            <CheckSquare className="h-5 w-5" />
            <span>Attendance saved successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceMarking;