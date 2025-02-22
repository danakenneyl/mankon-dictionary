'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { JsonData } from '@/components/types/Datatypes';
import alphabetize from '@/components/utils/Alphabetize';

const englishAlphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
const mankonAlphabet = ["A", "B", "Tʃ", "Ɣ", "Ɨ", "K", "L", "M", "N", "Ŋ", "O", "Ʃ", "T", "W", "Y", "Z", "Ʒ"];

export default function Browse({ data }: JsonData) {
const { id } = useParams<{ id: string }>();
  const isEnglish = id === "browse-english";

  // Select correct alphabet
  const alphabet = isEnglish ? englishAlphabet : mankonAlphabet;

  // Group words by their starting letter
  const alphabetized = alphabetize(data, isEnglish);

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
                    key={entry.english ? `${entry.mankon}-${entry.english}-${entry.pos}` : `${entry.mankon}-${entry.pos}`}
                    href={`/mankon-dictionary/entry/${entry.mankon}`}
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
