import { JsonData } from "../Datatypes";
import { useParams } from "react-router-dom";
import "./entryItems.css";
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

function Entry({ data }: JsonData) {
  const { id } = useParams<{ id: string }>();
  const value = data.find((item) => item.mankon === id || item.english === id);
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
          <span className="entry__pos" id="posEntry">{value.pos}</span>
          {value.pronunciation?.[0] && (
            <VolumeUpIcon 
                className="pronunciation" 
                onClick={() => playAudio(value.pronunciation[0])}
                style={{ cursor: "pointer" }}
            />
          )}
        </div>
        <p id="translationEntry" className="translationEntry">{value.english}</p>
        <div className="card">
          <div className="card-header">Sentence Examples</div>
          <div className="card-body">
            <ul className="list-group">
              {value.sentencesMankon.map((example, index) => (
                <li className="list-group-item" key={index}>
                  <strong className="mankonExample">{example}</strong>
                  {value.sentencesPronunciation?.[index] && (
                    <VolumeUpIcon 
                      className="pronunciation" 
                      onClick={() => playAudio(value.sentencesPronunciation[index])}
                      style={{ cursor: "pointer" }}
                    />
                  )}
                  <div>
                    <em className="englishExample">{value.sentencesEnglish[index]}</em>
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

export default Entry
