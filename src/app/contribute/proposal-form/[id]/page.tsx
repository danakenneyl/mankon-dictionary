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

  const handleStringInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
  const handleTranslationInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Construct Array
    const {name , value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.split(", ")
    }));
  }
  const handleSentenceOne = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Construct Array
    const name = e.target.name
    const key = name as keyof WordEntry    // ← here
    const value = e.target.value

    setFormData((prev) => {
      const updatedArray = [...(prev[key] || [])];
      
      updatedArray[0] = value;
      return {
      ...prev,
      [key]: updatedArray
      }
    });
  }
  const handleSentenceTwo = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Construct Array
    const name = e.target.name
    const key = name as keyof WordEntry    // ← here
    const value = e.target.value

    setFormData((prev) => {
      const updatedArray = [...(prev[key] || [])];
      
      updatedArray[1] = value;
      return {
      ...prev,
      [key]: updatedArray
      }
    });
  }

  const handleCompletedRecording = (field: string, blobURL: string, index?: number) => {
    let targetField: keyof WordEntry;
    
    if (field === "wordAudio") {
      targetField = "wordAudioFilenames";
    } else if (field === "sentenceAudio") {
      targetField = "sentenceAudioFilenames";
    } else {
      console.error(`Unknown recording field: ${field}`);
      return;
    }
  
    // Handle clearing a recording (when blobURL is empty)
    if (blobURL === "" || !blobURL) {
      setFormData(prev => {
        if (targetField === "sentenceAudioFilenames" && index !== undefined) {
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
      return; // Exit early after clearing
    }
  
    // Handle setting a new recording (when blobURL has content)
    if (targetField === "wordAudioFilenames") {
      setFormData(prev => ({
        ...prev,
        [targetField]: [blobURL]
      }));
    } else if (targetField === "sentenceAudioFilenames" && index !== undefined) {
      setFormData((prev) => {
        const updatedArray = [...(prev[targetField] || [])];
        while (updatedArray.length <= index) {
          updatedArray.push("");
        }
        updatedArray[index] = blobURL;
        return {
          ...prev,
          [targetField]: updatedArray
        };
      });
    }
  
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
  };
  const nextSection = () => {
    setCurrentSection(currentSection + 1);
  }
  const prevSection = () => {
    setCurrentSection(currentSection -1);
  }

  const validateForm = () : boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Check mankonWord is present
    if (!formData.mankonWord || formData.mankonWord.trim() === '') {
      newErrors.mankonWord = "This field is required";
      isValid = false;
    } 
    // Check English Translation is present
    if (!formData.translatedWords || formData.translatedWords.length === 0 ||
      (formData.translatedWords.length === 1 && formData.translatedWords[0].trim() === '')) {
      newErrors.translatedWords = "At least one translation is required";
      isValid = false;
    } 
    // Validate word audio
    if (!formData.wordAudioFilenames || !formData.wordAudioFilenames.length || !formData.wordAudioFilenames[0]) {
      newErrors['wordAudioFilenames'] = 'Word audio recording is required';
      isValid = false;
    }
    // Validate first sentence audio with specific index
    if (!formData.sentenceAudioFilenames || !formData.sentenceAudioFilenames.length || !formData.sentenceAudioFilenames[0]) {
      newErrors['sentenceAudioFilenamesOne'] = 'First sentence audio recording is required';
      isValid = false;
    }
    // Validate second sentence audio with specific index
    if (!formData.sentenceAudioFilenames || formData.sentenceAudioFilenames.length < 2 || !formData.sentenceAudioFilenames[1]) {
      newErrors['sentenceAudioFilenamesTwo'] = 'Second sentence audio recording is required';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  }

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
  
    // Step 2: Prepare proposal data
    try {
      // last modified timestamp
      const now = new Date().toISOString();
      
      const proposalData: WordEntry = {
        ...formData,
        lastModifiedAt: now,
      };
  
      // If it's a new form, add createdAt timestamp
      if (isEmptyForm) {
       proposalData.createdAt = now;
      }
  
      // Check for audio files using filenames (which contain blob URLs) instead of IDs
      if (formData.translatedWords 
        && formData.translatedWords.length > 0 
        && formData.wordAudioFilenames          // ← Check for blob URLs here
        && formData.wordAudioFilenames.length > 0
        && formData.wordAudioFilenames[0]       // ← Make sure first element exists and isn't empty
        && formData.sentenceAudioFilenames
        && formData.sentenceAudioFilenames.length > 0
        && formData.contributorUUIDs
        && formData.contributorUUIDs.length > 0
      ) {
        // Generate custom filenames for audio files
        const wordFileName = `${formData.mankonWord}_${formData.translatedWords[0]}_word_${formData.contributorUUIDs[0]}.wav`;
        
        // Get word audio file from blob URL (stored in wordAudioFilenames during recording)
        const wordAudioBlob = formData.wordAudioFilenames[0]; // This is the blob URL
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
  
        // Set word audio filename and ID in proposal data
        proposalData.wordAudioFilenames = [wordFileName];
        proposalData.wordAudioFileIds = [wordFileId]; 
  
        // Get and upload sentence audio files
        const sentenceFilenames: string[] = [];
        const sentenceFileIds: string[] = [];
  
        // Process each sentence audio file
        for (let i = 0; i < formData.sentenceAudioFilenames.length; i++) {
          const blobUrl = formData.sentenceAudioFilenames[i];
          if (blobUrl) {
            const sentenceFileName = `${formData.mankonWord}_${formData.translatedWords[0]}_sentence${i+1}_${formData.contributorUUIDs[0]}.wav`;
            const sentenceFile = await getBlobAsFile(blobUrl, sentenceFileName);
            
            if (sentenceFile) {
              // Upload each sentence audio file
              const sentenceResponse = await UploadAudio(sentenceFile);
              if (sentenceResponse === null) {
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
      proposalData.status = "pending";
  
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
      router.push("/contribute/contribute-instructions");
    } catch (error) {
      console.error('Error saving proposal:', error);
      alert("Error saving your submission. Please try again.");
    } finally {
      setAttemptedSubmit(false); // Reset submission state regardless of outcome
      setSubmitting(false);
    }
  }

  if (!isAuthenticated) {
    return (<Login type="contributor" username={username} setUsername={setUsername} setIsAuthenticated={setIsAuthenticated} setFormData={setFormData} />);
  }

  return (
    <div className="content-wrapper">
      <div className="content">
        <h1 className="text-3xl font-bold mb-6 text-center">Entry Proposal Form</h1>
        <div className="intro-decoration">
        <div className="decoration-line"></div>
        <div className="decoration-symbol"></div>
        <div className="decoration-line"></div>
        </div>

      <p className="text-center">Required answers are marked with an asterisk (*)</p>

      <form onSubmit={handleSubmit} className="nl-form">
        {/* Section 1 Word Information */}
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
                onChange={handleStringInput}
                className={`${errors.mankonWord ? 'error' : 'nl-input'}`}
                placeholder="Enter word here"
              />
              {errors.mankonWord && (
                <p className="error-text">{errors.mankonWord}</p>
              )}
            </div>
            <hr className="section-divider-propose" />
            <div className="nl-question-group">
              <label className="nl-question">
                What is this word&apos;s English translation? <span className="required-indicator">*</span>
              </label>
              <br />
              <input
                type="text"
                name="translatedWords"
                value={(formData.translatedWords && formData.translatedWords.join(", ")) || ""}
                onChange={handleTranslationInput}
                className={`${errors.translatedWords ? 'error' : 'nl-input'}`}
                placeholder="Enter translation(s), comma separated"
              />
              {errors.mankonWord && (
                <p className="error-text">{errors.translatedWords}</p>
              )}
            </div>
            <hr className="section-divider-propose" />
            <div className="nl-question-group">
              <label className="nl-question">
                Record your word&apos;s pronunciation<span className="required-indicator">*</span>
              </label>
              <ol className="nl-instruction-list">
                <li>Click the <strong>&apos;Start&apos;</strong> button <br />(you may need to give permission to use your microphone. Click &apos;Allow&apos;).</li>
                <li>Wait 3 seconds until the timer begins counting.</li>
                <li>Pronounce the word as you would say it. Ignore spelling convention and do not record the English translation.</li>
                <li>Press the <strong>&apos;Stop&apos;</strong> button. <br />(the <strong>&apos;Start&apos;</strong> button becomes the <strong>&apos;Stop&apos;</strong> button when you start recording)</li>
                <li>
                  Listen to your recording. If you like it, you can hit the <strong>&apos;Propose a Sentence&apos;</strong> button. 
                </li>
                <li>
                  If you don&apos;t like your recording, click the <strong>&apos;Clear&apos;</strong> button and try again.
                </li>
              </ol>
              <AudioRecorder
                instanceId="audio-word"
                onRecordingComplete={(blob: string) => handleCompletedRecording('wordAudio', blob)}
                initialAudio={(formData.wordAudioFilenames?.[0]) || ""}
              />
              {errors.wordAudioFilenames && (
                <p className="error-text">{errors.wordAudioFilenames}</p>
              )}
            </div> 
            <div className="navigation-buttons">
                <button 
                  type="button" 
                  className="next-button" 
                  onClick={nextSection}
                >
                  Propose a Sentence
                </button>
              </div>
          </div>
          )}
        {/* Section 2: First Sentence Example */}
        {currentSection === 2 && (
          <div className="nl-section word-section">
            <div className="nl-question-group">
              <label className="nl-question">
                Please write a Mankon sentence that features &quot;{formData.mankonWord}&quot;
              </label>
              <br />
              <input
                type="text"
                name="mankonSentences"
                value={(formData.mankonSentences && formData.mankonSentences[0]) || ""}
                onChange={handleSentenceOne}
                className={`${errors.mankonSentences ? 'error' : 'nl-input'}`}
                placeholder="Enter sentence"
              />
            
            </div>
            <hr className="section-divider-propose" />
            <div className="nl-question-group">
              <label className="nl-question">
                What is English translation of the above sentence? 
              </label>
              <br />
              <input
                type="text"
                name="translatedSentences"
                value={(formData.translatedSentences && formData.translatedSentences[0]) || ""}
                onChange={handleSentenceOne
                }
                className={`${errors.translatedWords ? 'error' : 'nl-input'}`}
                placeholder="Enter sentence"
              />
             
            </div>
            <hr className="section-divider-propose" />
            <div className="nl-question-group">
              <label className="nl-question">
                Record your sentence <span className="required-indicator">*</span>
              </label>
              <ol className="nl-instruction-list">
                <li>Click the <strong>&apos;Start&apos;</strong> button <br />(you may need to give permission to use your microphone. Click &apos;Allow&apos;).</li>
                <li>Wait 3 seconds until the timer begins counting.</li>
                <li>Pronounce the sentence naturally. <br/>(Ignore spelling convention and do not record the English translation.)</li>
                <li>Press the <strong>&apos;Stop&apos;</strong> button. <br />(the <strong>&apos;Start&apos;</strong> button becomes the <strong>&apos;Stop&apos;</strong> button when you start recording)</li>
                <li>
                  Listen to your recording. If you like it, you can hit the <strong>&apos;Propose another Sentence&apos;</strong> button. 
                </li>
                <li>
                  If you don&apos;t like your recording, click the <strong>&apos;Clear&apos;</strong> button and try again.
                </li>
              </ol>
              <AudioRecorder
                instanceId="audio-word"
                onRecordingComplete={(blob: string) => handleCompletedRecording('sentenceAudio', blob, 0)}
                initialAudio={(formData.sentenceAudioFilenames?.[0]) || ""}
              />
              {errors.sentenceAudioFilenamesOne && (
                <p className="error-text">{errors.sentenceAudioFilenamesOne}</p>
              )}
            </div> 
            <div className="navigation-buttons">
              <button 
                type="button" 
                className="next-button" 
                onClick={prevSection}
              >
                Go back
              </button>
              <button 
                type="button" 
                className="next-button" 
                onClick={nextSection}
              >
                Propose another Sentence
              </button>
            </div>
          </div>
          )}
          {currentSection === 3 && (
            <div className="nl-section word-section">
              <div className="nl-question-group">
                <label className="nl-question">
                  Please write another Mankon sentence that features &quot;{formData.mankonWord}&quot;
                </label>
                <br />
                <input
                  type="text"
                  name="mankonSentences"
                  value={(formData.mankonSentences && formData.mankonSentences[1])||""}
                  onChange={handleSentenceTwo}
                  className="nl-input"
                  placeholder="Enter sentence"
                />
              
              </div>
              <hr className="section-divider-propose" />
              <div className="nl-question-group">
                <label className="nl-question">
                  What is English translation of the above sentence? 
                </label>
                <br />
                <input
                  type="text"
                  name="translatedSentences"
                  value={(formData.translatedSentences && formData.translatedSentences[1])||""}
                  onChange={handleSentenceTwo}
                  className="nl-input"
                  placeholder="Enter sentence"
                />
              
              </div>
              <hr className="section-divider-propose" />
              <div className="nl-question-group">
                <label className="nl-question">
                  Record your sentence <span className="required-indicator">*</span>
                </label>
                <ol className="nl-instruction-list">
                  <li>Click the <strong>&apos;Start&apos;</strong> button <br />(you may need to give permission to use your microphone. Click &apos;Allow&apos;).</li>
                  <li>Wait 3 seconds until the timer begins counting.</li>
                  <li>Pronounce the sentence naturally. <br/>(Ignore spelling convention and do not record the English translation.)</li>
                  <li>Press the <strong>&apos;Stop&apos;</strong> button. <br />(the <strong>&apos;Start&apos;</strong> button becomes the <strong>&apos;Stop&apos;</strong> button when you start recording)</li>
                  <li>
                    Listen to your recording. If you like it, you can hit the <strong>&apos;Propose another Sentence&apos;</strong> button. 
                  </li>
                  <li>
                    If you don&apos;t like your recording, click the <strong>&apos;Clear&apos;</strong> button and try again.
                  </li>
                </ol>
                <AudioRecorder
                  instanceId="audio-word"
                  onRecordingComplete={(blob: string) => handleCompletedRecording('sentenceAudio', blob, 1)}
                  initialAudio={(formData.sentenceAudioFilenames && formData.sentenceAudioFilenames[1]) || ""}
                />
                {errors.sentenceAudioFilenamesTwo && (
                  <p className="error-text">{errors.sentenceAudioFilenamesTwo}</p>
                )}
              </div> 
              <div className="navigation-buttons">
                <button 
                  type="button" 
                  className="next-button" 
                  onClick={prevSection}
                >
                  Go back
                </button>
                <button 
                  type="submit" 
                  className="next-button" 
                >
                  {submitting ? "Submitting..." : "Submit Proposal"}
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
  );
}