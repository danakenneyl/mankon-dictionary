'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { db } from '@/utils/firebase';
import { UploadAudio } from '@/utils/ClientSideAPICalls';
import { ref, get, set, update, push } from 'firebase/database';
import Login from '@/app/contribute/Login';
import { WordEntry } from '@/utils/types';

// Dynamic import with SSR disabled
const AudioRecorder = dynamic(
  () => import('@/app/contribute/proposal-form/ProposeEntryRecord'),
  { ssr: false }
);

/* ------------------------------------------------------------------ */
/*                          HELPER FUNCTIONS                          */
/* ------------------------------------------------------------------ */

const isBlobUrl = (url?: string) =>
  typeof url === 'string' && url.startsWith('blob:');

/** Convert a blob-URL string to a File object with a custom filename. */
const blobUrlToFile = async (
  blobUrl: string,
  filename: string
): Promise<File> => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: 'audio/wav' });
};

/* ------------------------------------------------------------------ */
/*                            MAIN COMPONENT                          */
/* ------------------------------------------------------------------ */

export default function MankonWordFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEmptyForm = id === '0';
  const router = useRouter();

  /* ----------------------------- STATE ---------------------------- */

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<WordEntry>({
    altSpelling: '',
    contributorUUIDs: [],
    createdAt: '',
    lastModifiedAt: '',
    mankonSentences: [],
    mankonWord: '',
    pairWords: [],
    sentenceAudioFileIds: [],
    sentenceAudioFilenames: [],
    translatedSentences: [],
    translatedWords: [],
    type: [],
    wordAudioFileIds: [],
    wordAudioFilenames: [],
    status: 'pending',
    partOfSpeech: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);

  /* ------------------------ FETCH EXISTING DATA ------------------- */

  useEffect(() => {
    const fetchProposal = async () => {
      if (isEmptyForm || !isAuthenticated) return;
      
      try {
        const proposalRef = ref(db, `proposals/${id}`);
        const snap = await get(proposalRef);
        if (snap.exists()) {
          const fetchedData = snap.val();
          
          // Preserve the current contributorUUIDs that were set during authentication
          setFormData(prev => ({
            ...fetchedData,
            contributorUUIDs: prev.contributorUUIDs ? prev.contributorUUIDs : fetchedData.contributorUUIDs
          }));
        }
      } catch (err) {
        console.error('Error fetching proposal:', err);
      }
    };
    fetchProposal();
  }, [id, isAuthenticated, isEmptyForm]);

  /* -------------------- GENERIC INPUT HANDLERS -------------------- */

  const handleStringInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleTranslationInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) =>
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value.split(',').map(t => t.trim()),
    }));

  const handleSentence =
    (index: 0 | 1) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const key = e.target.name as keyof WordEntry; // mankonSentences | translatedSentences
      setFormData(prev => {
        const arr = [...(prev[key] || [])];
        arr[index] = e.target.value;
        return { ...prev, [key]: arr };
      });
    };

  /* -------------- RECORDING HANDLER (WORD + SENTENCES) ------------ */

  const handleCompletedRecording = (
    field: 'wordAudio' | 'sentenceAudio',
    blobURL: string,
    index?: number
  ) => {
    const targetField =
      field === 'wordAudio' ? 'wordAudioFilenames' : 'sentenceAudioFilenames';

    setFormData(prev => {
      const arr = [...(prev[targetField] || [])];

      if (!blobURL) {
        // clear recording
        if (field === 'wordAudio') return { ...prev, [targetField]: [''] };

        if (index !== undefined) {
          arr[index] = '';
          return { ...prev, [targetField]: arr };
        }
      } else {
        // set recording
        if (field === 'wordAudio') return { ...prev, [targetField]: [blobURL] };

        if (index !== undefined) {
          while (arr.length <= index) arr.push('');
          arr[index] = blobURL;
          return { ...prev, [targetField]: arr };
        }
      }
      return prev;
    });

    // clear any prior error for this recording
    if (attemptedSubmit) {
      const errorKey =
        field === 'wordAudio'
          ? 'wordAudioFilenames'
          : index === 0
          ? 'sentenceAudioFilenamesOne'
          : 'sentenceAudioFilenamesTwo';

      setErrors(prev => {
        const rest = { ...prev };
        delete rest[errorKey];   // remove the one error key
        return rest;
      });
    }
  }


  /* ------------------------ SECTION NAVIGATION -------------------- */

  const nextSection = () => setCurrentSection(s => s + 1);
  const prevSection = () => setCurrentSection(s => s - 1);

  /* -------------------------- VALIDATION -------------------------- */

  const validateForm = (): boolean => {
    const newErr: Record<string, string> = {};
    let isValid = true;

    if (!formData.mankonWord.trim()) {
      newErr.mankonWord = 'This field is required';
      isValid = false;
    }

    if (!formData.translatedWords ||
      !formData.translatedWords.length ||
      !formData.translatedWords[0]?.trim()
    ) {
      newErr.translatedWords = 'At least one translation is required';
      isValid = false;
    }

    if (!formData.wordAudioFilenames || !formData.wordAudioFilenames[0]) {
      newErr.wordAudioFilenames = 'Word audio recording is required';
      isValid = false;
    }

    if (!formData.sentenceAudioFilenames || !formData.sentenceAudioFilenames[0]) {
      newErr.sentenceAudioFilenamesOne = 'First sentence audio is required';
      isValid = false;
    }

    if (!formData.sentenceAudioFilenames || !formData.sentenceAudioFilenames[1]) {
      newErr.sentenceAudioFilenamesTwo = 'Second sentence audio is required';
      isValid = false;
    }

    setErrors(newErr);
    return isValid;
  };

  /* --------------------------- SUBMIT ----------------------------- */

  // Fixed handleSubmit function - replace your existing one

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setAttemptedSubmit(true);
  if (!validateForm()) return;

  setSubmitting(true);

  try {
    const nowIso = new Date().toISOString();
    const proposal: WordEntry = {
      ...formData,
      lastModifiedAt: nowIso,
      createdAt: isEmptyForm ? nowIso : formData.createdAt,
      status: 'pending',
    };

    if (proposal.translatedWords && 
        proposal.contributorUUIDs &&
        proposal.sentenceAudioFilenames 
    ) {
      /* ---------- WORD RECORDING ---------- */
      if (formData.wordAudioFilenames && isBlobUrl(formData.wordAudioFilenames[0])) {
        const wordFileName = `${proposal.mankonWord}_${proposal.translatedWords[0]}_word_${proposal.contributorUUIDs[0]}.wav`;
        const wordFile = await blobUrlToFile(
          formData.wordAudioFilenames[0],
          wordFileName
        );
        
        console.log('Uploading word file:', wordFile.name); // Debug log
        const wordFileId = await UploadAudio(wordFile);
        
        if (!wordFileId) {
          console.error('Failed to upload word audio');
          return;
        }
        
        proposal.wordAudioFilenames = [wordFileName];
        proposal.wordAudioFileIds = [wordFileId];
      }

      /* -------- SENTENCE RECORDINGS -------- */
      // Initialize arrays to preserve existing data
      const sentenceNames: string[] = [...(proposal.sentenceAudioFilenames || [])];
      const sentenceIds: string[] = [...(proposal.sentenceAudioFileIds || [])];

      // Process each sentence audio
      for (let i = 0; i < proposal.sentenceAudioFilenames.length; i++) {
        const url = proposal.sentenceAudioFilenames[i];
        
        if (isBlobUrl(url)) {
          // This is a new recording (blob URL)
          const fname = `${proposal.mankonWord}_${proposal.translatedWords[0]}_sentence${i + 1}_${proposal.contributorUUIDs[0]}.wav`;
          const file = await blobUrlToFile(url, fname);
          
          console.log(`Uploading sentence ${i + 1} file:`, file.name); // Debug log
          const id = await UploadAudio(file);

          if (!id) {
            console.error(`Failed to upload sentence ${i + 1} audio`);
            return;
          }

          sentenceNames[i] = fname;
          sentenceIds[i] = id;
        }
        // If it's not a blob URL, keep existing filename/id (already handled by array spread)
      }

      proposal.sentenceAudioFilenames = sentenceNames;
      proposal.sentenceAudioFileIds = sentenceIds;
    }

    /* --------------- FIREBASE --------------- */
    if (isEmptyForm) {
      const newRef = push(ref(db, 'proposals'));
      await set(newRef, proposal);
    } else {
      await update(ref(db, `proposals/${id}`), proposal);
    }
   
    router.push('/contribute/initial-requests');

    
  } catch (err) {
    console.error('Error saving proposal:', err);
    alert('Error saving your submission. Please try again.');
  } finally {
    setSubmitting(false);
    setAttemptedSubmit(false);
  }
};

  /* ----------------------- AUTH GATE ----------------------------- */

  if (!isAuthenticated)
    return (
      <Login
        type="contributor"
        username={username}
        setUsername={setUsername}
        setIsAuthenticated={setIsAuthenticated}
        setFormData={setFormData}
      />
    );

  /* -------------------------- RENDER ------------------------------ */

  return (
    <div className="content-wrapper">
      <div className="content">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Entry Proposal Form
        </h1>
        <div className="intro-decoration">
          <div className="decoration-line" />
          <div className="decoration-symbol" />
          <div className="decoration-line" />
        </div>

        <p className="text-center">
          Required answers are marked with an asterisk (*)
        </p>

        <form onSubmit={handleSubmit} className="nl-form">
          {/* ------------------------------------------------------ */}
          {/*             SECTION 1 – WORD INFORMATION              */}
          {/* ------------------------------------------------------ */}
          {currentSection === 1 && (
            <div className="nl-section word-section">
              {/* WORD */}
              <div className="nl-question-group">
                <label className="nl-question">
                  What Mankon word would you like to propose?{' '}
                  <span className="required-indicator">*</span>
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

              {/* TRANSLATION */}
              <div className="nl-question-group">
                <label className="nl-question">
                  What is this word&apos;s English translation?{' '}
                  <span className="required-indicator">*</span>
                </label>
                <br />
                <input
                  type="text"
                  name="translatedWords"
                  value={(formData.translatedWords || []).join(', ')}
                  onChange={handleTranslationInput}
                  className={`${
                    errors.translatedWords ? 'error' : 'nl-input'
                  }`}
                  placeholder="Enter translation(s), comma separated"
                />
                {errors.translatedWords && (
                  <p className="error-text">{errors.translatedWords}</p>
                )}
              </div>

              <hr className="section-divider-propose" />

              {/* WORD RECORDING */}
              <div className="nl-question-group">
                <label className="nl-question">
                  Record your word&apos;s pronunciation
                  <span className="required-indicator">*</span>
                </label>

                {/* Instructions */}
                <ol className="nl-instruction-list">
                  <li>
                    Click the <strong>&apos;Start&apos;</strong> button. 
                    <br/> (you may need enable your microphone. If a pop-up appears, click <strong>&apos;Allow&apos;</strong>. Then hit the <strong>&apos;Stop&apos;</strong> then <strong>&apos;Clear&apos;</strong> buttons below to restart your recording)
                  </li>
                  <li>Wait 3 seconds until the timer begins counting up.</li>
                  <li>
                    Pronounce the word naturally 
                    <br/>(Ignore spelling and do not record the English translation)
                  </li>
                  <li>
                    Press <strong>&apos;Stop&apos;</strong>
                    <br/> (A little audio bar should pop up)
                  </li>
                  <li>Listen to your recording.</li>
                  <li>If you don&apos;t like your recording, hit <strong>&apos;Clear&apos;</strong> and try again. If you are 
                  happy with your recording, click the <strong>&apos;Propose a Sentence&apos;</strong> button below.</li>
                </ol>

                <AudioRecorder
                  instanceId="audio-word"
                  onRecordingComplete={blob =>
                    handleCompletedRecording('wordAudio', blob)
                  }
                  initialAudio={formData.wordAudioFilenames? formData.wordAudioFilenames[0] : ''}
                />

                {errors.wordAudioFilenames && (
                  <p className="error-text">{errors.wordAudioFilenames}</p>
                )}
              </div>

              {/* NAV */}
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

          {/* ------------------------------------------------------ */}
          {/*             SECTION 2 – SENTENCE #1                   */}
          {/* ------------------------------------------------------ */}
          {currentSection === 2 && (
            <div className="nl-section word-section">
              {/* MANKON SENTENCE 1 */}
              <div className="nl-question-group">
                <label className="nl-question">
                  Write a Mankon sentence that features
                  &nbsp;&quot;{formData.mankonWord}&quot;
                </label>
                <br />
                <input
                  type="text"
                  name="mankonSentences"
                  value={formData.mankonSentences ? formData.mankonSentences[0] : ''}
                  onChange={handleSentence(0)}
                  className="nl-input"
                  placeholder="Enter sentence"
                />
              </div>

              <hr className="section-divider-propose" />

              {/* ENGLISH SENTENCE 1 */}
              <div className="nl-question-group">
                <label className="nl-question">
                  English translation of the sentence
                </label>
                <br />
                <input
                  type="text"
                  name="translatedSentences"
                  value={formData.translatedSentences ? formData.translatedSentences[0] : ''}
                  onChange={handleSentence(0)}
                  className="nl-input"
                  placeholder="Enter sentence"
                />
              </div>

              <hr className="section-divider-propose" />

              {/* SENTENCE 1 RECORD */}
              <div className="nl-question-group">
                <label className="nl-question">
                  Record your sentence <span className="required-indicator">*</span>
                </label>

                {/* Instructions */}
                <ol className="nl-instruction-list">
                  <li>
                    Click the <strong>&apos;Start&apos;</strong> button. 
                  </li>
                  <li>Wait 3 seconds</li>
                  <li>
                    Record a single sentence that features {formData.mankonWord && <> &quot;{formData.mankonWord}&quot;</>}. (5-10 words)
                  </li>
                  <li>
                    Press <strong>&apos;Stop&apos;</strong></li>
                  <li>Listen to your recording.</li>
                  <li>If you don&apos;t like your recording, hit <strong>&apos;Clear&apos;</strong> and try again. If you are 
                  happy with your recording, click the <strong>&apos;Propose a Sentence&apos;</strong> button below.</li>
                </ol>
                <AudioRecorder
                  instanceId="audio-sent-1"
                  onRecordingComplete={blob =>
                    handleCompletedRecording('sentenceAudio', blob, 0)
                  }
                  initialAudio={formData.sentenceAudioFilenames ? formData.sentenceAudioFilenames[0] : ''}
                />
                {errors.sentenceAudioFilenamesOne && (
                  <p className="error-text">
                    {errors.sentenceAudioFilenamesOne}
                  </p>
                )}
              </div>

              {/* NAV */}
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

          {/* ------------------------------------------------------ */}
          {/*             SECTION 3 – SENTENCE #2                   */}
          {/* ------------------------------------------------------ */}
          {currentSection === 3 && (
            <div className="nl-section word-section">
              {/* MANKON SENTENCE 2 */}
              <div className="nl-question-group">
                <label className="nl-question">
                  Write another Mankon sentence with
                  &nbsp;&quot;{formData.mankonWord}&quot;
                </label>
                <br />
                <input
                  type="text"
                  name="mankonSentences"
                  value={formData.mankonSentences ? formData.mankonSentences[1] : ''}
                  onChange={handleSentence(1)}
                  className="nl-input"
                  placeholder="Enter sentence"
                />
              </div>

              <hr className="section-divider-propose" />

              {/* ENGLISH SENTENCE 2 */}
              <div className="nl-question-group">
                <label className="nl-question">
                  English translation of the sentence
                </label>
                <br />
                <input
                  type="text"
                  name="translatedSentences"
                  value={formData.translatedSentences ? formData.translatedSentences[1] : ''}
                  onChange={handleSentence(1)}
                  className="nl-input"
                  placeholder="Enter sentence"
                />
              </div>

              <hr className="section-divider-propose" />

              {/* SENTENCE 2 RECORD */}
              <div className="nl-question-group">
                <label className="nl-question">
                  Record your sentence <span className="required-indicator">*</span>
                </label>
                {/* Instructions */}
                <ol className="nl-instruction-list">
                  <li>
                    Click the <strong>&apos;Start&apos;</strong> button. 
                  </li>
                  <li>Wait 3 seconds</li>
                  <li>
                    Record a single sentence that features {formData.mankonWord && <> &quot;{formData.mankonWord}&quot;</>}. (5-10 words)
                  </li>
                  <li>
                    Press <strong>&apos;Stop&apos;</strong></li>
                  <li>Listen to your recording.</li>
                  <li>If you don&apos;t like your recording, hit <strong>&apos;Clear&apos;</strong> and try again. If you are 
                  happy with your recording, click the <strong>&apos;Submit Proposal&apos;</strong> button below.</li>
                </ol>
                <AudioRecorder
                  instanceId="audio-sent-2"
                  onRecordingComplete={blob =>
                    handleCompletedRecording('sentenceAudio', blob, 1)
                  }
                  initialAudio={formData.sentenceAudioFilenames ? formData.sentenceAudioFilenames[1] : ''}
                />
                {errors.sentenceAudioFilenamesTwo && (
                  <p className="error-text">
                    {errors.sentenceAudioFilenamesTwo}
                  </p>
                )}
              </div>

              {/* NAV / SUBMIT */}
              <div className="navigation-buttons">
                <button
                  type="button"
                  className="next-button"
                  onClick={prevSection}
                >
                  Go back
                </button>
                <button type="submit" className="next-button">
                  {submitting ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>

              {attemptedSubmit && Object.keys(errors).length > 0 && (
                <p className="error-text mt-2 text-center">
                  You missed some answers!<br />
                  Go back through the form to fix them.
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
