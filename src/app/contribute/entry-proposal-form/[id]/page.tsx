'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { db } from "@/utils/firebase";
import { UploadAudio } from '@/utils/ClientSideAPICalls';
import { ref, get, set, update, push } from "firebase/database";
import '@/styles/typing-mankon.css'

// Dynamic import with SSR disabled
const AudioRecorder = dynamic(
  () => import('@/app/contribute/entry-proposal-form/[id]/ProposeEntryRecord'),
  { ssr: false }
);

// Updated interface to match the new requirements
interface WordProposal {
  altSpelling?: string;
  contributorUUID: string;
  createdAt: string;
  lastModifiedAt: string;
  mankonSentences?: string[];
  mankonWord: string;
  pairWords?: string[];
  sentenceAudioFileIds: string[];
  sentenceAudioFilenames: string[];
  translatedSentences?: string[];
  translatedWord: string;
  type?: string;
  wordAudioFileIds: string[];
  wordAudioFilenames: string[];
  status: string;
}

interface Contributor {
  contribution: string[];
  createdAt: string;
  lastModifiedAt: string;
  password: string;
  username: string;
  role: string;
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
    altSpelling: "",
    contributorUUID: "",
    createdAt: "",
    lastModifiedAt: "",
    mankonSentences: [],
    mankonWord: "",
    pairWords: [],
    sentenceAudioFileIds: [],
    sentenceAudioFilenames: [],
    translatedSentences: [],
    translatedWord: "",
    type: "",
    wordAudioFileIds: [],
    wordAudioFilenames: [],
    status:  "pending",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof WordProposal, string>>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // List of required fields for easy reference
  const requiredFields: (keyof WordProposal)[] = [
    'mankonWord',
    'translatedWord',
    // Audio fields will be validated separately
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
    } else if (name === "pairWords") {
      // Handle pairWords as array
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

  const handleRecordingComplete = (field: string, blobUrl: string, index?: number) => {
    // Determine the correct field name based on what's being recorded
    let targetField: keyof WordProposal;
    
    if (field === 'wordAudio') {
      targetField = 'wordAudioFileIds';
    } else if (field === 'sentenceAudio') {
      targetField = 'sentenceAudioFilenames';
    } else {
      // Unknown field
      console.error(`Unknown recording field: ${field}`);
      return;
    }
    
    // Only update if we have a valid URL
    if (blobUrl) {
      setFormData((prev) => {
        // Handle array fields
        if (index !== undefined) {
          const updatedArray = [...(prev[targetField] || [])];
          // Ensure the array is large enough
          while (updatedArray.length <= index) {
            updatedArray.push('');
          }
          updatedArray[index] = blobUrl;
          
          return {
            ...prev,
            [targetField]: updatedArray
          };
        } else {
          // Handle single value fields (word audio)
          return {
            ...prev,
            [targetField]: [blobUrl] // Store as array with single element
          };
        }
      });
      
      // Clear error if recording is added after attempted submit
      if (attemptedSubmit && errors[targetField]) {
        setErrors((prev) => ({
          ...prev,
          [targetField]: undefined,
        }));
      }
    } else if (blobUrl === "") {
      // Handle clearing a recording
      setFormData(prev => {
        if (index !== undefined) {
          const updatedArray = [...(prev[targetField] || [])];
          if (index < updatedArray.length) {
            updatedArray[index] = "";
          }
          
          return {
            ...prev,
            [targetField]: updatedArray
          };
        } else {
          return {
            ...prev,
            [targetField]: [""]
          };
        }
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof WordProposal, string>> = {};
    let isValid = true;
    
    // Validate required text fields
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `This field is required`;
        console.log(`Validation error for ${field}: missing value`);
        isValid = false;
      }
    });

    // Validate word audio
    if (!formData.wordAudioFileIds || !formData.wordAudioFileIds.length || !formData.wordAudioFileIds[0]) {
      newErrors['wordAudioFileIds'] = 'Word audio recording is required';
      isValid = false;
    }

    // Validate at least one sentence audio
    if (!formData.sentenceAudioFilenames || !formData.sentenceAudioFilenames.length || 
        !formData.sentenceAudioFilenames.some(url => !!url)) {
      newErrors['sentenceAudioFilenames'] = 'At least one sentence audio recording is required';
      isValid = false;
    }
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
    event.preventDefault();
    setAttemptedSubmit(true);
    
    // Step 1: Validate form before submitting
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    try {
      // Generate timestamps
      const now = new Date().toISOString();
      
      // Step 2: Prepare proposal data
      const proposalData: WordProposal = {
        ...formData,
        lastModifiedAt: now,
        // // Initialize these as empty arrays if they don't exist yet
        // wordAudioFileIds: [],
        // wordAudioFilenames: [],
        // sentenceAudioFileIds: [],
        // sentenceAudioFilenames: [],
      };
      
      // If it's a new form, add createdAt timestamp
      if (isEmptyForm) {
        proposalData.createdAt = now;
      }

      // Generate custom filenames for audio files
      const wordFileName = `${formData.mankonWord}_${formData.translatedWord}_word_${formData.contributorUUID}.wav`;
      
      // Get word audio file from blob URL
      const wordAudioBlob = formData.wordAudioFileIds[0]; // This would be the blob URL in the current state
      const wordFile = await getBlobAsFile(wordAudioBlob, wordFileName);
      
      if (!wordFile) {
        throw new Error('Failed to create word audio file from recording');
      }
      
      // Step 3: Upload audio files to drive
      // Upload word audio
      const wordFileId = await UploadAudio(wordFile);
      if (wordFileId === null) {
        throw new Error('Failed to upload word audio file');
      }
      
      // Set word audio filename in form data
      proposalData.wordAudioFilenames = [wordFileName];
      proposalData.wordAudioFileIds = [wordFileId]; 
      
      // Get and upload sentence audio files
      const sentenceFilenames: string[] = [];
      const sentenceFileIds: string[] = [];
      
      // Process each sentence audio file
      for (let i = 0; i < (formData.sentenceAudioFilenames?.length || 0); i++) {
        const blobUrl = formData.sentenceAudioFilenames[i];
        if (blobUrl) {
          const sentenceFileName = `${formData.mankonWord}_${formData.translatedWord}_sentence${i+1}_${formData.contributorUUID}.wav`;
          const sentenceFile = await getBlobAsFile(blobUrl, sentenceFileName);
          
          if (sentenceFile) {
            // Upload each sentence audio file
            const sentenceResponse = await UploadAudio(sentenceFile);
            if (sentenceResponse===null) {
              throw new Error(`Failed to upload sentence audio file ${i+1}`);
            }
            
            sentenceFilenames.push(sentenceFileName);
            sentenceFileIds.push(sentenceResponse); 
          }
        }
      }
      
      // Set sentence audio filenames and IDs in proposal data
      proposalData.sentenceAudioFilenames = sentenceFilenames;
      proposalData.sentenceAudioFileIds = sentenceFileIds;
      
      // Step 5: Update status
      setFormData((prev) => ({
        ...prev,
        "status": "pending",
      }));

      // Step 6: Save proposal to Firebase
      let proposalRef;

      if (isEmptyForm) {
        // Create a new one
        proposalRef = push(ref(db, 'proposals'));
        await set(proposalRef, proposalData);
        console.log('New proposal created successfully');
      } else {
        // Update existing
        proposalRef = ref(db, `proposals/${id}`);
        await update(proposalRef, proposalData);
        console.log('Existing proposal updated successfully');
      }
      
      // Navigate back to contribute page on success
      router.push("/contribute/propose-dictionary-entry");
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
    <div className="content-wrapper">
      <div className="content">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Entry Proposal Form
        </h1>
        <p>Required answers are marked with an asterisk.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Word Information */}
          <div className="mb-4">
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
              placeholder="Enter Mankon word"
            />
            {errors.mankonWord && (
              <p className="text-red-500 text-sm mt-1">{errors.mankonWord}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="translatedWord" className="block font-medium mb-1">
              English Translation {isRequired('translatedWord') && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              id="translatedWord"
              name="translatedWord"
              value={formData.translatedWord}
              onChange={handleInputChange}
              className={getInputClassName('translatedWord')}
              placeholder="Enter English translation"
            />
            {errors.translatedWord && (
              <p className="text-red-500 text-sm mt-1">{errors.translatedWord}</p>
            )}
          </div>

          {/* Word Audio Recording */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Word Audio Recording</h3>
            <p className="text-sm text-gray-600 mb-4">
                Record your pronunciation of this Mankon word. Press the start button to begin recording. Press it again to stop recording. After you end your recording, you will have an oportunity to listen to your audio. If you are not satisfied with your recording, feel free to hit the clear button and start over.
            </p>
            
            <AudioRecorder
              instanceId="audio-word"
              onRecordingComplete={(blob: string) => handleRecordingComplete('wordAudio', blob)}
              initialAudio={formData.wordAudioFileIds?.[0] || ""}
            />
            
            {errors.wordAudioFileIds && (
              <p className="text-red-500 text-sm mt-1">{errors.wordAudioFileIds}</p>
            )}
          </div>

          {/* Example Sentences Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Example Sentences</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add example sentences that capture the word in context.
            </p>

            {/* Example Sentence 1 */}
            <div className="mb-4">
              <label htmlFor="mankonSentences[0]" className="block font-medium mb-1">
                Mankon Sentence 1
              </label>
              <input
                type="text"
                id="mankonSentences[0]"
                name="mankonSentences[0]"
                value={formData.mankonSentences?.[0] || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Enter an example sentence"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="translatedSentences[0]" className="block font-medium mb-1">
                English Translation 1
              </label>
              <input
                type="text"
                id="translatedSentences[0]"
                name="translatedSentences[0]"
                value={formData.translatedSentences?.[0] || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Enter English translation"
              />
            </div>

            <div className="mb-6">
              <label className="block font-medium mb-1">
                Sentence 1 Audio {<span className="text-red-500">*</span>}
              </label>
              <AudioRecorder
                instanceId="audio-sentence-1"
                onRecordingComplete={(blob: string) => handleRecordingComplete('sentenceAudio', blob, 0)}
                initialAudio={formData.sentenceAudioFileIds?.[0] || ""}
              />
            </div>
          </div>
          {/* Example Sentence 2 */}
          <div className="mb-4">
              <label htmlFor="mankonSentences[1]" className="block font-medium mb-1">
                Mankon Sentence 2
              </label>
              <input
                type="text"
                id="mankonSentences[1]"
                name="mankonSentences[1]"
                value={formData.mankonSentences?.[1] || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Enter an example sentence"
              />
          </div>

            <div className="mb-4">
              <label htmlFor="translatedSentences[1]" className="block font-medium mb-1">
                English Translation 2
              </label>
              <input
                type="text"
                id="translatedSentences[1]"
                name="translatedSentences[1]"
                value={formData.translatedSentences?.[1] || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Enter English translation"
              />
            </div>

            <div className="mb-6">
              <label className="block font-medium mb-1">
                Sentence 2 Audio {<span className="text-red-500">*</span>}
              </label>
              <AudioRecorder
                instanceId="audio-sentence-2"
                onRecordingComplete={(blob: string) => handleRecordingComplete('sentenceAudio', blob, 1)}
                initialAudio={formData.sentenceAudioFileIds?.[1] || ""}
              />
            </div>
            {/* Submit Button */}   
            <div className="mb-6">
                <button
                    type="submit"
                    className="button w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {isEmptyForm ? "Submit Proposal" : "Update Proposal"}
                </button>
            </div>
        </form>
    </div>
  </div>
  );
}
