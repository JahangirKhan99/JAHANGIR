// Google Drive API Integration
export interface GoogleDriveConfig {
  apiKey: string;
  clientId: string;
  discoveryDoc: string;
  scopes: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  size: string;
}

export class GoogleDriveAPI {
  private static instance: GoogleDriveAPI;
  private gapi: any = null;
  private isInitialized = false;
  private isSignedIn = false;
  private config: GoogleDriveConfig = {
    apiKey: 'AIzaSyBvOkBwNQI6dT0HeBADx83dJOhEI00Rp7s', // Your API Key
    clientId: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com', // Your Client ID
    discoveryDoc: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
    scopes: 'https://www.googleapis.com/auth/drive.file'
  };

  static getInstance(): GoogleDriveAPI {
    if (!GoogleDriveAPI.instance) {
      GoogleDriveAPI.instance = new GoogleDriveAPI();
    }
    return GoogleDriveAPI.instance;
  }

  // Initialize Google API
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Load Google API script
      await this.loadGoogleAPI();
      
      // Initialize gapi
      await new Promise((resolve) => {
        this.gapi.load('auth2:client', resolve);
      });

      await this.gapi.client.init({
        apiKey: this.config.apiKey,
        clientId: this.config.clientId,
        discoveryDocs: [this.config.discoveryDoc],
        scope: this.config.scopes
      });

      this.isInitialized = true;
      this.isSignedIn = this.gapi.auth2.getAuthInstance().isSignedIn.get();
      
      console.log('Google Drive API initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Drive API:', error);
      return false;
    }
  }

  // Load Google API script dynamically
  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        this.gapi = window.gapi;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        this.gapi = window.gapi;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Sign in to Google Drive
  async signIn(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const authInstance = this.gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }

      this.isSignedIn = true;
      console.log('Successfully signed in to Google Drive');
      return true;
    } catch (error) {
      console.error('Failed to sign in to Google Drive:', error);
      return false;
    }
  }

  // Sign out from Google Drive
  async signOut(): Promise<void> {
    try {
      if (this.isInitialized && this.isSignedIn) {
        await this.gapi.auth2.getAuthInstance().signOut();
        this.isSignedIn = false;
        console.log('Successfully signed out from Google Drive');
      }
    } catch (error) {
      console.error('Failed to sign out from Google Drive:', error);
    }
  }

  // Check if user is signed in
  isUserSignedIn(): boolean {
    return this.isSignedIn && this.gapi?.auth2?.getAuthInstance()?.isSignedIn?.get();
  }

  // Get user info
  getUserInfo(): any {
    if (!this.isUserSignedIn()) return null;
    
    const profile = this.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
    return {
      id: profile.getId(),
      name: profile.getName(),
      email: profile.getEmail(),
      imageUrl: profile.getImageUrl()
    };
  }

  // Create folder in Google Drive
  async createFolder(name: string, parentId?: string): Promise<string | null> {
    try {
      if (!this.isUserSignedIn()) {
        await this.signIn();
      }

      const metadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined
      };

      const response = await this.gapi.client.drive.files.create({
        resource: metadata
      });

      console.log('Folder created:', response.result.id);
      return response.result.id;
    } catch (error) {
      console.error('Failed to create folder:', error);
      return null;
    }
  }

  // Upload file to Google Drive
  async uploadFile(
    fileName: string, 
    content: string, 
    mimeType: string = 'application/json',
    folderId?: string
  ): Promise<string | null> {
    try {
      if (!this.isUserSignedIn()) {
        await this.signIn();
      }

      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";

      const metadata = {
        name: fileName,
        parents: folderId ? [folderId] : undefined
      };

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + mimeType + '\r\n\r\n' +
        content +
        close_delim;

      const request = this.gapi.client.request({
        path: 'https://www.googleapis.com/upload/drive/v3/files',
        method: 'POST',
        params: { uploadType: 'multipart' },
        headers: {
          'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        body: multipartRequestBody
      });

      const response = await request;
      console.log('File uploaded:', response.result.id);
      return response.result.id;
    } catch (error) {
      console.error('Failed to upload file:', error);
      return null;
    }
  }

  // Update existing file
  async updateFile(
    fileId: string,
    content: string,
    mimeType: string = 'application/json'
  ): Promise<boolean> {
    try {
      if (!this.isUserSignedIn()) {
        await this.signIn();
      }

      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";

      const multipartRequestBody =
        delimiter +
        'Content-Type: ' + mimeType + '\r\n\r\n' +
        content +
        close_delim;

      const request = this.gapi.client.request({
        path: `https://www.googleapis.com/upload/drive/v3/files/${fileId}`,
        method: 'PATCH',
        params: { uploadType: 'media' },
        headers: {
          'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        body: multipartRequestBody
      });

      await request;
      console.log('File updated:', fileId);
      return true;
    } catch (error) {
      console.error('Failed to update file:', error);
      return false;
    }
  }

  // List files in Google Drive
  async listFiles(folderId?: string, query?: string): Promise<DriveFile[]> {
    try {
      if (!this.isUserSignedIn()) {
        await this.signIn();
      }

      let searchQuery = '';
      if (folderId) {
        searchQuery += `'${folderId}' in parents`;
      }
      if (query) {
        searchQuery += searchQuery ? ` and ${query}` : query;
      }

      const response = await this.gapi.client.drive.files.list({
        q: searchQuery,
        fields: 'files(id,name,mimeType,createdTime,modifiedTime,size)',
        orderBy: 'modifiedTime desc'
      });

      return response.result.files || [];
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  // Download file content
  async downloadFile(fileId: string): Promise<string | null> {
    try {
      if (!this.isUserSignedIn()) {
        await this.signIn();
      }

      const response = await this.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      return response.body;
    } catch (error) {
      console.error('Failed to download file:', error);
      return null;
    }
  }

  // Delete file
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      if (!this.isUserSignedIn()) {
        await this.signIn();
      }

      await this.gapi.client.drive.files.delete({
        fileId: fileId
      });

      console.log('File deleted:', fileId);
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  // Find file by name
  async findFileByName(fileName: string, folderId?: string): Promise<DriveFile | null> {
    try {
      const files = await this.listFiles(folderId, `name='${fileName}'`);
      return files.length > 0 ? files[0] : null;
    } catch (error) {
      console.error('Failed to find file:', error);
      return null;
    }
  }
}

// Export singleton instance
export const googleDriveAPI = GoogleDriveAPI.getInstance();

// Extend window object for TypeScript
declare global {
  interface Window {
    gapi: any;
  }
}