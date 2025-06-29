import { BackupData, Student, Subject, AttendanceRecord, User } from '../types';

// Google Drive API configuration
const GOOGLE_DRIVE_API_KEY = 'YOUR_GOOGLE_DRIVE_API_KEY'; // You'll need to set this up
const GOOGLE_DRIVE_FOLDER_ID = 'YOUR_FOLDER_ID'; // You'll need to create a folder and get its ID

export class BackupManager {
  private static instance: BackupManager;
  private backupInterval: NodeJS.Timeout | null = null;

  static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager();
    }
    return BackupManager.instance;
  }

  // Create backup data
  createBackup(
    students: Student[],
    subjects: Subject[],
    attendanceRecords: AttendanceRecord[],
    users: User[]
  ): BackupData {
    return {
      students,
      subjects,
      attendanceRecords,
      users: users.map(user => ({ ...user, password: '***' })), // Don't backup passwords
      timestamp: new Date().toISOString()
    };
  }

  // Save backup to localStorage
  saveLocalBackup(data: BackupData): void {
    try {
      const backupKey = `backup_${new Date().toISOString().split('T')[0]}`;
      localStorage.setItem(backupKey, JSON.stringify(data));
      
      // Keep only last 7 days of backups
      this.cleanOldBackups();
      
      console.log('Local backup saved successfully');
    } catch (error) {
      console.error('Error saving local backup:', error);
    }
  }

  // Clean old backups (keep only last 7 days)
  private cleanOldBackups(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('backup_'));
      const sortedKeys = keys.sort().reverse();
      
      // Remove backups older than 7 days
      sortedKeys.slice(7).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error cleaning old backups:', error);
    }
  }

  // Get available local backups
  getLocalBackups(): { key: string; date: string; data: BackupData }[] {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('backup_'));
      return keys.map(key => {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        return {
          key,
          date: key.replace('backup_', ''),
          data
        };
      }).sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      console.error('Error getting local backups:', error);
      return [];
    }
  }

  // Restore from backup
  restoreFromBackup(backupData: BackupData): BackupData {
    return backupData;
  }

  // Export backup as JSON file
  exportBackup(data: BackupData): void {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting backup:', error);
    }
  }

  // Import backup from JSON file
  importBackup(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid backup file format'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }

  // Start automatic daily backup
  startAutomaticBackup(
    getDataCallback: () => {
      students: Student[];
      subjects: Subject[];
      attendanceRecords: AttendanceRecord[];
      users: User[];
    }
  ): void {
    // Clear existing interval
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    // Create backup every 24 hours
    this.backupInterval = setInterval(() => {
      try {
        const data = getDataCallback();
        const backup = this.createBackup(
          data.students,
          data.subjects,
          data.attendanceRecords,
          data.users
        );
        this.saveLocalBackup(backup);
        
        // Also try to save to Google Drive (if configured)
        this.saveToGoogleDrive(backup);
      } catch (error) {
        console.error('Error in automatic backup:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Create initial backup
    try {
      const data = getDataCallback();
      const backup = this.createBackup(
        data.students,
        data.subjects,
        data.attendanceRecords,
        data.users
      );
      this.saveLocalBackup(backup);
    } catch (error) {
      console.error('Error creating initial backup:', error);
    }
  }

  // Stop automatic backup
  stopAutomaticBackup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }

  // Save to Google Drive (placeholder - requires Google Drive API setup)
  private async saveToGoogleDrive(data: BackupData): Promise<void> {
    try {
      // This is a placeholder implementation
      // You would need to implement Google Drive API integration
      console.log('Google Drive backup would be saved here');
      
      // For now, we'll just log that we would save to Google Drive
      // In a real implementation, you would:
      // 1. Authenticate with Google Drive API
      // 2. Create or update a file in the specified folder
      // 3. Upload the backup data
      
      const fileName = `attendance_backup_${new Date().toISOString().split('T')[0]}.json`;
      console.log(`Would save backup to Google Drive as: ${fileName}`);
      console.log('Backup data size:', JSON.stringify(data).length, 'characters');
      
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
    }
  }

  // Manual Google Drive backup trigger
  async backupToGoogleDrive(data: BackupData): Promise<boolean> {
    try {
      await this.saveToGoogleDrive(data);
      return true;
    } catch (error) {
      console.error('Manual Google Drive backup failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const backupManager = BackupManager.getInstance();