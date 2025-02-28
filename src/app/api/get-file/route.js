// app/api/get-audio/route.js
import { google } from 'googleapis';

export async function GET(request) {
  try {
    // Get file ID from the request URL
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    
    if (!fileId) {
      return new Response('No file ID provided', { status: 400 });
    }
    
    // Setup authentication
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || ''),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    
    const drive = google.drive({ version: 'v3', auth });
    
    // First, get the file metadata to know its name and MIME type
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: 'name,mimeType',
    });
    
    // Then, download the file
    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media',
    }, { responseType: 'stream' });
    
    // Create a buffer to store the file
    const chunks = [];
    const readable = response.data;
    
    for await (const chunk of readable) {
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);
    
    // Return the file with the correct mime type
    return new Response(buffer, {
      headers: {
        'Content-Type': fileMetadata.data.mimeType,
        'Content-Disposition': `attachment; filename="${fileMetadata.data.name}"`,
      },
    });
  } catch (error) {
    console.error('Download error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    
    return new Response(
      JSON.stringify({
        error: `Failed to download from Google Drive: ${error.message}`,
        details: error.stack
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}