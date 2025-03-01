'use client';
import React, { useState, useEffect } from 'react';

interface GoogleDriveFile {
  id: string;
  name: string;
}

interface ListFilesResponse {
  files: GoogleDriveFile[];
}

const FileList: React.FC = () => {
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [folderType, setFolderType] = useState<string>('audio');
  const [fileType, setFileType] = useState<string>('');

  // These would come from your environment variables or configuration
  const folders = {
    audio: process.env.GOOGLE_DRIVE_AUDIO_FOLDER_ID || '',
    json: process.env.GOOGLE_DRIVE_JSON_FOLDER_ID || ''
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const folderId = folders[folderType as keyof typeof folders];
      
      if (!folderId) {
        throw new Error(`No folder ID available for type: ${folderType}`);
      }
      
      const url = `/api/list-files?folderId=${folderId}${fileType ? `&fileType=${fileType}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data: ListFilesResponse = await response.json();
      setFiles(data.files || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [folderType, fileType]);

  const handleFolderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFolderType(e.target.value);
  };

  const handleFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFileType(e.target.value);
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    alert(`File ID copied: ${id}`);
  };

  return (
    <div className="flex justify-center">
    <div className="content-wrapper">
    <div className="content">
      <h2 className="text-xl font-bold mb-4">Google Drive Files</h2>
      
      <div className="mb-4 flex gap-4">
        <div>
          <label htmlFor="folder-type" className="block text-sm font-medium text-gray-700 mb-1">
            Folder Type
          </label>
          <select
            id="folder-type"
            value={folderType}
            onChange={handleFolderChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="audio">Audio Folder</option>
            <option value="json">JSON Folder</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="file-type" className="block text-sm font-medium text-gray-700 mb-1">
            File Type Filter
          </label>
          <select
            id="file-type"
            value={fileType}
            onChange={handleFileTypeChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Files</option>
            <option value="json">JSON Files</option>
            <option value="wav">WAV Files</option>
            <option value="audio">All Audio Files</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <button 
            onClick={fetchFiles}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Refresh Files
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-indigo-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading files...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-red-700">Error loading files: {error}</p>
            </div>
          </div>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No files found in this folder
        </div>
      ) : (
        <div className="overflow-x-auto bg-gray-50 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{file.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{file.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      className="text-green-600 hover:text-green-900"
                      onClick={() => copyToClipboard(file.id)}
                    >
                      Copy ID
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </div>
    </div>
  );
};

export default FileList;