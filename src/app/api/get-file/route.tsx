// app/api/get-file/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get file ID from the request URL
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    
    if (!fileId) {
      return new NextResponse('No file ID provided', { status: 400 });
    }
    
    // Setup authentication
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!credentials) {
      return new NextResponse('Missing Google service account key', { status: 500 });
    }
    
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(credentials),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    
    const drive = google.drive({ version: 'v3', auth });
    
    // First, get the file metadata to know its name and MIME type
    const fileMetadata = await drive.files.get({
      fileId,
      fields: 'name,mimeType',
    });
    
    const fileName = fileMetadata.data.name || 'unknown';
    const mimeType = fileMetadata.data.mimeType || 'application/octet-stream';
    
    // Then, download the file
    const response = await drive.files.get({
      fileId,
      alt: 'media',
    }, { responseType: 'stream' });
    
    // Create a buffer to store the file
    const chunks: Buffer[] = [];
    const readable = response.data;
    
    for await (const chunk of readable) {
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);
    
    // Return the file with the correct mime type
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Download error details:', err.message);
    
    return new NextResponse(
      JSON.stringify({
        error: `Failed to download from Google Drive: ${err.message}`,
        details: err.stack,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}