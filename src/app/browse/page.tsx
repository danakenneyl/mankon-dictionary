'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { JsonData, MankonWordInfo } from '@/components/types/Datatypes';
import alphabetize from '@/components/utils/Alphabetize';
import { useState, useEffect } from 'react';
// comment to be deleted later
const englishAlphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
const mankonAlphabet = ["A", "B", "Tʃ", "Ɣ", "Ɨ", "K", "L", "M", "N", "Ŋ", "O", "Ʃ", "T", "W", "Y", "Z", "Ʒ"];

export default function Browse() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<MankonWordInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEnglish = id === "browse-english";
  const alphabet = isEnglish ? englishAlphabet : mankonAlphabet;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace this with your actual data fetching logic
        const response = await fetch('/api/dictionary-data');
        const jsonData: JsonData = await response.json();
        setData(jsonData.data);
        setIsLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError('Failed to load dictionary data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="content-wrapper">Loading...</div>;
  }

  if (error) {
    return <div className="content-wrapper">Error: {error}</div>;
  }

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
                      <h5 className="mb-1">
                        {isEnglish ? entry.english[0] : entry.mankon} ({entry.pos})
                      </h5>
                      <p className="mb-1">
                        {isEnglish ? entry.mankon : entry.english[0]}
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
  );
}