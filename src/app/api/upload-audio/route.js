// app/api/upload-audio/route.js
import { google } from 'googleapis';
import { PassThrough } from 'stream';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return new Response('No file provided', { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a PassThrough stream
    const stream = new PassThrough();
    stream.end(buffer);

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || ''),
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: 'id,name,webViewLink',
    });

    console.log('Upload successful:', response.data);

    return new Response(JSON.stringify(response.data), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Upload error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });

    return new Response(
      JSON.stringify({ 
        error: `Failed to upload to Google Drive: ${error.message}`,
        details: error.stack
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}