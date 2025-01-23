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

  // Prepare data based on language mode
  const processedData = isEnglish
    ? data.flatMap(entry =>
        entry.english.map(engWord => ({
          english: engWord,
          mankon: entry.mankon,
          posENG: entry.posENG
        }))
      ).sort((a, b) => a.english.localeCompare(b.english)) // Sort alphabetically by English
    : data.sort((a, b) => a.mankon.localeCompare(b.mankon)); // Sort alphabetically by Mankon

  // Group words by first letter
  const groupedWords = processedData.reduce((acc, entry) => {
    const firstLetter = isEnglish 
      ? entry.english[0].toUpperCase() 
      : entry.mankon[0].toUpperCase();

    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(entry);
    return acc;
  }, {} as Record<string, typeof processedData>);

  return (
    <center>
      <div className="content-wrapper">
        <div className="content">
          <ul className="list-group">
            {alphabet.map(letter => (
              <li key={letter} className="list-group-item">
                {letter}
                <div className="list-group">
                  {groupedWords[letter]?.map(entry => (
                    <Link 
                      key={`${entry.mankon}-${isEnglish ? entry.english : "mankon"}`} 
                      to={`/mankon-dictionary/entry/${entry.mankon}`} 
                      className="list-group-item list-group-item-action"
                    >
                      <div>
                        <h5 className="mb-1">
                          {isEnglish ? entry.english : entry.mankon} ({entry.posENG})
                        </h5>
                        <p className="mb-1">
                          {isEnglish ? entry.mankon : entry.english.join(", ")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </center>
  );
}

export default Browse;

