// app/api/update-file/route.tsx
import { google } from 'googleapis';
import { NextResponse } from 'next/server';



// If you're using the App Router (Next.js 13+)
export async function POST(request: Request) {

  try {

    const { file, content } = await request.json();
    
    if (!file || !content) {
      return NextResponse.json(
        { message: 'fileId and content are required' },
        { status: 400 }
      );
    }
    // Get file ID from the request URL
    if (!file) {
      return new NextResponse('No file ID provided', { status: 400 });
    }
    let fileId: string | undefined;

    if (file === 'demographic') {
        fileId = process.env.GOOGLE_DRIVE_DEMOGRAPHIC_FILE_ID;
    } else if (file === 'proposal') {
        fileId = process.env.GOOGLE_DRIVE_PROPOSAL_FILE_ID;
    } else if (file === 'dictionary') {
        fileId = process.env.GOOGLE_DRIVE_DICTIONARY_FILE_ID;
    } else {
        return new NextResponse('Invalid file ID provided', { status: 400 });
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
        console.error('Error updating file:', error);
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