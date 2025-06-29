import React from 'react';
import { Users, BookOpen, CheckSquare, TrendingUp, Plus, BarChart3 } from 'lucide-react';
import { Student, Subject, AttendanceRecord } from '../types';
import { calculateAttendanceStats } from '../utils/attendanceUtils';

interface DashboardProps {
  students: Student[];
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  onViewChange: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  students, 
  subjects, 
  attendanceRecords, 
  onViewChange 
}) => {
  const totalStudents = students.length;
  const totalSubjects = subjects.length;
  const totalAttendanceRecords = attendanceRecords.length;
  
  // Calculate overall attendance percentage
  const overallStats = students.reduce((acc, student) => {
    subjects.forEach(subject => {
      const stats = calculateAttendanceStats(attendanceRecords, student.id, subject.id);
      acc.totalClasses += stats.totalClasses;
      acc.presentClasses += stats.presentClasses;
    });
    return acc;
  }, { totalClasses: 0, presentClasses: 0 });
  
  const overallPercentage = overallStats.totalClasses > 0 
    ? Math.round((overallStats.presentClasses / overallStats.totalClasses) * 100)
    : 0;

  const statsCards = [
    {
      title: 'Students',
      value: totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      action: () => onViewChange('students')
    },
    {
      title: 'Subjects',
      value: totalSubjects,
      icon: BookOpen,
      color: 'bg-green-500',
      action: () => onViewChange('subjects')
    },
    {
      title: 'Records',
      value: totalAttendanceRecords,
      icon: CheckSquare,
      color: 'bg-purple-500',
      action: () => onViewChange('attendance')
    },
    {
      title: 'Attendance',
      value: `${overallPercentage}%`,
      icon: TrendingUp,
      color: overallPercentage >= 75 ? 'bg-green-500' : overallPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500',
      action: () => onViewChange('reports')
    }
  ];

  const quickActions = [
    { label: 'Add Student', action: () => onViewChange('students'), color: 'bg-blue-600', icon: Users },
    { label: 'Add Subject', action: () => onViewChange('subjects'), color: 'bg-green-600', icon: BookOpen },
    { label: 'Mark Attendance', action: () => onViewChange('attendance'), color: 'bg-purple-600', icon: CheckSquare },
    { label: 'View Reports', action: () => onViewChange('reports'), color: 'bg-indigo-600', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600 text-sm sm:text-base">Overview of your attendance system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div
                key={index}
                onClick={card.action}
                className="bg-white rounded-xl shadow-md p-4 sm:p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`${card.color} p-2 sm:p-3 rounded-lg`}>
                    <IconComponent className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} hover:opacity-90 text-white p-3 sm:p-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2`}
                >
                  <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {attendanceRecords.length > 0 ? (
            <div className="space-y-3">
              {attendanceRecords
                .slice(-5)
                .reverse()
                .map((record) => {
                  const student = students.find(s => s.id === record.studentId);
                  const subject = subjects.find(s => s.id === record.subjectId);
                  return (
                    <div key={record.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {student?.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{subject?.name}</p>
                        <p className="text-xs text-gray-500">{record.date}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        record.status === 'present' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status === 'present' ? 'Present' : 'Absent'}
                      </span>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 text-sm sm:text-base">No attendance records yet</p>
              <button
                onClick={() => onViewChange('attendance')}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Start Marking Attendance
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;