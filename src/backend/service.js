// service.js
import { google } from 'googleapis';
import path from 'path';

const getDriveService = () => {
  const KEYFILEPATH = path.join(path.dirname(new URL(import.meta.url).pathname), 'secret.json');
  const SCOPES = ['https://www.googleapis.com/auth/drive'];

  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES
  });
  const driveService = google.drive({ version: 'v3', auth });
  return driveService;
};

export default getDriveService