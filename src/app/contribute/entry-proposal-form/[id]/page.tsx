'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { db } from "@/utils/firebase";
import { UploadAudio } from '@/utils/ClientSideAPICalls';
import { ref, get, set, update, push } from "firebase/database";
import "@/styles/contribute.css";

// Dynamic import with SSR disabled
const AudioRecorder = dynamic(
  () => import('@/app/contribute/entry-proposal-form/[id]/ProposeEntryRecord'),
  { ssr: false }
);

interface WordProposal {
  mankonWord: string;
  translatedWord: string[];
  pairWord: string[];
  status: string;
  createdAt: string;
  lastUpdated: string;
  audioWord: string;
  contributorUUID: string;
  // Optional fields
  audioSentence: string[];
  mankonSentence?: string[];
  translatedSentence?: string[];
}

interface Contributor {
  contribution: string[];
  createdAt: string;
  lastModifiedAt: string;
  password: string;
  username: string;
}

export default function MankonWordFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEmptyForm = id === "0";
  const router = useRouter();

  // Authentication states
  const [username, setUsername] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authenticating, setAuthenticating] = useState(false);

  const [formData, setFormData] = useState<WordProposal>({
    mankonWord: "",
    translatedWord: [],
    pairWord: [],
    status: "",
    createdAt: "",
    lastUpdated: "",
    audioWord: "",
    contributorUUID: "",
    // Optional fields
    audioSentence: [],
    mankonSentence: [],
    translatedSentence: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof WordProposal, string>>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // List of required fields for easy reference
  const requiredFields: (keyof WordProposal)[] = [
    'mankonWord',
    'translatedWord',
    'audioWord',
    'audioSentence'
  ];

  // Authenticate user and get UUID
  const authenticateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticating(true);
    setAuthError("");
    
    try {
      // Get reference to users in database
      const usersRef = ref(db, 'contributors');
      const snapshot = await get(usersRef);
      let UUID: string | null = null;
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        let foundUser: Contributor | null = null;
        // Find the user by username
        Object.keys(users).forEach(key => {
          if (users[key].username === username) {
            foundUser = {
              ...users[key],
            };
            UUID = key;
          }
        });
        
        if (foundUser) {
          // Set authentication state
          setIsAuthenticated(true);
          
          // Set contributor UUID in form data
          setFormData(prev => ({
            ...prev,
            contributorUUID: UUID as string,
          }));
        } else {
          setAuthError("Username not found. Please try again.");
        }
      } else {
        setAuthError("No users found in the database.");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setAuthError("Error authenticating user. Please try again.");
    } finally {
      setAuthenticating(false);
    }
  };

  // Fetch existing proposal if ID is not 0
  useEffect(() => {
    const fetchProposal = async () => {
      if (!isEmptyForm && isAuthenticated) {
        try {
          const proposalRef = ref(db, `proposals/${id}`);
          const snapshot = await get(proposalRef);
          
          if (snapshot.exists()) {
            const proposalData = snapshot.val();
            setFormData(proposalData);
          } else {
            console.log("No proposal found with ID:", id);
            // Optional: redirect to 404 or empty form
          }
        } catch (error) {
          console.error("Error fetching proposal:", error);
        }
      }

    };

    if (isAuthenticated) {
      fetchProposal();
    }
  }, [id, isAuthenticated, isEmptyForm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle array fields
    if (name.includes('[')) {
      const fieldName = name.split('[')[0];
      const index = parseInt(name.split('[')[1].split(']')[0]);
      
      setFormData((prev) => {
        const updatedArray = [...(prev[fieldName as keyof WordProposal] as string[] || [])];
        updatedArray[index] = value;
        
        return {
          ...prev,
          [fieldName]: updatedArray,
        };
      });
    } else if (name === "translatedWord") {
      // Handle translatedWord as array
      setFormData((prev) => ({
        ...prev,
        [name]: value.split(","), // Store as array with multiple elements
      }));
    } else {
      // Handle regular fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error if field is edited after attempted submit
    if (attemptedSubmit && errors[name as keyof WordProposal]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleRecordingComplete = (field: keyof WordProposal, blobUrl: string, index?: number) => {
    
    // Only update if we have a valid URL
    if (blobUrl) {
      setFormData((prev) => {
        // Handle array fields like audioSentence
        if (index !== undefined && Array.isArray(prev[field])) {
          const updatedArray = [...(prev[field] as string[])];
          updatedArray[index] = blobUrl;
          
          return {
            ...prev,
            [field]: updatedArray
          };
        } else {
          // Handle single value fields
          return {
            ...prev,
            [field]: blobUrl
          };
        }
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
      setFormData(prev => {
        if (index !== undefined && Array.isArray(prev[field])) {
          const updatedArray = [...(prev[field] as string[])];
          updatedArray[index] = "";
          
          return {
            ...prev,
            [field]: updatedArray
          };
        } else {
          return {
            ...prev,
            [field]: ""
          };
        }
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof WordProposal, string>> = {};
    let isValid = true;
    
    requiredFields.forEach((field) => {
      if (Array.isArray(formData[field])) {
        // For array fields, check if array is empty or has empty values
        const arr = formData[field] as string[];
        if (!arr.length || !arr.some(item => item)) {
          newErrors[field] = `This field is required`;
          console.log(`Validation error for ${field}: missing value in array`);
          isValid = false;
        }
      } else if (!formData[field]) {
        newErrors[field] = `This field is required`;
        console.log(`Validation error for ${field}: missing value`);
        isValid = false;
      }
    });

    console.log("Validation errors:", newErrors);
    setErrors(newErrors);
    return isValid;
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
    if (attemptedSubmit) return;
    event.preventDefault();
    setAttemptedSubmit(true);
    
    // Validate form before submitting
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    try {
      // Generate timestamps
      const now = new Date().toISOString();
      
      // Prepare proposal data
      const proposalData = {
        ...formData,
        status: "pending",
        lastUpdated: now
      };
      
      // If it's a new form, add createdAt timestamp
      if (isEmptyForm) {
        proposalData.createdAt = now;
        
        // Generate custom filenames for new submissions
        const wordFileName = `${formData.mankonWord}_${formData.translatedWord[0]}_word_${formData.contributorUUID}.wav`;
        const sentence1FileName = `${formData.mankonWord}_${formData.translatedWord[0]}_sentence1_${formData.contributorUUID}.wav`;
        const sentence2FileName = `${formData.mankonWord}_${formData.translatedWord[0]}_sentence2_${formData.contributorUUID}.wav`;

        // Get files from blob URLs
        const wordFile = await getBlobAsFile(formData.audioWord as string, wordFileName);
        const sentence1File = await getBlobAsFile(formData.audioSentence[0], sentence1FileName);
        const sentence2File = formData.audioSentence[1] ? 
          await getBlobAsFile(formData.audioSentence[1], sentence2FileName) : null;

        if (!wordFile || !sentence1File) {
          throw new Error('Failed to create file from recording');
        }

        // Set file names in form data
        proposalData.audioWord = wordFileName;
        proposalData.audioSentence[0] = sentence1FileName;
        if (sentence2File) {
          proposalData.audioSentence[1] = sentence2FileName;
        }
        
        // Save to Firebase
        const newProposalRef = push(ref(db, `proposals`)); 
        await set(newProposalRef, proposalData);

        console.log("Converted files:", {
          wordFile, sentence1File, sentence2File
        });
        
        await UploadAudio(wordFile);
        await UploadAudio(sentence1File);
        if (sentence2File) await UploadAudio(sentence2File);
        
      } else {
        // Update existing proposal
        const proposalRef = ref(db, `proposals/${id}`);
        await update(proposalRef, proposalData);
      }
      
      router.push("/contribute");
    } catch (error) {
      console.error('Error saving proposal:', error);
      alert("Error saving your submission. Please try again.");
    } finally {
      setAttemptedSubmit(false); // Reset submission state regardless of outcome
    }
  };

  // Helper to check if a field is required
  const isRequired = (fieldName: string): boolean => {
    return requiredFields.includes(fieldName as keyof WordProposal);
  };

  // Function to determine input field class based on validation state
  const getInputClassName = (fieldName: keyof WordProposal): string => {
    const baseClass = "w-full p-2 border rounded";
    return attemptedSubmit && errors[fieldName] 
      ? `${baseClass} border-red-500 outline-red-500` 
      : baseClass;
  };

  if (!isAuthenticated) {
    return (
      <div className="content-wrapper">
      <div className="content">
          <h1 className="text-2xl font-bold mb-6 text-center">Contributor Login</h1>
          <form onSubmit={authenticateUser} className="space-y-6">
            <div>
              <label htmlFor="username" className="block font-medium mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            {authError && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md">
                {authError}
              </div>
            )}
            <button
              type="submit"
              disabled={authenticating}
              className="button w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {authenticating ? "Authenticating..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="content-wrapper w-full max-w-4xl p-6">
        <div className="content bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              Entry Proposal
            </h1>
            <p>Required answers are marked with an asterisk *</p>
            <div className="text-sm text-gray-600">
              Logged in as: <span className="font-semibold">{username}</span>
            </div>
          </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* MANKON WORD */}
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
              
              {/* ENGLISH TRANSLATION */}
              <div>
                <label htmlFor="translatedWord" className="block font-medium mb-1">
                  Translation {isRequired('translatedWord') && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  id="translatedWord"
                  name="translatedWord"
                  value={formData.translatedWord[0] || ''}
                  onChange={handleInputChange}
                  className={getInputClassName('translatedWord')}
                />
                {attemptedSubmit && errors.translatedWord && (
                  <p className="text-red-600 text-sm mt-1">{errors.translatedWord}</p>
                )}
              </div>
              
              {/* WORD RECORDING */}
              <div>
                <label className="block font-medium mb-1">
                  Word Recording {isRequired('audioWord') && <span className="text-red-500">*</span>}
                </label>
                <AudioRecorder
                  instanceId="audio-word"
                  onRecordingComplete={(blobUrl) => handleRecordingComplete('audioWord', blobUrl)}
                />
                {attemptedSubmit && errors.audioWord && (
                  <p className="text-red-600 text-sm mt-2">{errors.audioWord}</p>
                )}
              </div>
              
              {/* MANKON FIRST SENTENCE */}
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Sentence 1</h2>
                <div className="mb-4">
                  <label htmlFor="mankonSentence0" className="block font-medium mb-1">
                    Mankon Sentence
                  </label>
                  <input
                    type="text"
                    id="mankonSentence0"
                    name="mankonSentence[0]"
                    value={formData.mankonSentence?.[0] || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                {/* TRANSLATED FIRST SENTENCE */}
                <div className="mb-4">
                  <label htmlFor="translatedSentence0" className="block font-medium mb-1">
                    English Translation
                  </label>
                  <input
                    type="text"
                    id="translatedSentence0"
                    name="translatedSentence[0]"
                    value={formData.translatedSentence?.[0] || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                {/* FIRST SENTENCE RECORDING */}
                <div>
                  <label className="block font-medium mb-1">
                    Sentence 1 Recording {isRequired('audioSentence') && <span className="text-red-500">*</span>}
                  </label>
                  <AudioRecorder
                    instanceId="sentence-recording-1"
                    onRecordingComplete={(blobUrl) => handleRecordingComplete('audioSentence', blobUrl, 0)}
                  />
                  {attemptedSubmit && errors.audioSentence && (
                    <p className="text-red-600 text-sm mt-2">{errors.audioSentence}</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Sentence 2</h2>
                <div className="mb-4">
                  <label htmlFor="mankonSentence1" className="block font-medium mb-1">
                    Mankon Sentence
                  </label>
                  <input
                    type="text"
                    id="mankonSentence1"
                    name="mankonSentence[1]"
                    value={formData.mankonSentence?.[1] || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="translatedSentence1" className="block font-medium mb-1">
                    English Translation
                  </label>
                  <input
                    type="text"
                    id="translatedSentence1"
                    name="translatedSentence[1]"
                    value={formData.translatedSentence?.[1] || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    Sentence 2 Recording *
                  </label>
                  <AudioRecorder
                    instanceId="sentence-recording-2"
                    onRecordingComplete={(blobUrl) => handleRecordingComplete('audioSentence', blobUrl, 1)}
                  />
                </div>
              </div>
              
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={attemptedSubmit}
                  className="button px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {attemptedSubmit ? "Submitting..." : "Submit Word Entry"}
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}