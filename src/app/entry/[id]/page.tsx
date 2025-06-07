'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { ref as databaseRef, onValue } from "firebase/database";
import { ref as storageRef, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/utils/firebase";
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
    // Fetch audio file from Firebase Storage using filename
    const fetchAudioFromStorage = useCallback(async (filename: string): Promise<string> => {
      try {
        // Create a reference to the file in Firebase Storage
        // Adjust the path structure based on your Firebase Storage organization
        // console.log(`Attempting to fetch: proposal/${filename.slice(0, -4)}.ogg`);
        const audioRef = storageRef(storage, `proposal/${filename.slice(0, -4)}.ogg`);
        const url = await getDownloadURL(audioRef);
        return url;
      } catch (error) {
        console.error(`Error fetching audio file ${filename}:`, error);
        throw error;
      }
    }, []);
    
    // Fetch all audio files for sentences and words
    const fetchAllAudioFiles = useCallback(async (data: WordEntry) => {
      try {
        const audioMap: {[key: string]: string} = {};
        
        // Fetch sentence audio files using filenames
        if (data.sentenceAudioFilenames && data.sentenceAudioFilenames.length > 0) {
          for (let i = 0; i < data.sentenceAudioFilenames.length; i++) {
            if (data.sentenceAudioFilenames[i]) {
              try {
                const url = await fetchAudioFromStorage(data.sentenceAudioFilenames[i]);
                audioMap[`sentence_${i}`] = url;
              } catch (err) {
                console.error(`Failed to fetch sentence audio ${i}:`, err);
              }
            }
          }
        }
        
        // Fetch word audio file using filename
        if (data.wordAudioFilenames && data.wordAudioFilenames.length > 0) {
          try {
            const url = await fetchAudioFromStorage(data.wordAudioFilenames[0]);
            audioMap['word'] = url;
          } catch (err) {
            console.error("Failed to fetch word audio:", err);
          }
        }
        
        setAudioUrls(audioMap);
      } catch (err) {
        console.error("Error fetching audio files:", err);
      }
    }, [fetchAudioFromStorage]);
    
  useEffect(() => {
    // Access Realtime Database
    const entriesRef = databaseRef(db, `proposals/${id}`);
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
  }, [id, fetchAllAudioFiles]);
  

  // Play audio using the fetched URLs
  const playAudio = (type: string, index?: number) => {
    let audioKey: string;
    
    if (index !== undefined) {
      audioKey = `${type}_${index}`;
    } else {
      audioKey = type;
    }
    
    const audioUrl = audioUrls[audioKey];
    
    if (!audioUrl) {
      console.error(`Audio URL not found for ${audioKey}`);
      return;
    }
    
    const audio = new Audio(audioUrl);
    audio.play().catch(err => {
      console.error("Error playing audio:", err);
    });
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
            {entry.wordAudioFilenames && entry.wordAudioFilenames.length > 0 && (
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
                      {entry.sentenceAudioFilenames && 
                       entry.sentenceAudioFilenames[index] && 
                       audioUrls[`sentence_${index}`] && (
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