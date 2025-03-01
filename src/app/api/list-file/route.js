// app/api/list-files/route.js
import { google } from 'googleapis';

export async function GET(request) {
  try {
    // Setup authentication
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || ''),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    
    const drive = google.drive({ version: 'v3', auth });
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    const fileType = searchParams.get('fileType'); // Optional: 'json', 'wav', etc.


    
    if (!folderId) {
      return new Response('No folder ID provided', { status: 400 });
    }
    
    // Build the query
    let query = `'${folderId}' in parents and trashed = false`;
    
    // Add file type filter if specified
    if (fileType) {
      if (fileType === 'json') {
        query += " and mimeType='application/json'";
      } else if (fileType === 'wav') {
        query += " and mimeType='audio/wav'";
      } else if (fileType === 'audio') {
        query += " and (mimeType contains 'audio/')";
      }
      // Add more conditions for other file types as needed
    }
    
    // List files in the specified folder
    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
    });
    
    return new Response(JSON.stringify(response.data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('List files error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    
    return new Response(
      JSON.stringify({
        error: `Failed to list files from Google Drive: ${error.message}`,
        details: error.stack
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}