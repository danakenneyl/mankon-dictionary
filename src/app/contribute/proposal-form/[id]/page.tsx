'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { db } from "@/utils/firebase";
import { UploadAudio } from '@/utils/ClientSideAPICalls';
import { ref, get, set, update, push } from "firebase/database";
import  Login  from "@/app/contribute/Login";
import { WordEntry } from "@/utils/types";

// Dynamic import with SSR disabled
const AudioRecorder = dynamic(
  () => import('@/app/contribute/proposal-form/ProposeEntryRecord'),
  { ssr: false }
);

export default function MankonWordFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEmptyForm = id === "0";
  const router = useRouter();

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<WordEntry>({
    altSpelling: "",
    contributorUUIDs: [],
    createdAt: "",
    lastModifiedAt: "",
    mankonSentences: [],
    mankonWord: "",
    pairWords: [],
    sentenceAudioFileIds: [],
    sentenceAudioFilenames: [],
    translatedSentences: [],
    translatedWords: [],
    type: [],
    wordAudioFileIds: [],
    wordAudioFilenames: [],
    status: "pending",
    partOfSpeech: "",
  });

  // Updated errors state to include indexed sentenceAudioFilenames
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);


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
        const updatedArray = [...(prev[fieldName as keyof WordEntry] as string[] || [])];
        updatedArray[index] = value;
        
        return {
          ...prev,
          [fieldName]: updatedArray,
        };
      });
    } else if (name === "translatedWords") {
      // Handle translatedWords as array, trim whitespace from items
      setFormData((prev) => ({
        ...prev,
        [name]: value.split(',').map(word => word.trim()).filter(word => word.length > 0),
      }));
    } else if (name === "pairWords") {
      // Handle pairWords as array
      setFormData((prev) => ({
        ...prev,
        [name]: value.split(",").map(word => word.trim()).filter(word => word.length > 0),
      }));
    } else {
      // Handle regular fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error if field is edited after attempted submit
    if (attemptedSubmit && errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleRecordingComplete = (field: string, blobUrl: string, index?: number) => {
    // Determine the correct field name based on what's being recorded
    let targetField: keyof WordEntry;
    
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
      if (attemptedSubmit) {
        if (targetField === 'sentenceAudioFilenames' && index !== undefined) {
          // Clear specific indexed sentence audio error
          setErrors((prev) => {
            const updated = { ...prev };
            delete updated[`sentenceAudioFilenames[${index}]`];
            return updated;
          });
        } else if (errors[targetField]) {
          // Clear general error
          setErrors((prev) => {
            const updated = { ...prev };
            delete updated[targetField];
            return updated;
          });
        }
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
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    // Check mankonWord is present
    if (!formData.mankonWord || formData.mankonWord.trim() === '') {
      newErrors.mankonWord = `This field is required`;
      isValid = false;
    }

    // Check translatedWords is present and has at least one item
    if (!formData.translatedWords || formData.translatedWords.length === 0 || 
        (formData.translatedWords.length === 1 && formData.translatedWords[0].trim() === '')) {
      newErrors.translatedWords = `At least one translation is required`;
      isValid = false;
    }

    // Validate word audio
    if (!formData.wordAudioFileIds || !formData.wordAudioFileIds.length || !formData.wordAudioFileIds[0]) {
      newErrors['wordAudioFileIds'] = 'Word audio recording is required';
      isValid = false;
    }

    // Validate first sentence audio with specific index
    if (!formData.sentenceAudioFilenames || !formData.sentenceAudioFilenames.length || !formData.sentenceAudioFilenames[0]) {
      newErrors['sentenceAudioFilenames[0]'] = 'First sentence audio recording is required';
      isValid = false;
    }
    
    // Validate second sentence audio with specific index
    if (!formData.sentenceAudioFilenames || formData.sentenceAudioFilenames.length < 2 || !formData.sentenceAudioFilenames[1]) {
      newErrors['sentenceAudioFilenames[1]'] = 'Second sentence audio recording is required';
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
    setSubmitting(true);
    event.preventDefault();
    setAttemptedSubmit(true);
    
    // Step 1: Validate form before submitting
    if (!validateForm()) {
      console.log('Form validation failed');
      setSubmitting(false);
      return;
    }

    try {
      
      // Generate timestamps
      const now = new Date().toISOString();
      
      // Step 2: Prepare proposal data
      const proposalData: WordEntry = {
        ...formData,
        lastModifiedAt: now,
      };
    
      // If it's a new form, add createdAt timestamp
      if (isEmptyForm) {
        proposalData.createdAt = now;
      }
      if (formData.translatedWords 
        && formData.translatedWords.length > 0 
        && formData.wordAudioFileIds 
        && formData.wordAudioFileIds.length > 0
        && formData.sentenceAudioFilenames
        && formData.sentenceAudioFilenames.length > 0
        && formData.contributorUUIDs
        && formData.contributorUUIDs.length > 0
      ) {
        // Generate custom filenames for audio files
        const wordFileName = `${formData.mankonWord}_${formData.translatedWords[0]}_word_${formData.contributorUUIDs[0]}.wav`;
        
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
            const sentenceFileName = `${formData.mankonWord}_${formData.translatedWords[0]}_sentence${i+1}_${formData.contributorUUIDs[0]}.wav`;
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
      }
        
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
      setSubmitting(false);
    }
  };

  // Navigate to next section
  const nextSection = () => {
    setCurrentSection(currentSection + 1);
  };

  // Navigate to previous section
  const prevSection = () => {
    setCurrentSection(currentSection - 1);
  };

  if (!isAuthenticated) {
    return (<Login type="contributor" username={username} setUsername={setUsername} setIsAuthenticated={setIsAuthenticated} setFormData={setFormData} />);
  }

  return (
    <div className="content-wrapper">
    <div className="content">
    <div className="nl-form-container">
      <div className="progress-bar">
        <div className="progress-step" style={{ width: `${(currentSection / 3) * 100}%` }}></div>
      </div>
      
      <div className="nl-form-content">
        <h1 className="nl-form-title">Propose a New Word</h1>
        <p className="centered-info">Required answers are marked with an asterisk *</p>
        
        <form onSubmit={handleSubmit} className="nl-form">
          {/* Section 1: Word Information */}
          {currentSection === 1 && (
            <div className="nl-section word-section">
              
              <div className="nl-question-group">
                <label className="nl-question">
                  What Mankon word would you like to propose? <span className="required-indicator">*</span>
                </label>
                <br />
                <input
                  type="text"
                  name="mankonWord"
                  value={formData.mankonWord}
                  onChange={handleInputChange}
                  className={`nl-input ${errors.mankonWord ? 'error' : 'nl-input'}`}
                  placeholder="Enter word here"
                />
                {errors.mankonWord && (
                  <p className="error-text">{errors.mankonWord}</p>
                )}
              </div>
              <hr className="section-divider-propose" />
              <div className="nl-question-group">
                <label className="nl-question">
                  What is the English translation?<span className="required-indicator">*</span>
                </label>
                <br />
                <input
                  type="text"
                  name="translatedWords"
                  value={formData.translatedWords ? formData.translatedWords.join(", ") : ""}
                  onChange={handleInputChange}
                  className={`nl-input ${errors.translatedWords ? 'error' : 'nl-input'}`}
                  placeholder="Enter translation here (separate multiple words with commas)"
                />
                {errors.translatedWords && (
                  <p className="error-text">{errors.translatedWords}</p>
                )}
              </div>
              <hr className="section-divider-propose" />
              <div className="nl-question-group">
                <label className="nl-question">
                  Now, record how to pronounce this word <span className="required-indicator">*</span>
                  <br />
                  Follow these steps:
                </label>
                <ol className="nl-instruction-list">
                  <li>Click the <strong>&apos;Start&apos;</strong> button <br />(you may need to give permission to use your microphone. Click &apos;Allow&apos;).</li>
                  <li>Wait 3 seconds until the timer begins counting.</li>
                  <li>Pronounce the word naturally.</li>
                  <li>Press the <strong>&apos;Stop&apos;</strong> button. <br />(the <strong>&apos;Start&apos;</strong> button becomes the <strong>&apos;Stop&apos;</strong> button when you record)</li>
                  <li>
                    Listen to your recording. If you like it, you can hit the &apos;Continue to Example Sentences&apos; button. 
                  </li>
                  <li>
                    If you don&apos;t like your recording, click the <strong>&apos;Clear&apos;</strong> button and try again.
                  </li>
                </ol>
                <AudioRecorder
                  instanceId="audio-word"
                  onRecordingComplete={(blob: string) => handleRecordingComplete('wordAudio', blob)}
                  initialAudio={formData.wordAudioFileIds?.[0] || ""}
                />
                {errors.wordAudioFileIds && (
                  <p className="error-text">{errors.wordAudioFileIds}</p>
                )}
              </div>

              <div className="navigation-buttons">
                <button 
                  type="button" 
                  className="next-button" 
                  onClick={nextSection}
                >
                  Continue to Example Sentences
                </button>
              </div>
            </div>
          )}

          {/* Section 2: First Example Sentence */}
          {currentSection === 2 && (
            <div className="nl-section sentence-section">
              
              <div className="nl-question-group">
                <label className="nl-question">
                  Type a Mankon sentence using &quot;{formData.mankonWord}&quot;.
                </label>
                <textarea
                  name="mankonSentences[0]"
                  value={formData.mankonSentences?.[0] || ""}
                  onChange={handleInputChange}
                  className="nl-textarea"
                  placeholder="Enter a Mankon sentence here"
                />
              </div>
              <hr className="section-divider-propose" />
              <div className="nl-question-group">
                <label className="nl-question">
                  Type the Engligh translation of your sentence.
                </label>
                <textarea
                  name="translatedSentences[0]"
                  value={formData.translatedSentences?.[0] || ""}
                  onChange={handleInputChange}
                  className="nl-textarea"
                  placeholder="Translate the sentence to English"
                />
              </div>
              <hr className="section-divider-propose" />
              <div className="nl-question-group">
                <label className="nl-question">
                  Record your sentence. <span className="required-indicator">*</span>
                </label>
                <ol className="nl-instruction-list">
                  <li>Click the <strong>&apos;Start&apos;</strong> button.</li>
                  <li>Wait 3 seconds until the timer begins counting.</li>
                  <li>Pronounce the sentence naturally.</li>
                  <li>Press the <strong>&apos;Stop&apos;</strong> button.</li>
                  <li>
                    If you like it, you can hit the &apos;Add Another Example&apos; button.
                  </li>
                  <li>
                    If you don&apos;t like your recording, click the <strong>&apos;Clear&apos;</strong> button and try again.
                  </li>
                </ol>
                <AudioRecorder
                  instanceId="audio-sentence-1"
                  onRecordingComplete={(blob: string) => handleRecordingComplete('sentenceAudio', blob, 0)}
                  initialAudio={formData.sentenceAudioFileIds?.[0] || ""}
                />
                {errors['sentenceAudioFilenames[0]'] && (
                  <p className="error-text">{errors['sentenceAudioFilenames[0]']}</p>
                )}
              </div>

              <div className="navigation-buttons">
                <button type="button" className="next-button" onClick={prevSection}>
                  Back
                </button>
                <button type="button" className="next-button" onClick={nextSection}>
                  Add Another Example
                </button>
              </div>
            </div>
          )}

          {/* Section 3: Second Example Sentence */}
          {currentSection === 3 && (
            <div className="nl-section sentence-section">
  
              <div className="nl-question-group">
                <label className="nl-question">
                Type another Mankon sentence using &quot;{formData.mankonWord}&quot;.
                </label>
                <textarea
                  name="mankonSentences[1]"
                  value={formData.mankonSentences?.[1] || ""}
                  onChange={handleInputChange}
                  className="nl-textarea"
                  placeholder="Write another sentence using this word in Mankon"
                />
              </div>
              <hr className="section-divider-propose" />
              <div className="nl-question-group">
                <label className="nl-question">
                Type the Engligh translation of your sentence.
                </label>
                <textarea
                  name="translatedSentences[1]"
                  value={formData.translatedSentences?.[1] || ""}
                  onChange={handleInputChange}
                  className="nl-textarea"
                  placeholder="Translate the sentence to English"
                />
              </div>
              <hr className="section-divider-propose" />
              <div className="nl-question-group">
                <label className="nl-question">
                  Record your sentence. <span className="required-indicator">*</span>
                </label>
                <ol className="nl-instruction-list">
                  <li>Click the <strong>&apos;Start&apos;</strong> button.</li>
                  <li>Wait 3 seconds until the timer begins counting.</li>
                  <li>Pronounce the sentence naturally.</li>
                  <li>Press the <strong>&apos;Stop&apos;</strong> button.</li>
                  <li>
                    If you like it, you can hit the <strong>&apos;{isEmptyForm ? "Submit My Contribution" : "Update This Proposal"}&apos;</strong> button.
                  </li>
                  <li>
                    If you don&apos;t like your recording, click the <strong>&apos;Clear&apos;</strong> button and try again.
                  </li>
                </ol>
                <AudioRecorder
                  instanceId="audio-sentence-2"
                  onRecordingComplete={(blob: string) => handleRecordingComplete('sentenceAudio', blob, 1)}
                  initialAudio={formData.sentenceAudioFileIds?.[1] || ""}
                />
                {errors['sentenceAudioFilenames[1]'] && (
                  <p className="error-text">{errors['sentenceAudioFilenames[1]']}</p>
                )}
              </div>

              <div className="navigation-buttons">
                <button type="button" className="next-button" onClick={prevSection}>
                  Back
                </button>
                <button type="submit" className="next-button">
                  {submitting ? "Submitting..." : isEmptyForm ? "Submit My Contribution" : "Update This Proposal"}
                </button>
              </div>
              
              {/* Error message for missing answers */}
              {attemptedSubmit && Object.keys(errors).length > 0 && (
                <p className="error-text" style={{ marginTop: '10px' }}>
                  You missed some answers! <br/>Go back carefully through the entire form to find what you missed.
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  </div>
   </div>
  
  );
}