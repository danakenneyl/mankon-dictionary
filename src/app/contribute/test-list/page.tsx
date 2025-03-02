// app/drive-explorer/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { DriveFilesResponse} from '@/components/types/Datatypes';

export default function DriveExplorer() {
  const [data, setData] = useState<DriveFilesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDriveFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/list-file');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Fetched result:', result);
      setData(result);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.log('Error fetching drive files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriveFiles();
  }, []);

  return (
    <div className="flex justify-center">
    <div className="content-wrapper">
      <div className="content">
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Google Drive Explorer</h1>
      
      {loading && <p className="text-lg">Loading files from Google Drive...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> {error}</p>
          {data?.error && <p className="mt-2">API Error: {data.error}</p>}
        </div>
      )}
      
      {!loading && data && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">JSON Files ({data.jsonFiles.length})</h2>
            {data.jsonFiles.length === 0 ? (
              <p className="text-gray-500">No JSON files found</p>
            ) : (
              <ul className="space-y-2">
                {data.jsonFiles.map((file) => (
                  <li key={file.id} className="border-b pb-2">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500 break-all">ID: {file.id}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <button
          onClick={fetchDriveFiles}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Files'}
        </button>
      </div>
    </div>
    </div>
    </div>
    </div>
  );
}