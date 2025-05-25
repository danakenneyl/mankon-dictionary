'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { ref, onValue } from "firebase/database";
import { db } from "@/utils/firebase";
import { FetchAudioFile } from '@/utils/ClientSideAPICalls';
import { WordEntry } from "@/utils/types";
import "@/styles/entry.css";



export default function Entry() {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<WordEntry>({
    altSpelling: "",
    contributorUUIDs: [],
    createdAt: "",
    lastModifiedAt: "string",
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
    status: "",
    partOfSpeech: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [audioUrls, setAudioUrls] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const entriesRef = ref(db, `proposals/${id}`);
    
    // Listen for changes to the entries in Firebase
    const unsubscribe = onValue(entriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as WordEntry;
        setEntry(data);
        
        // Fetch audio files when entry data is loaded
        fetchAllAudioFiles(data);
      } 
      setLoading(false);
    }, (error) => {
      console.error('Error fetching data:', error);
      setError('Failed to load dictionary data. Please try again later.');
      setLoading(false);
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, [id]);
  
  // Fetch all audio files for sentences
  const fetchAllAudioFiles = async (data: WordEntry) => {
    try {
      const audioMap: {[key: string]: string} = {};
      
      // Fetch sentence audio files
      if (data.sentenceAudioFileIds && data.sentenceAudioFileIds.length > 0) {
        for (let i = 0; i < data.sentenceAudioFileIds.length; i++) {
          if (data.sentenceAudioFileIds[i]) {
            const url = await FetchAudioFile(data.sentenceAudioFileIds[i]);
            audioMap[`sentence_${i}`] = url;
          }
        }
      }
      // Fetch word audio file
      if (data.wordAudioFileIds != undefined) {
        const url = await FetchAudioFile(data.wordAudioFileIds[0]);
        audioMap['word'] = url;
      }
      
      setAudioUrls(audioMap);
    } catch (err) {
      console.error("Error fetching audio files:", err);
    }
  };

  // Play audio using the fetched URLs
  const playAudio = (type: string, index?: number) => {
    if (index != undefined) {
      const audioKey = `${type}_${index}`;
      const audioUrl = audioUrls[audioKey];
      
      if (!audioUrl) {
        console.error(`Audio URL not found for ${audioKey}`);
        return;
      }
      const audio = new Audio(audioUrl);
      audio.play().catch(err => {
        console.error("Error playing audio:", err);
      });
    }
    else {
      const audioUrl = audioUrls[type];
      if (!audioUrl) {
        console.error(`Audio URL not found for ${type}`);
        return;
      }
      const audio = new Audio(audioUrl);
      audio.play().catch(err => {
        console.error("Error playing audio:", err);
      });
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }
  
  // If the word doesn't exist
  if (!entry || entry.mankonWord === "") {
    return <div className="not-found">Word not found</div>;
  }

  return (
      <div className="content-wrapper">
        <div className="content">
          <div className="entry__word" id="wordEntry">
            <strong>{entry.mankonWord}</strong> 
            {entry.partOfSpeech && (
              <button
                key={entry.partOfSpeech}
                className="typeButton"
              >
                {entry.partOfSpeech}
              </button>
            )}
            {entry.wordAudioFileIds && (
              <VolumeUpIcon
                className="pronunciation"
                onClick={() => playAudio('word')}
                style={{ cursor: "pointer" }}
            />
          )}
          </div>

          {entry.altSpelling && (
            <strong id="altSpelling" className="altSpelling">
              GACL spelling: {entry.altSpelling}
            </strong>
          )}
          
          <p id="translationEntry" className="translationEntry">
            {entry.translatedWords ? entry.translatedWords.join(", ") : ""}
          </p>
          
          {entry.pairWords && entry.pairWords.length > 0 && (
            <div className="card pair">
              <div className="card-header">Paired Word</div>
              <div className="card-body">
                <ul className="list-group">
                  {entry.pairWords.map((pair, idx) => (
                    <li className="list-group-item" key={idx}>
                      <strong className="mankonExample">{pair}</strong> 
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {entry.mankonSentences && entry.mankonSentences.length > 0 && (
            <div className="card sentences">
              <div className="card-header">Sentence Examples</div>
              <div className="card-body">
                <ul className="list-group">
                  {entry.mankonSentences.map((example, index) => (
                    <li className="list-group-item" key={index}>
                      <strong className="mankonExample">{example}</strong>
                      {entry.sentenceAudioFileIds && entry.sentenceAudioFileIds[index] && (
                        <VolumeUpIcon 
                          className="pronunciation" 
                          onClick={() => playAudio('sentence', index)}
                          style={{ cursor: "pointer" }}
                        />
                      )}
                      <div>
                        <em className="englishExample">
                          {entry.translatedSentences && entry.translatedSentences[index] 
                            ? entry.translatedSentences[index] 
                            : ""}
                        </em>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <p className="alert-text">This entry looks a little empty. That is because it hasn&apos;t been officially added to our dictionary yet! If you would like to see a complete entry for this word, head over to the Word Requests page to find this word and submit a proposal!</p>
        </div>
      </div>

  );
}