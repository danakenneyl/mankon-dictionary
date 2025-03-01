import { google } from 'googleapis';

export default async function GET(request) {
    try{
        const { searchParams } = new URL(request.url);
        const fileID = searchParams.get('fileID');

        if (!fileID) {
            return new Response('No file ID provided', { status: 400 });
        }

        // Setup authentication
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || ''),
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        // Get file metadata
        const fileMetadata = await drive.files.get({
            fileId: fileId,
            fields: 'name,mimeType',
          });
        // Download the file
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

        
    }
    catch (error) {
        console.error('Upload error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            cause: error.cause
        });
        return new Response(
            JSON.stringify({
                error: `Failed to upload from Google Drive: ${error.message}`,
                details: error.stack
            }),
            { status: 500 }
        );
    }
}