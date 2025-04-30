'use client';
// pages/dictionary.tsx
import { useState, useEffect, useCallback } from 'react';
import { db } from "@/utils/firebase";
import Link from 'next/link';
import { ref, onValue } from "firebase/database";
import { useParams } from 'next/navigation';
import "@/styles/home.css";
import "@/styles/contribute.css";
import "@/styles/browse.css";

// Updated interface to match the new requirements
interface WordEntry {
  altSpelling?: string;
  contributorUUID: string;
  createdAt: string;
  lastModifiedAt: string;
  mankonSentences?: string[];
  mankonWord: string;
  pairWords?: string[];
  sentenceAudioFileIds: string[];
  sentenceAudioFilenames: string[];
  translatedSentences?: string[];
  translatedWords: string[];
  type?: string;
  wordAudioFileIds: string[];
  wordAudioFilenames: string[];
  status: string;
}

// TypeScript interface for the entries collection
interface EntriesCollection {
  [key: string]: WordEntry;
}

// Interface for grouped entries by letter
interface GroupedEntries {
  [key: string]: [string, WordEntry][];
}

export default function Browse() {
  const { id } = useParams<{ id: string }>();
  const isEnglish = id === "browse-english";
  
  // Select correct alphabet based on URL parameter
  const englishAlphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
  const mankonAlphabet = ["A", "B", "Bv", "Tʃ", "D", "Dv", "Dz", "Dʒ", "E", "G", "Ɣ", "Ɨ", "K", "Kf", "L", "Lv", "M", "N", "Ɲ", "Ŋ", "O", "Ɔ", "S", "Ʃ", "T", "Tf", "Ts", "V", "W", "Y", "Z", "Ʒ"];
  const alphabet = isEnglish ? englishAlphabet : mankonAlphabet;

  const [entries, setEntries] = useState<EntriesCollection>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(50);
  const [selectedLetter, setSelectedLetter] = useState<string>("");

  useEffect(() => {
    const entriesRef = ref(db, 'proposals');
    
    // Listen for changes to the entries in Firebase
    const unsubscribe = onValue(entriesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as EntriesCollection;
        setEntries(data);
      } else {
        setEntries({});
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching data:', error);
      setError('Failed to load dictionary data. Please try again later.');
      setLoading(false);
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);

  // Get all entries as an array, filtered to exclude those with status other than "initial"
  const entriesArray = Object.entries(entries).filter(
    ([, entry]) => entry.status === "initial"
  );
  
  // Sort entries based on selected language
  const sortedEntries = entriesArray.sort(([, a], [, b]) => {
    if (isEnglish) {
      // Sort by English translated word
      return a.translatedWords[0].localeCompare(b.translatedWords[0]);
    } else {
      // Sort by Mankon word
      return a.mankonWord.localeCompare(b.mankonWord);
    }
  });

  // Function to normalize characters (remove tones and convert to uppercase)
  const normalizeChar = useCallback((char: string): string => {
    // Convert to uppercase first
    const upperChar = char.toUpperCase();
    
    // Handle all four tone marks in Mankon: acute (á), grave (à), caron/háček (ǎ), and circumflex (â)
    // NFD normalization decomposes characters with diacritical marks
    // Then we remove the combining marks in the Unicode range U+0300 to U+036F
    return upperChar.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }, []);

  // Group entries by their first letter according to selected alphabet
  const groupEntriesByLetter = useCallback((entries: [string, WordEntry][]): GroupedEntries => {
    const grouped: GroupedEntries = {};
    
    // Initialize groups for each letter in the selected alphabet
    alphabet.forEach(letter => {
      grouped[letter] = [];
    });
    
    // Also create an "Other" group for characters not in the alphabet
    grouped["Other"] = [];

    // Group each entry by its first letter/character
    entries.forEach(entry => {
      const word = isEnglish ? entry[1].translatedWords[0] : entry[1].mankonWord;
      if (word && word.length > 0) {
        // Get the first character of the word and normalize it
        const firstChar = normalizeChar(word.charAt(0));
        
        // Find the matching letter in the selected alphabet (case insensitive)
        let assigned = false;
        
        for (const letter of alphabet) {
          // Compare the normalized first character with the normalized first character of each letter
          if (normalizeChar(letter.charAt(0)) === firstChar) {
            grouped[letter].push(entry);
            assigned = true;
            break;
          }
        }
        
        // If no match was found, add to "Other" group
        if (!assigned) {
          grouped["Other"].push(entry);
        }
      }
    });
    
    return grouped;
  }, [alphabet, isEnglish, normalizeChar]);

  // Group entries by letter
  const groupedEntries = groupEntriesByLetter(sortedEntries);
  
  // Get only the letters that have entries (including "Other" if it has entries)
  const lettersWithEntries = [
    ...alphabet.filter(letter => 
      groupedEntries[letter] && groupedEntries[letter].length > 0
    ),
    ...(groupedEntries["Other"] && groupedEntries["Other"].length > 0 ? ["Other"] : [])
  ];

  // Set default selected letter when entries load
  useEffect(() => {
    if (!loading && Object.keys(entries).length > 0 && !selectedLetter) {
      const filteredEntries = Object.entries(entries).filter(
        ([, entry]) => entry.status === "initial"
      );
      
      if (filteredEntries.length > 0) {
        const sortedEntries = filteredEntries.sort(([, a], [, b]) => {
          if (isEnglish) {
            return a.translatedWords[0].localeCompare(b.translatedWords[0]);
          } else {
            return a.mankonWord.localeCompare(b.mankonWord);
          }
        });
        
        const groupedByLetter = groupEntriesByLetter(sortedEntries);
        const firstLetterWithEntries = [...alphabet, "Other"].find(
          letter => groupedByLetter[letter] && groupedByLetter[letter].length > 0
        );
        
        if (firstLetterWithEntries) {
          setSelectedLetter(firstLetterWithEntries);
        }
      }
    }
  }, [loading, entries, alphabet, isEnglish, selectedLetter, groupEntriesByLetter]);
  
  // Reset page when letter changes
  useEffect(() => {
    if (selectedLetter) {
      setCurrentPage(1);
    }
  }, [selectedLetter]);

  // Get entries for the selected letter
  const entriesForSelectedLetter = selectedLetter ? groupedEntries[selectedLetter] || [] : [];
  
  // Calculate pagination values for the selected letter's words
  const totalWords = entriesForSelectedLetter.length;
  const indexOfLastWord = currentPage * itemsPerPage;
  const indexOfFirstWord = indexOfLastWord - itemsPerPage;
  const currentWords = entriesForSelectedLetter.slice(indexOfFirstWord, indexOfFirstWord + itemsPerPage);
  const totalPages = Math.ceil(totalWords / itemsPerPage);

  // Function to change letter
  const selectLetter = (letter: string) => {
    setSelectedLetter(letter);
    setCurrentPage(1); // Reset to first page when changing letter
  };

  // Function to change page within a letter
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Function to go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Function to go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Function to determine the word display order
  const getDisplayWord = (entry: WordEntry) => {
    return isEnglish 
      ? (
        <div>
          <h5 className="mb-1">{entry.translatedWords[0]}</h5>
          <p className="mb-1">{entry.mankonWord}</p>
        </div>
      ) : (
        <div>
          <h5 className="mb-1">{entry.mankonWord}</h5>
          <p className="mb-1">{entry.translatedWords[0]}</p>
        </div>
      );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Dictionary...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="content">
        <h2 className="text-3xl font-bold mb-6 text-center">Browse</h2>

        <div className="intro-decoration">
          <div className="decoration-line"></div>
          <div className="decoration-symbol"></div>
          <div className="decoration-line"></div>
        </div>

        {/* Alphabet Navigation */}
        {lettersWithEntries.length > 0 && (
          <div className="flex flex-wrap justify-center mt-6 mb-8">
            {lettersWithEntries.map(letter => (
              <button
                key={letter}
                className={`m-1 px-3 py-1 rounded ${
                  selectedLetter === letter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                onClick={() => selectLetter(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
        )}

        {/* Dictionary Listing for Selected Letter */}
        {selectedLetter && (
          <div className="my-6">
            <h3 className="text-2xl font-bold mb-4">{selectedLetter}</h3>
            
            <div className="list-group">
              {currentWords.map(([id, entry]) => (
                <Link 
                  key={id} 
                  href={`/entry/${id}`}
                  className="list-group-item list-group-item-action"
                >
                  {getDisplayWord(entry)}
                </Link>
              ))}
            </div>

            {/* Pagination for words within the selected letter */}
            {totalWords > itemsPerPage && (
              <div className="flex justify-center items-center mt-8">
                <button 
                  onClick={() => setCurrentPage(1)} 
                  disabled={currentPage === 1}
                  className={`mx-1 px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  &laquo;
                </button>
                <button 
                  onClick={prevPage} 
                  disabled={currentPage === 1}
                  className={`mx-1 px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  &lt;
                </button>
                
                {/* Page Numbers */}
                {[...Array(totalPages)].map((_, i) => {
                  // Show 5 page numbers at a time with current page in the middle when possible
                  const pageNum = i + 1;
                  const showPageNumbers = 5; // How many page numbers to show at once
                  const halfShow = Math.floor(showPageNumbers / 2);
                  
                  let startPage = Math.max(1, currentPage - halfShow);
                  const endPage = Math.min(totalPages, startPage + showPageNumbers - 1);
                  
                  if (endPage - startPage + 1 < showPageNumbers) {
                    startPage = Math.max(1, endPage - showPageNumbers + 1);
                  }
                  
                  if (pageNum >= startPage && pageNum <= endPage) {
                    return (
                      <button
                        key={i}
                        onClick={() => paginate(pageNum)}
                        className={`mx-1 px-3 py-1 rounded ${
                          currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
                
                <button 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages}
                  className={`mx-1 px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  &gt;
                </button>
                <button 
                  onClick={() => setCurrentPage(totalPages)} 
                  disabled={currentPage === totalPages}
                  className={`mx-1 px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  &raquo;
                </button>
              </div>
            )}
          </div>
        )}

        {/* Show a message if no entries are found */}
        {lettersWithEntries.length === 0 && (
          <div className="text-center my-12">
            <p className="text-xl">No dictionary entries found.</p>
          </div>
        )}
      </div>
    </div>
  );
}