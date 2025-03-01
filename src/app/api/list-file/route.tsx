// app/api/driveFiles/route.ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Define types
type DriveFile = {
  id: string;
  name: string;
};

type DriveFilesResponse = {
  audioFiles: DriveFile[];
  jsonFiles: DriveFile[];
  error?: string;
};

export async function GET() : Promise<NextResponse<DriveFilesResponse>> {
  try {
    
    // Setup Google Auth
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || ''),
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });

    // Create Drive client
    const drive = google.drive({ version: 'v3', auth });

    // Function to fetch files from a folder
    const getFilesFromFolder = async (folderId: string): Promise<DriveFile[]> => {
      if (!folderId) {
        throw new Error(`Folder ID is not defined`);
      }

      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name)',
        pageSize: 1000,
      });

      return response.data.files as DriveFile[] || [];
    };

    // Fetch files in parallel
    // Modify your code to handle errors for each folder separately
    let audioFiles: DriveFile[] = [];
    let jsonFiles: DriveFile[] = [];

    try {
      audioFiles = await getFilesFromFolder(process.env.GOOGLE_DRIVE_AUDIO_FOLDER_ID || '');
    } catch (error) {
      console.log('Error fetching audio files:', error);
    }

    try {
      jsonFiles = await getFilesFromFolder(process.env.GOOGLE_DRIVE_JSON_FOLDER_ID || '');
    } catch (error) {
      console.log('Error fetching JSON files:', error);
    }

    return NextResponse.json({ audioFiles, jsonFiles });

  } catch (error) {
    console.log('Error fetching Google Drive files:', error);
    return NextResponse.json(
      {
        audioFiles: [],
        jsonFiles: [],
        error: `Failed to fetch files: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    );
  }
}