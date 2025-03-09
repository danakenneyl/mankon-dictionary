'use client';
import React, { useState, useEffect } from 'react';
import {useRouter} from "next/navigation"
import dynamic from 'next/dynamic';
import {UpdateJson, FetchJson, UploadAudio} from '@/utils/ClientSideAPICalls';

// Dynamic import with SSR disabled
const AudioRecorder = dynamic(
  () => import('@/app/contribute/propose-entry/ProposeEntryRecord'),
  { ssr: false }
);

type PartOfSpeech = 1 | 2 | 3 | null; // 1: Verb, 2: Noun, 3: Adjective

interface WordFormData {
  uniqueId: string;
  mankonWord: string;
  englishTranslation: string;
  wordRecording: string | null;
  partOfSpeech: PartOfSpeech;
  mankonSentence1: string;
  englishSentence1: string;
  sentenceRecording1: string | null;
  mankonSentence2: string;
  englishSentence2: string;
  sentenceRecording2: string | null;
}

export default function MankonWordFormPage() {
  const [formData, setFormData] = useState<WordFormData>({
    uniqueId: '',
    mankonWord: '',
    englishTranslation: '',
    wordRecording: null,
    partOfSpeech: null,
    mankonSentence1: '',
    englishSentence1: '',
    sentenceRecording1: null,
    mankonSentence2: '',
    englishSentence2: '',
    sentenceRecording2: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof WordFormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const router = useRouter();


  // List of required fields for easy reference
  const requiredFields: (keyof WordFormData)[] = [
    'uniqueId',
    'mankonWord',
    'englishTranslation',
    'wordRecording',
    'mankonSentence1',
    'englishSentence1',
    'sentenceRecording1',
    'mankonSentence2',
    'englishSentence2',
    'sentenceRecording2'
  ];

  // Debug effect to monitor recording data changes
  useEffect(() => {
    console.log('Recording state updated:', {
      wordRecording: formData.wordRecording,
      sentenceRecording1: formData.sentenceRecording1,
      sentenceRecording2: formData.sentenceRecording2
    });
  }, [formData.wordRecording, formData.sentenceRecording1, formData.sentenceRecording2]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error if field is edited after attempted submit
    if (attemptedSubmit && errors[name as keyof WordFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handlePartOfSpeechChange = (value: PartOfSpeech) => {
    setFormData((prev) => ({
      ...prev,
      partOfSpeech: value,
    }));
  };

  const handleRecordingComplete = (field: keyof WordFormData, blobUrl: string) => {
    console.log(`Recording completed for ${field}:`, blobUrl);
    
    // Only update if we have a valid URL
    if (blobUrl) {
      setFormData((prev) => {
        const updated = {
          ...prev,
          [field]: blobUrl
        };
        
        // Log inside the state updater to see the actual update
        console.log(`Updated ${field} in formData:`, updated[field]);
        return updated;
      });
      
      // Clear error if recording is added after attempted submit
      if (attemptedSubmit && errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    } else if (blobUrl === "") {
      // Handle clearing a recording
      setFormData(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof WordFormData, string>> = {};
    let isValid = true;
    
    console.log("Validating form data:", formData);
    
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `This field is required`;
        console.log(`Validation error for ${field}: missing value`);
        isValid = false;
      }
    });

    console.log("Validation errors:", newErrors);
    setErrors(newErrors);
    return isValid;
  };

  const formatDataForStorage = () => {
    // Map part of speech number to text
    const mapPartOfSpeech = (pos: PartOfSpeech): string => {
      switch (pos) {
        case 1: return 'verb';
        case 2: return 'noun';
        case 3: return 'adjective';
        default: return '';
      }
    };

    return {
      mankonWord: formData.mankonWord,
      pronunciation: [formData.wordRecording],
      englishWord: [formData.englishTranslation],
      partOfSpeech: mapPartOfSpeech(formData.partOfSpeech),
      mankonSentence: [formData.mankonSentence1, formData.mankonSentence2],
      englishSentence: [formData.englishSentence1, formData.englishSentence2],
      sentenceRecording: [formData.sentenceRecording1, formData.sentenceRecording2],
      contributor: formData.uniqueId
    };
  };

  // Convert blob URL to File object with custom filename
  const getBlobAsFile = async (blobUrl: string | null, fileName: string): Promise<File | null> => {
    if (!blobUrl) return null;
    
    try {
      const response = await fetch(blobUrl);
      const blobData = await response.blob();
      // Create file from the blob with custom name
      return new File([blobData], fileName, { type: 'audio/wav' });
    } catch (error) {
      console.error('Error converting blob to file:', error);
      return null;
    }
  };

  // Function to handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttemptedSubmit(true);
    
    // Validate form before submitting
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    try {
      // Generate custom filenames
      const wordFileName = `${formData.mankonWord}_${formData.englishTranslation}_word_${formData.uniqueId}.wav`;
      const sentence1FileName = `${formData.mankonWord}_${formData.englishTranslation}_sentence1_${formData.uniqueId}.wav`;
      const sentence2FileName = `${formData.mankonWord}_${formData.englishTranslation}_sentence2_${formData.uniqueId}.wav`;

      // If updating proposal is successful, then audio will be sent to Drive
      const wordFile = await getBlobAsFile(formData.wordRecording, wordFileName);
      const sentence1File = await getBlobAsFile(formData.sentenceRecording1, sentence1FileName);
      const sentence2File = await getBlobAsFile(formData.sentenceRecording2, sentence2FileName);

      if (!wordFile || !sentence1File || !sentence2File) {
        throw new Error('Failed to create file from recording');
      }

      // Set file names in form
      formData.wordRecording = wordFileName;
      formData.sentenceRecording1 = sentence1FileName;
      formData.sentenceRecording2 = sentence2FileName;

      // Update Proposal json in Drive
      const proposal = await FetchJson("proposal");

      if (!proposal) {
        throw new Error('Failed to fetch proposal data');
      }

      const formReadyData = formatDataForStorage();
      const response = await UpdateJson("proposal", proposal, formReadyData);
      
      if (response) {
        console.log('File successfully updated on Google Drive');

        const response1 = await UploadAudio(wordFile);
        const response2 = await UploadAudio(sentence1File);
        const response3 = await UploadAudio(sentence2File);

        if (!response1 || !response2 || !response3)  {
          throw new Error('Failed to Upload Audio');
        }

        setFormData({
          uniqueId: '',
          mankonWord: '',
          englishTranslation: '',
          wordRecording: null,
          partOfSpeech: null,
          mankonSentence1: '',
          englishSentence1: '',
          sentenceRecording1: null,
          mankonSentence2: '',
          englishSentence2: '',
          sentenceRecording2: null,
        });
        router.push('/contribute');
      } else {
        throw new Error("Failed to update the file");
      } 
    } catch (error) {
      console.error('Error updating or uploading files:', error);
    } 
  };

  // Helper to check if a field is required
  const isRequired = (fieldName: string): boolean => {
    return requiredFields.includes(fieldName as keyof WordFormData);
  };

  // Function to determine input field class based on validation state
  const getInputClassName = (fieldName: keyof WordFormData): string => {
    const baseClass = "w-full p-2 border rounded";
    return attemptedSubmit && errors[fieldName] 
      ? `${baseClass} border-red-500 outline-red-500` 
      : baseClass;
  };

  return (
    <div className="flex justify-center">
      <div className="content-wrapper">
        <div className="content">
          <h1 className="text-2xl font-bold mb-6">Mankon Word Submission Form</h1>
          {submitted ? (
            <div className="bg-green-100 p-4 rounded-lg mb-6">
              <h2 className="text-green-800 font-medium">Submission Successful!</h2>
              <p className="mt-2">Your word entry has been recorded.</p>
              <button
                onClick={() => {
                  setFormData({
                    uniqueId: '',
                    mankonWord: '',
                    englishTranslation: '',
                    wordRecording: null,
                    partOfSpeech: null,
                    mankonSentence1: '',
                    englishSentence1: '',
                    sentenceRecording1: null,
                    mankonSentence2: '',
                    englishSentence2: '',
                    sentenceRecording2: null,
                  });
                  setSubmitted(false);
                  setAttemptedSubmit(false);
                  setErrors({});
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
              >
                Submit Another Word
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="uniqueId" className="block font-medium mb-1">
                  Unique ID {isRequired('uniqueId') && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  id="uniqueId"
                  name="uniqueId"
                  value={formData.uniqueId}
                  onChange={handleInputChange}
                  className={getInputClassName('uniqueId')}
                />
                {attemptedSubmit && errors.uniqueId && (
                  <p className="text-red-600 text-sm mt-1">{errors.uniqueId}</p>
                )}
              </div>

              <div>
                <label htmlFor="mankonWord" className="block font-medium mb-1">
                  Mankon Word {isRequired('mankonWord') && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  id="mankonWord"
                  name="mankonWord"
                  value={formData.mankonWord}
                  onChange={handleInputChange}
                  className={getInputClassName('mankonWord')}
                />
                {attemptedSubmit && errors.mankonWord && (
                  <p className="text-red-600 text-sm mt-1">{errors.mankonWord}</p>
                )}
              </div>

              <div>
                <label htmlFor="englishTranslation" className="block font-medium mb-1">
                  English Translation {isRequired('englishTranslation') && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  id="englishTranslation"
                  name="englishTranslation"
                  value={formData.englishTranslation}
                  onChange={handleInputChange}
                  className={getInputClassName('englishTranslation')}
                />
                {attemptedSubmit && errors.englishTranslation && (
                  <p className="text-red-600 text-sm mt-1">{errors.englishTranslation}</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Word Recording {isRequired('wordRecording') && <span className="text-red-500">*</span>}
                </label>
                <AudioRecorder
                  instanceId="word-recording"
                  onRecordingComplete={(blobUrl) => handleRecordingComplete('wordRecording', blobUrl)}
                />
                {attemptedSubmit && errors.wordRecording && (
                  <p className="text-red-600 text-sm mt-2">{errors.wordRecording}</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-1">Part of Speech</label>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.partOfSpeech === 1}
                      onChange={() => handlePartOfSpeechChange(formData.partOfSpeech === 1 ? null : 1)}
                      className="mr-2"
                    />
                    Verb (1)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.partOfSpeech === 2}
                      onChange={() => handlePartOfSpeechChange(formData.partOfSpeech === 2 ? null : 2)}
                      className="mr-2"
                    />
                    Noun (2)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.partOfSpeech === 3}
                      onChange={() => handlePartOfSpeechChange(formData.partOfSpeech === 3 ? null : 3)}
                      className="mr-2"
                    />
                    Adjective (3)
                  </label>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Sentence 1</h2>
                <div className="mb-4">
                  <label htmlFor="mankonSentence1" className="block font-medium mb-1">
                    Mankon Sentence {isRequired('mankonSentence1') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    id="mankonSentence1"
                    name="mankonSentence1"
                    value={formData.mankonSentence1}
                    onChange={handleInputChange}
                    className={getInputClassName('mankonSentence1')}
                  />
                  {attemptedSubmit && errors.mankonSentence1 && (
                    <p className="text-red-600 text-sm mt-1">{errors.mankonSentence1}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="englishSentence1" className="block font-medium mb-1">
                    English Translation {isRequired('englishSentence1') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    id="englishSentence1"
                    name="englishSentence1"
                    value={formData.englishSentence1}
                    onChange={handleInputChange}
                    className={getInputClassName('englishSentence1')}
                  />
                  {attemptedSubmit && errors.englishSentence1 && (
                    <p className="text-red-600 text-sm mt-1">{errors.englishSentence1}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Sentence 1 Recording {isRequired('sentenceRecording1') && <span className="text-red-500">*</span>}
                  </label>
                  <AudioRecorder
                    instanceId="sentence-recording-1"
                    onRecordingComplete={(blobUrl) => handleRecordingComplete('sentenceRecording1', blobUrl)}
                  />
                  {attemptedSubmit && errors.sentenceRecording1 && (
                    <p className="text-red-600 text-sm mt-2">{errors.sentenceRecording1}</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Sentence 2</h2>
                <div className="mb-4">
                  <label htmlFor="mankonSentence2" className="block font-medium mb-1">
                    Mankon Sentence {isRequired('mankonSentence2') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    id="mankonSentence2"
                    name="mankonSentence2"
                    value={formData.mankonSentence2}
                    onChange={handleInputChange}
                    className={getInputClassName('mankonSentence2')}
                  />
                  {attemptedSubmit && errors.mankonSentence2 && (
                    <p className="text-red-600 text-sm mt-1">{errors.mankonSentence2}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="englishSentence2" className="block font-medium mb-1">
                    English Translation {isRequired('englishSentence2') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    id="englishSentence2"
                    name="englishSentence2"
                    value={formData.englishSentence2}
                    onChange={handleInputChange}
                    className={getInputClassName('englishSentence2')}
                  />
                  {attemptedSubmit && errors.englishSentence2 && (
                    <p className="text-red-600 text-sm mt-1">{errors.englishSentence2}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Sentence 2 Recording {isRequired('sentenceRecording2') && <span className="text-red-500">*</span>}
                  </label>
                  <AudioRecorder
                    instanceId="sentence-recording-2"
                    onRecordingComplete={(blobUrl) => handleRecordingComplete('sentenceRecording2', blobUrl)}
                  />
                  {attemptedSubmit && errors.sentenceRecording2 && (
                    <p className="text-red-600 text-sm mt-2">{errors.sentenceRecording2}</p>
                  )}
                </div>
              </div>
              <div className="pt-6">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Submit Word Entry
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}