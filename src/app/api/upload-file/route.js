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

    // Setup authentication
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || ''),
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({version: 'v3',auth});

    // Determine which folder to use based on file type
    let folderId;
    if (file.type.startsWith('audio/')) {
      folderId = process.env.GOOGLE_DRIVE_AUDIO_FOLDER_ID;
      console.log('Uploading audio file to audio folder');
    } else if (file.type === 'application/json') {
      folderId = process.env.GOOGLE_DRIVE_JSON_FOLDER_ID;
      console.log('Uploading JSON file to JSON folder');
    } else {
      // Use default folder for other file types, or you can return an error
      folderId = process.env.GOOGLE_DRIVE_AUDIO_FOLDER_ID; // Using audio folder as default
      console.log(`Uploading ${file.type} file to default folder`);
    }

    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [folderId],
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