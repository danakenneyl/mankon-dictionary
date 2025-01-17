import { JsonData } from '../Datatypes';
import { Link } from 'react-router-dom';
import { useParams } from "react-router-dom";

// Alphabet definitions
const englishAlphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
const mankonAlphabet = ["A", "B", "Tʃ", "Ɣ", "Ɨ", "K", "L", "M", "N", "Ŋ", "O", "Ʃ", "T", "W", "Y", "Z", "Ʒ"];

function Browse({ data }: JsonData) {
  const { id } = useParams<{ id: string }>();
  const isEnglish = id === "browse-english";

  // Choose the correct alphabet and sorting key
  const alphabet = isEnglish ? englishAlphabet : mankonAlphabet;
  const key = isEnglish ? "english" : "mankon";

  // Group words by their starting letter
  const groupedWords = data.reduce((acc, entry) => {
    const firstLetter = entry[key][0].toUpperCase();  // Extract first letter
    if (!acc[firstLetter]) acc[firstLetter] = [];     // Initialize if empty
    acc[firstLetter].push(entry);
    return acc;
  }, {} as Record<string, typeof data>);

  return (
    <center>
      <div className="content">
        <ul className="list-group">
          {alphabet.map(letter => (
            <li key={letter} className="list-group-item">
              {letter}
              <div className="list-group">
                {groupedWords[letter]?.map(entry => (
                  <Link key={entry.mankon} to={`/mankon-dictionary/entry/${entry.mankon}`} className="list-group-item list-group-item-action">
                    <div>
                      <h5 className="mb-1">{isEnglish ? entry.english : entry.mankon} ({entry.pos})</h5>
                      <p className="mb-1">{isEnglish ? entry.mankon : entry.english}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </center>
  );
}

export default Browse;
