import { google } from 'googleapis';
import { NextResponse } from 'next/server';

// If you're using the App Router (Next.js 13+)
export async function POST(request: Request) {
  try {
    const { fileId, content } = await request.json();
    
    if (!fileId || !content) {
      return NextResponse.json(
        { message: 'fileId and content are required' },
        { status: 400 }
      );
    }

    // Set up authentication
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({
      version: 'v3',
      auth,
    });

    // Convert content to a Buffer
    const contentBuffer = Buffer.from(content);

    // Update the file
    const response = await drive.files.update({
      fileId: fileId,
      media: {
        mimeType: 'application/json',
        body: contentBuffer,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'File updated successfully',
      data: response.data
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
        console.error('Error updating file:', error.message);
        return NextResponse.json(
          { message: error.message },
          { status: 500 }
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