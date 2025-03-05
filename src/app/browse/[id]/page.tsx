'use client'; 
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dictionary from '@/data/dictionary.json';
import alphabetize from '@/components/utils/Alphabetize';

const englishAlphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
const mankonAlphabet = ["A", "B", "Bv", "Tʃ", "D", "Dv", "Dz", "Dʒ", "E", "G", "Ɣ", "Ɨ", "K", "Kf", "L", "Lv", "M", "N", "Ɲ", "Ŋ", "O", "Ɔ", "P", "S", "Ʃ", "T", "Tf", "Ts", "V",  "W", "Y", "Z", "Ʒ"];

export default function Browse() {
const { id } = useParams<{ id: string }>();
  const isEnglish = id === "browse-english";

  // Select correct alphabet
  const alphabet = isEnglish ? englishAlphabet : mankonAlphabet;

  // Group words by their starting letter
  const alphabetized = alphabetize(dictionary, isEnglish);

  return (
    <div className="content-wrapper">
      <div className="content">
        <ul className="list-group">
          {alphabet.map((letter) => (
            <li key={letter} className="list-group-item">
              {letter}
              <div className="list-group">
                {alphabetized[letter]?.map((entry) => (
                  <Link 
                    key={`${entry.mankon}-${entry.english}`} 
                    href={`/entry/${entry.mankon}-${entry.english}`}
                    className="list-group-item list-group-item-action"
                  >
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
    </div>
  );
}