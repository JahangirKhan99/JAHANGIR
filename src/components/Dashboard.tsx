import React from 'react';
import { Users, BookOpen, CheckSquare, TrendingUp, Plus, BarChart3, AlertCircle, UserX, UserCheck } from 'lucide-react';
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
  
  // Calculate overall attendance percentage and absent count
  const overallStats = students.reduce((acc, student) => {
    subjects.forEach(subject => {
      const stats = calculateAttendanceStats(attendanceRecords, student.id, subject.id);
      acc.totalClasses += stats.totalClasses;
      acc.presentClasses += stats.presentClasses;
      acc.absentClasses += stats.absentClasses;
    });
    return acc;
  }, { totalClasses: 0, presentClasses: 0, absentClasses: 0 });
  
  const overallPercentage = overallStats.totalClasses > 0 
    ? Math.round((overallStats.presentClasses / overallStats.totalClasses) * 100)
    : 0;

  // Calculate today's attendance
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(record => record.date === today);
  const todayAbsentCount = todayRecords.filter(record => record.status === 'absent').length;
  const todayPresentCount = todayRecords.filter(record => record.status === 'present').length;

  // Get students with poor attendance (less than 75%)
  const studentsWithPoorAttendance = students.filter(student => {
    let totalClasses = 0;
    let presentClasses = 0;
    
    subjects.forEach(subject => {
      const stats = calculateAttendanceStats(attendanceRecords, student.id, subject.id);
      totalClasses += stats.totalClasses;
      presentClasses += stats.presentClasses;
    });
    
    const percentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
    return percentage < 75 && totalClasses > 0;
  });

  const statsCards = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      action: () => onViewChange('students')
    },
    {
      title: 'Present Today',
      value: todayPresentCount,
      icon: UserCheck,
      color: 'bg-green-500',
      action: () => onViewChange('reports')
    },
    {
      title: 'Absent Today',
      value: todayAbsentCount,
      icon: UserX,
      color: 'bg-red-500',
      action: () => onViewChange('reports')
    },
    {
      title: 'Overall %',
      value: `${overallPercentage}%`,
      icon: TrendingUp,
      color: overallPercentage >= 75 ? 'bg-green-500' : overallPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500',
      action: () => onViewChange('reports')
    }
  ];

  const quickActions = [
    { label: 'View Students', action: () => onViewChange('students'), color: 'bg-blue-600', icon: Users },
    { label: 'View Subjects', action: () => onViewChange('subjects'), color: 'bg-green-600', icon: BookOpen },
    { label: 'View Reports', action: () => onViewChange('reports'), color: 'bg-purple-600', icon: BarChart3 },
    { label: 'Export PDF', action: () => onViewChange('export'), color: 'bg-indigo-600', icon: CheckSquare }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600 text-sm sm:text-base">Overview of your attendance system</p>
        </div>

        {/* No Data Warning for Students */}
        {totalStudents === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">No Student Data Found</p>
                <p className="mt-1">
                  If you are a student, please contact your administrator to add your record to the system.
                  Your attendance data will appear here once you are registered.
                </p>
              </div>
            </div>
          </div>
        )}

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

        {/* Attendance Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Overall Attendance Stats */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Attendance Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Classes Conducted</span>
                <span className="text-lg font-bold text-gray-900">{overallStats.totalClasses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-600">Total Present</span>
                <span className="text-lg font-bold text-green-600">{overallStats.presentClasses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-600">Total Absent</span>
                <span className="text-lg font-bold text-red-600">{overallStats.absentClasses}</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Overall Percentage</span>
                  <span className={`text-xl font-bold ${
                    overallPercentage >= 75 ? 'text-green-600' : 
                    overallPercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {overallPercentage}%
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      overallPercentage >= 75 ? 'bg-green-500' : 
                      overallPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${overallPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Attendance */}
          {todayRecords.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Classes Today</span>
                  <span className="text-lg font-bold text-gray-900">{todayRecords.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">Present</span>
                  <span className="text-lg font-bold text-green-600">{todayPresentCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-600">Absent</span>
                  <span className="text-lg font-bold text-red-600">{todayAbsentCount}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Today's Percentage</span>
                    <span className={`text-xl font-bold ${
                      todayRecords.length > 0 && (todayPresentCount / todayRecords.length) >= 0.75 ? 'text-green-600' : 
                      todayRecords.length > 0 && (todayPresentCount / todayRecords.length) >= 0.5 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {todayRecords.length > 0 ? Math.round((todayPresentCount / todayRecords.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Students with Poor Attendance Alert */}
        {studentsWithPoorAttendance.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-red-900 mb-2">
                  Students with Low Attendance ({studentsWithPoorAttendance.length})
                </h3>
                <p className="text-sm text-red-800 mb-3">
                  The following students have attendance below 75%:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {studentsWithPoorAttendance.slice(0, 6).map(student => {
                    let totalClasses = 0;
                    let presentClasses = 0;
                    
                    subjects.forEach(subject => {
                      const stats = calculateAttendanceStats(attendanceRecords, student.id, subject.id);
                      totalClasses += stats.totalClasses;
                      presentClasses += stats.presentClasses;
                    });
                    
                    const percentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
                    
                    return (
                      <div key={student.id} className="bg-white rounded-lg p-3 border border-red-200">
                        <div className="text-sm font-medium text-gray-900 truncate">{student.name}</div>
                        <div className="text-xs text-gray-600">{student.rollNumber}</div>
                        <div className="text-sm font-bold text-red-600">{percentage}%</div>
                      </div>
                    );
                  })}
                </div>
                {studentsWithPoorAttendance.length > 6 && (
                  <button
                    onClick={() => onViewChange('reports')}
                    className="mt-3 text-sm text-red-700 hover:text-red-800 font-medium"
                  >
                    View all {studentsWithPoorAttendance.length} students →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

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
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Recent Attendance Activity</h3>
          {attendanceRecords.length > 0 ? (
            <div className="space-y-3">
              {attendanceRecords
                .slice(-8)
                .reverse()
                .map((record) => {
                  const student = students.find(s => s.id === record.studentId);
                  const subject = subjects.find(s => s.id === record.subjectId);
                  return (
                    <div key={record.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                          record.status === 'present' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {record.status === 'present' ? (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          ) : (
                            <UserX className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            {student?.name || 'Unknown Student'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{subject?.name || 'Unknown Subject'}</p>
                          <p className="text-xs text-gray-500">{record.date}</p>
                        </div>
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
              <p className="text-gray-600 text-sm sm:text-base">
                {totalStudents === 0 
                  ? 'No attendance records available. Please contact your administrator.'
                  : 'No attendance records yet'
                }
              </p>
              {totalStudents > 0 && (
                <button
                  onClick={() => onViewChange('reports')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  View Reports
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;