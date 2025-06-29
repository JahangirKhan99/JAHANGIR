import React, { useState } from 'react';
import { FileDown, Download, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Student, Subject, AttendanceRecord } from '../types';
import { generateAttendanceReport } from '../utils/pdfUtils';

interface PDFExportProps {
  students: Student[];
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
}

const PDFExport: React.FC<PDFExportProps> = ({
  students,
  subjects,
  attendanceRecords
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string>('');

  const handleExport = async (subjectId?: string) => {
    if (students.length === 0) {
      alert('No students found. Please add students first.');
      return;
    }

    if (subjects.length === 0) {
      alert('No subjects found. Please add subjects first.');
      return;
    }

    setIsGenerating(true);
    
    try {
      await generateAttendanceReport(
        students,
        subjects,
        attendanceRecords,
        subjectId
      );
      
      const subjectName = subjectId 
        ? subjects.find(s => s.id === subjectId)?.name || 'Unknown Subject'
        : 'Overall Report';
      
      setLastGenerated(`${subjectName} - ${new Date().toLocaleString()}`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please check your browser settings and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const canExport = students.length > 0 && subjects.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Export Reports</h2>
          <p className="text-gray-600 text-sm sm:text-base">Generate and download attendance reports in PDF format</p>
        </div>

        {/* Quick Export Section */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Export</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Subject (Optional)
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                disabled={isGenerating}
              >
                <option value="">All Subjects (Overall Report)</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => handleExport(selectedSubject || undefined)}
              disabled={isGenerating || !canExport}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                isGenerating || !canExport
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-95'
              }`}
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{isGenerating ? 'Generating PDF...' : 'Generate & Download PDF'}</span>
            </button>
          </div>
          
          {lastGenerated && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">Last Generated:</p>
                  <p>{lastGenerated}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Export Information:</p>
                <ul className="mt-1 space-y-1 text-blue-700">
                  <li>• PDF reports include student details and attendance statistics</li>
                  <li>• Overall reports show combined attendance across all subjects</li>
                  <li>• Subject-specific reports focus on individual course attendance</li>
                  <li>• Reports are automatically dated and timestamped</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Available Reports</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {/* Overall Report */}
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileDown className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900">Overall Attendance Report</h4>
                  <p className="text-sm text-gray-500 truncate">Complete attendance report for all students across all subjects</p>
                </div>
              </div>
              
              <button
                onClick={() => handleExport()}
                disabled={isGenerating || !canExport}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ml-4 ${
                  isGenerating || !canExport
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-95'
                }`}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Export'}</span>
              </button>
            </div>

            {/* Subject-specific Reports */}
            {subjects.map((subject) => (
              <div key={subject.id} className="px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <FileDown className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{subject.name} Report</h4>
                    <p className="text-sm text-gray-500 truncate">Attendance report for {subject.name} ({subject.code})</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleExport(subject.id)}
                  disabled={isGenerating || !canExport}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0 ml-4 ${
                    isGenerating || !canExport
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg active:scale-95'
                  }`}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Export'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* No Data Warning */}
        {!canExport && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cannot Generate Reports</h3>
              <p className="text-gray-600 mb-4">
                {students.length === 0 
                  ? 'Please add students first.'
                  : subjects.length === 0 
                  ? 'Please add subjects first.'
                  : 'No data available for report generation.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                {students.length === 0 && (
                  <button
                    onClick={() => window.location.hash = '#students'}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Add Students
                  </button>
                )}
                {subjects.length === 0 && (
                  <button
                    onClick={() => window.location.hash = '#subjects'}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Add Subjects
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Statistics Overview */}
        {canExport && (
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{students.length}</div>
                <div className="text-sm text-blue-800">Total Students</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{subjects.length}</div>
                <div className="text-sm text-green-800">Total Subjects</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{attendanceRecords.length}</div>
                <div className="text-sm text-purple-800">Attendance Records</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFExport;