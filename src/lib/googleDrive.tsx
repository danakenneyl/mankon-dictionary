// src/lib/googleDrive.ts
import { google } from 'googleapis';

// Function to get credentials from environment variable
const getCredentials = () => {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentials) {
    throw new Error('Google service account credentials not found');
  }
  
  try {
    // Parse the JSON string from environment variable
    return JSON.parse(credentials);
  } catch (error) {
    throw new Error('Failed to parse Google service account credentials');
  }
};

// Initialize the Google Drive API client
const initializeDrive = () => {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error('Google Drive folder ID not configured');
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: getCredentials(),
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });

    return {
      drive: google.drive({ version: 'v3', auth }),
      folderId
    };
  } catch (error) {
    console.error('Drive initialization error:', error);
    throw new Error(`Failed to initialize Google Drive: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const uploadToDrive = async (buffer: Buffer, fileName: string): Promise<string> => {
  console.log('Starting upload process for:', fileName);
  
  try {
    const { drive, folderId } = initializeDrive();

    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };

    const media = {
      mimeType: 'audio/wav',
      body: buffer
    };

    console.log('Uploading to Google Drive:', { fileName });

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,webViewLink'
    });

    if (!response.data.id) {
      throw new Error('No file ID returned from Google Drive');
    }

    console.log('Upload successful:', {
      fileId: response.data.id,
      link: response.data.webViewLink
    });

    return response.data.id;

  } catch (error) {
    console.error('Upload error details:', error);
    throw new Error(`Failed to upload to Google Drive: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};