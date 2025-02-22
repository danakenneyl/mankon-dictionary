// src/app/api/upload/route.ts
import { writeFile, mkdir, unlink } from 'fs/promises';
import { NextResponse } from 'next/server';
import { join } from 'path';
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

    // Create temp directory
    const tempDir = join(process.cwd(), 'tmp');
    await mkdir(tempDir, { recursive: true }).catch(() => {});

    // Create temp file path
    const tempFilePath = join(tempDir, file.name);

    try {
      // Save file to temp location
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(tempFilePath, buffer);
      console.log('File saved to temp location:', tempFilePath);

      // Upload to Google Drive
      const fileId = await uploadToDrive(tempFilePath, file.name);
      console.log('File uploaded to Google Drive:', fileId);

      // Clean up temp file
      await unlink(tempFilePath).catch(console.error);

      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully',
        fileId: fileId
      });

    } catch (error) {
      // Clean up temp file if it exists
      await unlink(tempFilePath).catch(() => {});

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