// src/lib/googleDrive.ts
import { google } from 'googleapis';
import { createReadStream } from 'fs';
import path from 'path';

// Replace this with your folder ID where you want to store the audio files
const GOOGLE_DRIVE_FOLDER_ID = '1AqHxs-AnqTD8z_virKJpFybOrmJ28EFP';

// Initialize the Google Drive API client
const initializeDrive = () => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), 'credentials', 'secret.json'),
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Failed to initialize Google Drive client:', error);
    throw new Error('Failed to initialize Google Drive');
  }
};

export const uploadToDrive = async (filePath: string, fileName: string): Promise<string> => {
  try {
    const drive = initializeDrive();

    const fileMetadata = {
      name: fileName,
      parents: [GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: 'audio/wav',
      body: createReadStream(filePath),
    };

    console.log('Uploading file to Google Drive:', { fileName, filePath });

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,webViewLink',
    });

    if (!response.data.id) {
      throw new Error('Failed to get file ID from Google Drive');
    }

    console.log('File uploaded successfully:', response.data);
    return response.data.id;

  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to upload to Google Drive');
  }
};