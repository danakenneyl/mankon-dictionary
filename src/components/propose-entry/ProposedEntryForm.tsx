'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const ProposeEntryRecord = dynamic(() => import('@/propose-entry/ProposeEntryRecord'), {
  ssr: false,
});

export default function ProposeEntryForm() {
  const [formData, setFormData] = useState({
    mankonWord: '',
    englishWord: '',
  });
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleCheck = () => {
    setChecked(!checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!audioUrl) {
        throw new Error('Please record an audio file before submitting.');
      }

      // Fetch the audio data from the URL
      const audioResponse = await fetch(audioUrl);
      if (!audioResponse.ok) {
        throw new Error('Failed to fetch audio data');
      }

      const audioBlob = await audioResponse.blob();
      const filename = `${formData.mankonWord}_${formData.englishWord}.wav`;
      
      // Create file with proper MIME type
      const audioFile = new File([audioBlob], filename, { 
        type: audioBlob.type || 'audio/wav' 
      });

      // Create and populate form data
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('file', audioFile);
      formDataToSubmit.append('mankonWord', formData.mankonWord);
      formDataToSubmit.append('englishWord', formData.englishWord);

      // Send the request
      const response = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formDataToSubmit,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload successful:', data);

      // Reset form
      setFormData({ mankonWord: '', englishWord: '' });
      setAudioUrl(null);
      
      // You might want to show a success message here
      alert('Entry submitted successfully!');

    } catch (error) {
      console.error('Submission error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-6 bg-white shadow-md rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-6">Propose a New Entry</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="mankonWord" className="block text-sm font-medium text-gray-700 mb-1">
              Mankon Word
            </label>
            <input
              type="text"
              id="mankonWord"
              name="mankonWord"
              placeholder="Enter Mankon word"
              value={formData.mankonWord}
              onChange={handleChange}
              className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="englishWord" className="block text-sm font-medium text-gray-700 mb-1">
              English Translation
            </label>
            <input
              type="text"
              id="englishWord"
              name="englishWord"
              placeholder="Enter English translation"
              value={formData.englishWord}
              onChange={handleChange}
              className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
              disabled={isSubmitting}
            />
          </div>

          <ProposeEntryRecord onRecordingComplete={setAudioUrl} />

          <button
            type="submit"
            className={`w-full rounded transition-colors mt-4 p-2 ${
              isSubmitting
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        <div>
          <span>Words </span>
          <input type="checkbox" checked={checked} onChange={handleCheck} />
        </div>


      </form>
    </div>
  );
}
