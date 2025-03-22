



'use client';
import { useState, useEffect } from 'react';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { v4 as uuidv4 } from 'uuid';
import { ref, get, remove, update, set } from 'firebase/database';
import { db } from '@/utils/firebase';
import "@/styles/entry.css";

interface Proposal {
    mankonWord: string;
    altSpelling: string;
    pairWords: string;
    type: string;
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

export default function ProposalReview() {
  const id = "00195a95-adc7-4f9a-8ae3-ef446ead3b35";
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Editable fields
  const [mankonWord, setMankonWord] = useState('');
  const [altSpelling, setAltSpelling] = useState('');
  const [translatedWords, setTranslatedWords] = useState<string[]>([]);
  const [pairWords, setPairWords] = useState('');
  const [mankonSentences, setMankonSentences] = useState<string[]>([]);
  const [englishSentences, setEnglishSentences] = useState<string[]>([]);
  
  // Audio state
  const [wordAudio, setWordAudio] = useState('');
  const [sentenceAudios, setSentenceAudios] = useState<string[]>([]);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const proposalRef = ref(db, `proposals/${id}`);
        const snapshot = await get(proposalRef);
        
        if (snapshot.exists()) {
          const proposalData = snapshot.val() as Proposal;
          setProposal(proposalData);
          
          // Initialize editable states
          setMankonWord(proposalData.mankonWord || '');
          setAltSpelling(proposalData.altSpelling || '');
          setTranslatedWords(proposalData.translatedWord ? 
            (Array.isArray(proposalData.translatedWord) ? 
              proposalData.translatedWord : [proposalData.translatedWord]) : []);
          setPairWords(proposalData.pairWords || '');
          setMankonSentences(proposalData.mankonSentence || []);
          setEnglishSentences(proposalData.translatedSentence || []);
          setWordAudio(proposalData.audioWord || '');
          setSentenceAudios(proposalData.audioSentence || []);
        } else {
          setError('Proposal not found');
        }
      } catch (err) {
        setError('Error fetching proposal: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [id]);

  // Play audio for word pronunciation and sentence pronunciations
  const playAudio = (audioSrc: string) => {
    if (!audioSrc) return; // Prevent errors if there's no audio file
    const audio = new Audio(`/mankon-dictionary/audio/${audioSrc}`);
    audio.play();
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this proposal?')) return;
    
    try {
      const proposalRef = ref(db, `proposals/${id}`);
      await remove(proposalRef);
      alert('Proposal rejected successfully');
    } catch (err) {
      alert('Error rejecting proposal: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleReturnToProposals = async () => {
    try {
      const proposalRef = ref(db, `proposals/${id}`);
      const updatedProposal = {
        mankonWord,
        altSpelling,
        translatedWord: translatedWords,
        pairWords,
        mankonSentence: mankonSentences,
        translatedSentence: englishSentences,
        audioWord: wordAudio,
        audioSentence: sentenceAudios,
        lastModifiedAt: new Date().toISOString(),
        contributorUUID: proposal?.contributorUUID,
        createdAt: proposal?.createdAt,
        status: 'pending'
      };
      
      await update(proposalRef, updatedProposal);
      alert('Changes saved and returned to proposals');
    } catch (err) {
      alert('Error updating proposal: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleAccept = async () => {
    if (!window.confirm('Are you sure you want to accept this proposal?')) return;
    
    try {
      // Create new UUID for the entry
      const newEntryId = uuidv4();
      const entryRef = ref(db, `entries/${newEntryId}`);
      
      // Create entry object
      const newEntry = {
        mankonWord,
        altSpelling,
        translatedWord: translatedWords,
        pairWords,
        mankonSentence: mankonSentences,
        translatedSentence: englishSentences,
        audioWord: wordAudio,
        audioSentence: sentenceAudios,
        createdAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        type: 'word',
        contributorUUIDs: [proposal?.contributorUUID]
      };
      
      // Add to entries
      await set(entryRef, newEntry);
      
      // Remove from proposals
      const proposalRef = ref(db, `proposals/${id}`);
      await remove(proposalRef);
      
      alert('Proposal accepted and added to dictionary');
    } catch (err) {
      alert('Error accepting proposal: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!proposal) return <div>Proposal not found</div>;

  return (
    <center>
      <div className="content-wrapper">
        <div className="content">
          <div className="entry__word" id="wordEntry">
            <input 
              type="text" 
              value={mankonWord} 
              onChange={(e) => setMankonWord(e.target.value)}
              className="edit-input edit-title"
              placeholder="Mankon Word"
            />
            <span className="entry__pos" id="posEntry">
              {proposal.type || ''}
            </span>
            {wordAudio && (
              <VolumeUpIcon
                className="pronunciation"
                onClick={() => playAudio(wordAudio)}
                style={{ cursor: "pointer" }}
              />
            )}
            <button 
              className="small-button" 
              onClick={() => alert('Audio recording functionality would be implemented here')}
            >
              Re-record
            </button>
          </div>

          <div className="alt-spelling">
            <p>
              <strong>Alternate Spelling: </strong>
              <input 
                type="text" 
                value={altSpelling} 
                onChange={(e) => setAltSpelling(e.target.value)}
                className="edit-input"
                placeholder="Alternate spelling (optional)"
              />
            </p>
          </div>

          <p id="translationEntry" className="translationEntry">
            <input 
              type="text" 
              value={translatedWords.join(', ')} 
              onChange={(e) => setTranslatedWords(e.target.value.split(',').map(w => w.trim()))}
              className="edit-input"
              placeholder="English translations (comma separated)"
            />
          </p>

          <div className="card pair">
            <div className="card-header">Paired Word</div>
            <div className="card-body">
              <ul className="list-group">
                <li className="list-group-item">
                  <input 
                    type="text" 
                    value={pairWords} 
                    onChange={(e) => setPairWords(e.target.value)}
                    className="edit-input"
                    placeholder="Paired word"
                  />
                </li>
              </ul>
            </div>
          </div>

          <div className="card sentences">
            <div className="card-header">Sentence Examples</div>
            <div className="card-body">
              <ul className="list-group">
                {mankonSentences.map((example, index) => (
                  <li className="list-group-item" key={index}>
                    <input 
                      type="text" 
                      value={example} 
                      onChange={(e) => {
                        const newSentences = [...mankonSentences];
                        newSentences[index] = e.target.value;
                        setMankonSentences(newSentences);
                      }}
                      className="edit-input"
                      placeholder="Mankon sentence"
                    />
                    {sentenceAudios[index] && (
                      <VolumeUpIcon
                        className="pronunciation"
                        onClick={() => playAudio(sentenceAudios[index])}
                        style={{ cursor: "pointer" }}
                      />
                    )}
                    <button 
                      className="small-button" 
                      onClick={() => alert(`Re-record audio for sentence ${index + 1}`)}
                    >
                      Re-record
                    </button>
                    <div>
                      <input 
                        type="text" 
                        value={englishSentences[index] || ''} 
                        onChange={(e) => {
                          const newSentences = [...englishSentences];
                          newSentences[index] = e.target.value;
                          setEnglishSentences(newSentences);
                        }}
                        className="edit-input"
                        placeholder="English translation"
                      />
                    </div>
                  </li>
                ))}
                <li className="list-group-item">
                  <button 
                    onClick={() => {
                      setMankonSentences([...mankonSentences, '']);
                      setEnglishSentences([...englishSentences, '']);
                      setSentenceAudios([...sentenceAudios, '']);
                    }}
                  >
                    Add Sentence
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="action-button reject" 
              onClick={handleReject}
            >
              Reject
            </button>
            <button 
              className="action-button return" 
              onClick={handleReturnToProposals}
            >
              Return to Proposals
            </button>
            <button 
              className="action-button accept" 
              onClick={handleAccept}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </center>
  );
}