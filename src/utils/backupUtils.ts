import { BackupData, Student, Subject, AttendanceRecord, User } from '../types';
import { googleDriveAPI } from './googleDriveAPI';

export class BackupManager {
  private static instance: BackupManager;
  private backupInterval: NodeJS.Timeout | null = null;
  private googleDriveFolderId: string | null = null;
  private readonly FOLDER_NAME = 'BS Attendance System Backups';
  private readonly BACKUP_FILE_PREFIX = 'attendance_backup_';

  static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager();
    }
    return BackupManager.instance;
  }

  // Initialize Google Drive integration
  async initializeGoogleDrive(): Promise<boolean> {
    try {
      const initialized = await googleDriveAPI.initialize();
      if (!initialized) return false;

      // Create backup folder if it doesn't exist
      await this.ensureBackupFolder();
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Drive:', error);
      return false;
    }
  }

  // Ensure backup folder exists
  private async ensureBackupFolder(): Promise<void> {
    try {
      // Check if folder already exists
      const files = await googleDriveAPI.listFiles(undefined, `name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder'`);
      
      if (files.length > 0) {
        this.googleDriveFolderId = files[0].id;
        console.log('Found existing backup folder:', this.googleDriveFolderId);
      } else {
        // Create new folder
        this.googleDriveFolderId = await googleDriveAPI.createFolder(this.FOLDER_NAME);
        console.log('Created new backup folder:', this.googleDriveFolderId);
      }
    } catch (error) {
      console.error('Failed to ensure backup folder:', error);
    }
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

  // Save backup to Google Drive
  async saveToGoogleDrive(data: BackupData): Promise<boolean> {
    try {
      if (!googleDriveAPI.isUserSignedIn()) {
        const signedIn = await googleDriveAPI.signIn();
        if (!signedIn) return false;
      }

      if (!this.googleDriveFolderId) {
        await this.ensureBackupFolder();
      }

      const fileName = `${this.BACKUP_FILE_PREFIX}${new Date().toISOString().split('T')[0]}.json`;
      const content = JSON.stringify(data, null, 2);

      // Check if file already exists
      const existingFile = await googleDriveAPI.findFileByName(fileName, this.googleDriveFolderId!);

      let success = false;
      if (existingFile) {
        // Update existing file
        success = await googleDriveAPI.updateFile(existingFile.id, content);
      } else {
        // Create new file
        const fileId = await googleDriveAPI.uploadFile(fileName, content, 'application/json', this.googleDriveFolderId!);
        success = fileId !== null;
      }

      if (success) {
        console.log('Backup saved to Google Drive successfully');
        
        // Clean old Google Drive backups (keep only last 30 days)
        await this.cleanOldGoogleDriveBackups();
      }

      return success;
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
      return false;
    }
  }

  // Clean old Google Drive backups
  private async cleanOldGoogleDriveBackups(): Promise<void> {
    try {
      if (!this.googleDriveFolderId) return;

      const files = await googleDriveAPI.listFiles(
        this.googleDriveFolderId,
        `name contains '${this.BACKUP_FILE_PREFIX}'`
      );

      // Sort by creation date and keep only last 30 files
      const sortedFiles = files.sort((a, b) => 
        new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
      );

      // Delete files older than 30 days
      const filesToDelete = sortedFiles.slice(30);
      for (const file of filesToDelete) {
        await googleDriveAPI.deleteFile(file.id);
        console.log('Deleted old backup:', file.name);
      }
    } catch (error) {
      console.error('Error cleaning old Google Drive backups:', error);
    }
  }

  // Get Google Drive backups
  async getGoogleDriveBackups(): Promise<{ id: string; name: string; date: string; size: string }[]> {
    try {
      if (!googleDriveAPI.isUserSignedIn()) return [];
      if (!this.googleDriveFolderId) await this.ensureBackupFolder();

      const files = await googleDriveAPI.listFiles(
        this.googleDriveFolderId!,
        `name contains '${this.BACKUP_FILE_PREFIX}'`
      );

      return files.map(file => ({
        id: file.id,
        name: file.name,
        date: file.name.replace(this.BACKUP_FILE_PREFIX, '').replace('.json', ''),
        size: file.size ? `${Math.round(parseInt(file.size) / 1024)} KB` : 'Unknown'
      })).sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      console.error('Error getting Google Drive backups:', error);
      return [];
    }
  }

  // Restore from Google Drive backup
  async restoreFromGoogleDrive(fileId: string): Promise<BackupData | null> {
    try {
      const content = await googleDriveAPI.downloadFile(fileId);
      if (!content) return null;

      return JSON.parse(content);
    } catch (error) {
      console.error('Error restoring from Google Drive:', error);
      return null;
    }
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

  // Start automatic backup (every 6 hours)
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

    // Create backup every 6 hours
    this.backupInterval = setInterval(async () => {
      try {
        const data = getDataCallback();
        const backup = this.createBackup(
          data.students,
          data.subjects,
          data.attendanceRecords,
          data.users
        );
        
        // Save to local storage
        this.saveLocalBackup(backup);
        
        // Save to Google Drive if signed in
        if (googleDriveAPI.isUserSignedIn()) {
          await this.saveToGoogleDrive(backup);
        }
      } catch (error) {
        console.error('Error in automatic backup:', error);
      }
    }, 6 * 60 * 60 * 1000); // 6 hours

    // Create initial backup
    setTimeout(async () => {
      try {
        const data = getDataCallback();
        const backup = this.createBackup(
          data.students,
          data.subjects,
          data.attendanceRecords,
          data.users
        );
        this.saveLocalBackup(backup);
        
        // Try to save to Google Drive
        if (googleDriveAPI.isUserSignedIn()) {
          await this.saveToGoogleDrive(backup);
        }
      } catch (error) {
        console.error('Error creating initial backup:', error);
      }
    }, 5000); // 5 seconds delay
  }

  // Stop automatic backup
  stopAutomaticBackup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }

  // Manual Google Drive backup trigger
  async backupToGoogleDrive(data: BackupData): Promise<boolean> {
    try {
      // Initialize Google Drive if not already done
      const initialized = await this.initializeGoogleDrive();
      if (!initialized) return false;

      return await this.saveToGoogleDrive(data);
    } catch (error) {
      console.error('Manual Google Drive backup failed:', error);
      return false;
    }
  }

  // Get Google Drive connection status
  getGoogleDriveStatus(): { connected: boolean; userInfo: any } {
    return {
      connected: googleDriveAPI.isUserSignedIn(),
      userInfo: googleDriveAPI.getUserInfo()
    };
  }

  // Connect to Google Drive
  async connectToGoogleDrive(): Promise<boolean> {
    try {
      const initialized = await this.initializeGoogleDrive();
      if (!initialized) return false;

      return await googleDriveAPI.signIn();
    } catch (error) {
      console.error('Failed to connect to Google Drive:', error);
      return false;
    }
  }

  // Disconnect from Google Drive
  async disconnectFromGoogleDrive(): Promise<void> {
    try {
      await googleDriveAPI.signOut();
    } catch (error) {
      console.error('Failed to disconnect from Google Drive:', error);
    }
  }
}

// Export singleton instance
export const backupManager = BackupManager.getInstance();