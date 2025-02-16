// upload.js
import fs from 'fs';
import path from 'path';
import getDriveService from './service.js';

const uploadSingleFile = async (fileName, filePath) => {
  const folderId = '1AqHxs-AnqTD8z_virKJpFybOrmJ28EFP';
  const drive = getDriveService(); 
  const { data: { id, name } = {} } = await drive.files.create({
    resource: {
      name: fileName,
      parents: [folderId]
    },
    media: {
      mimeType: 'application/pdf',
      body: fs.createReadStream(filePath)
    },
    fields: 'id,name'
  });
  console.log('File Uploaded', name, id);
};

const scanFolderForFiles = async (folderPath) => {
  const folder = await fs.promises.opendir(folderPath);
  for await (const dirent of folder) {
    if (dirent.isFile() && dirent.name.endsWith('.pdf')) {
      const filePath = path.join(folderPath, dirent.name); 
      await uploadSingleFile(dirent.name, filePath);
      await fs.promises.rm(filePath);
    }
  }
};

export default scanFolderForFiles;
