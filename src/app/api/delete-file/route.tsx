// app/api/delete-file/route.tsx
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { fileId } = await request.json();
    if (!fileId) {
      return NextResponse.json(
        { message: 'fileId is required' },
        { status: 400 }
      );
    }

    // Setup authentication
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!credentials) {
      return new NextResponse('Missing Google service account key', { status: 500 });
    }
    
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(credentials),
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    
    const drive = google.drive({
      version: 'v3',
      auth,
    });

    // Delete the file - no content type needed for deletion
    await drive.files.delete({
      fileId: fileId,
    });

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting file:', error);
      return NextResponse.json(
        { message: error.message },
        { status: 404 }
      );
    } else {
      console.error('Unknown error type:', error);
      return NextResponse.json(
        { message: 'An unknown error occurred' },
        { status: 500 }
      );
    }
  }
}