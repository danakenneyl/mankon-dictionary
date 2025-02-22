// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { uploadToDrive } from '@/lib/googleDrive';

export async function POST(request) {
  console.log('Received upload request');

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file received' },
        { status: 400 }
      );
    }

    // Log file details
    console.log('Processing file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    try {
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload directly to Google Drive
      const fileId = await uploadToDrive(buffer, file.name);
      console.log('File uploaded to Google Drive:', fileId);

      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully',
        fileId: fileId
      });

    } catch (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to upload to Google Drive',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}