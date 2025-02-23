'use client';
import { useParams } from 'next/navigation';
import { MankonWordInfo } from "@/types/Datatypes";
import dictionary from '@/data/dictionary.json';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

export default function Entry() {
  const { id } = useParams<{ id: string }>();
  const word = decodeURIComponent(id).split("-")[0]; ; 
  const dict = dictionary as MankonWordInfo[];
  const value = dict.find((item) => item.mankon === word || item.english.some((engWord) => engWord === word));

  // This is for Typescript's for error checking. 
  // The the SearchBar will not open a page that doesn't exist
  if (!value) {
    return <div>Word not found</div>;
  }
  // Play audio for word pronunciation and sentence pronunciations
  const playAudio = (audioSrc: string) => {
    if (!audioSrc) return;  // Prevent errors if there's no audio file
    const audio = new Audio(`/mankon-dictionary/audio/${audioSrc}`); 
    audio.play();
  };

  return (
    <center>
      <div className="content-wrapper">
      <div className="content">
        <div className="entry__word" id="wordEntry">
          <strong>{value.mankon}</strong>
          <span className="entry__pos" id="posEntry">{value.posENG}</span>
          {value.pronunciation?.[0] && (
            <VolumeUpIcon 
                className="pronunciation" 
                onClick={() => playAudio(value.pronunciation[0])}
                style={{ cursor: "pointer" }}
            />
          )}
        </div>
        <p id="translationEntry" className="translationEntry">
          {value.english.map((item, idx) => idx != (value.english.length-1) ? <span>{item}, </span> : <span>{item}</span>)}
        </p>
        <div className="card pair">
          <div className="card-header">Paired Word</div>
          <div className="card-body">
            <ul className="list-group">
              <li className="list-group-item" key={value.pair}>
                  <strong className="mankonExample">{value.pair}</strong> 
                  </li>
            </ul>
          </div>
        </div>
        <div className="card sentences">
          <div className="card-header">Sentence Examples</div>
          <div className="card-body">
            <ul className="list-group">
              {value.sentencesMANK.map((example, index) => (
                <li className="list-group-item" key={index}>
                  <strong className="mankonExample">{example}</strong>
                  {value.sentencesPRON?.[index] && (
                    <VolumeUpIcon 
                      className="pronunciation" 
                      onClick={() => playAudio(value.sentencesPRON[index])}
                      style={{ cursor: "pointer" }}
                    />
                  )}
                  <div>
                    <em className="englishExample">{value.sentencesENG[index]}</em>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      </div>
    </center>
  );
}

