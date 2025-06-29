import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  Save, 
  RefreshCw, 
  Calendar,
  Database,
  Cloud,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { BackupData, Student, Subject, AttendanceRecord, User } from '../types';
import { backupManager } from '../utils/backupUtils';

interface BackupManagerProps {
  students: Student[];
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  users: User[];
  onRestore: (data: BackupData) => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({
  students,
  subjects,
  attendanceRecords,
  users,
  onRestore
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [localBackups, setLocalBackups] = useState(backupManager.getLocalBackups());

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateBackup = () => {
    try {
      const backup = backupManager.createBackup(students, subjects, attendanceRecords, users);
      backupManager.saveLocalBackup(backup);
      setLocalBackups(backupManager.getLocalBackups());
      showMessage('success', 'Backup created successfully!');
    } catch (error) {
      showMessage('error', 'Failed to create backup');
    }
  };

  const handleExportBackup = () => {
    try {
      const backup = backupManager.createBackup(students, subjects, attendanceRecords, users);
      backupManager.exportBackup(backup);
      showMessage('success', 'Backup exported successfully!');
    } catch (error) {
      showMessage('error', 'Failed to export backup');
    }
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    backupManager.importBackup(file)
      .then((data) => {
        onRestore(data);
        showMessage('success', 'Backup imported successfully!');
      })
      .catch((error) => {
        showMessage('error', error.message || 'Failed to import backup');
      })
      .finally(() => {
        setIsLoading(false);
        event.target.value = '';
      });
  };

  const handleRestoreBackup = (backup: BackupData) => {
    if (confirm('Are you sure you want to restore this backup? This will replace all current data.')) {
      onRestore(backup);
      showMessage('success', 'Data restored successfully!');
    }
  };

  const handleGoogleDriveBackup = async () => {
    setIsLoading(true);
    try {
      const backup = backupManager.createBackup(students, subjects, attendanceRecords, users);
      const success = await backupManager.backupToGoogleDrive(backup);
      
      if (success) {
        showMessage('success', 'Backup saved to Google Drive!');
      } else {
        showMessage('error', 'Google Drive backup is not configured yet');
      }
    } catch (error) {
      showMessage('error', 'Failed to backup to Google Drive');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLocalBackups = () => {
    setLocalBackups(backupManager.getLocalBackups());
    showMessage('success', 'Backup list refreshed');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Data Backup & Restore</h2>
          <p className="text-gray-600 text-sm sm:text-base">Manage your data backups and restore points</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleCreateBackup}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-lg font-medium transition-colors duration-200"
            >
              <Save className="h-5 w-5" />
              <span>Create Backup</span>
            </button>

            <button
              onClick={handleExportBackup}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-3 rounded-lg font-medium transition-colors duration-200"
            >
              <Download className="h-5 w-5" />
              <span>Export Backup</span>
            </button>

            <label className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer">
              <Upload className="h-5 w-5" />
              <span>Import Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
                disabled={isLoading}
              />
            </label>

            <button
              onClick={handleGoogleDriveBackup}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white p-3 rounded-lg font-medium transition-colors duration-200"
            >
              <Cloud className="h-5 w-5" />
              <span>Google Drive</span>
            </button>
          </div>
        </div>

        {/* Current Data Stats */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Current Data</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{students.length}</div>
              <div className="text-sm text-blue-800">Students</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{subjects.length}</div>
              <div className="text-sm text-green-800">Subjects</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{attendanceRecords.length}</div>
              <div className="text-sm text-purple-800">Records</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{users.length}</div>
              <div className="text-sm text-orange-800">Users</div>
            </div>
          </div>
        </div>

        {/* Local Backups */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Local Backups</h3>
            <button
              onClick={refreshLocalBackups}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
          
          {localBackups.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {localBackups.map((backup, index) => (
                <div key={backup.key} className="px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Database className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Backup - {backup.date}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {backup.data.students?.length || 0} students, {backup.data.subjects?.length || 0} subjects, {backup.data.attendanceRecords?.length || 0} records
                      </p>
                      <p className="text-xs text-gray-400 flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(backup.data.timestamp).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRestoreBackup(backup.data)}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Restore</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Local Backups</h3>
              <p className="text-gray-600 mb-4">Create your first backup to get started</p>
              <button
                onClick={handleCreateBackup}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Create First Backup
              </button>
            </div>
          )}
        </div>

        {/* Google Drive Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Cloud className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Google Drive Backup</p>
              <p className="mt-1">
                Automatic daily backups will be saved to your Google Drive account: <strong>jahangirkhan9279925@gmail.com</strong>
              </p>
              <p className="mt-1 text-blue-700">
                Note: Google Drive integration requires API setup. Currently showing demo functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;