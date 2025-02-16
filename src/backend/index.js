// index.js
import scanFolderForFiles from './upload.js';

scanFolderForFiles('fake_pdfs').then(() => {
  console.log('🔥 All files have been uploaded to Google Drive successfully!');
});