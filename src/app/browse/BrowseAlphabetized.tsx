'use client';
// pages/dictionary.tsx
import { useMemo, useState, useEffect, useCallback } from 'react';
import { db } from "@/utils/firebase";
import Link from 'next/link';
import { ref, onValue } from "firebase/database";
import { WordEntry, EntryCollection } from "@/utils/types";
import "@/styles/contribute.css";
import "@/styles/browse.css";


// Interface for grouped entries by letter
interface GroupedEntries {
  [key: string]: [string, WordEntry][];
}

export default function BrowseAlphabetized({page}: {page: string}) {  
  // Select correct alphabet based on URL parameter
  const englishAlphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
  const mankonAlphabet = ["A", "B", "Bv", "Tʃ", "D", "Dv", "Dz", "E", "Ə", "Ɛ", "F", "G", "Ɣ", "I", "Ɨ", "Dʒ", "K", "Kf", "L", "Lv", "M", "N", "Ɲ", "Ŋ", "O", "Ɔ", "S", "Ʃ", "T", "Tf", "Ts", "U", "V", "W", "Y", "Z", "Ʒ"];
  const alphabet = page === "mankon" ? mankonAlphabet : englishAlphabet;
  const isEnglish = page === "english";
  const [entries, setEntries] = useState<EntryCollection>({});
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
        const data = snapshot.val() as EntryCollection;
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

  // Filter entries based on the selected page
  let entriesArray: [string, WordEntry][];
  if (page === "name") {
    // For names page, only get entries with partOfSpeech === "name"
    entriesArray = Object.entries(entries).filter(
      ([, entry]) => entry.status === "initial" && entry.partOfSpeech === "name"
    );
  } else {
    // For other pages, exclude names
    entriesArray = Object.entries(entries).filter(
      ([, entry]) => entry.status === "initial" && entry.partOfSpeech !== "name"
    );
  }
  // Sort entries by their Mankon word
  // If browsing by English, filter out entries without English translations
  if (page === "english") {
    entriesArray = entriesArray.filter(([, entry]) => 
      entry.translatedWords && 
      entry.translatedWords.length > 0 && 
      entry.translatedWords[0] && 
      entry.translatedWords[0].trim() !== ""
    );
  } else if (page === "name") {
    entriesArray = entriesArray.filter(([, entry]) =>
      entry.partOfSpeech &&
      entry.partOfSpeech === "name" 
    );
  }
  
  // Sort entries based on selected language
  const sortedEntries = entriesArray.sort(([, a], [, b]) => {
    if (page === "english") {
      // Sort by English translated word
      if (a.translatedWords && b.translatedWords) {
        return a.translatedWords[0].localeCompare(b.translatedWords[0]);
      }
      return (a.mankonWord || '').localeCompare(b.mankonWord || '');
    } else{
      // Sort by Mankon word
      return a.mankonWord.localeCompare(b.mankonWord);
    } 
  });

  // Function to normalize a string (remove tones and convert to uppercase)
  const normalizeString = useCallback((str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  }, []);

  // Group entries by their first letter according to selected alphabet
  const groupEntriesByLetter = useCallback((entries: [string, WordEntry][]): GroupedEntries => {
    const grouped: GroupedEntries = {};
    
    // Initialize groups for each letter in the selected alphabet
    alphabet.forEach(letter => {
      grouped[letter] = [];
    });
    
    // Also create an "Other" group for characters not in the alphabet
    grouped["#"] = [];

    // Group each entry by matching it to the appropriate alphabet letter
    entries.forEach(entry => {
      const word = page === "english" && entry[1].translatedWords ? entry[1].translatedWords[0] : entry[1].mankonWord;
      if (word && word.length > 0) {
        // Normalize the word for comparison (uppercase and remove diacritics)
        const normalizedWord = normalizeString(word);
        
        // Find the matching letter in the selected alphabet
        let assigned = false;
        
        // Sort the alphabet by length in descending order to check longer prefixes first
        // This ensures "Dʒ" is checked before "D" for correct matching
        const sortedAlphabet = [...alphabet].sort((a, b) => b.length - a.length);
        
        for (const letter of sortedAlphabet) {
          const normalizedLetter = normalizeString(letter);
          
          // Check if the word starts with this letter
          if (normalizedWord.startsWith(normalizedLetter)) {
            grouped[letter].push(entry);
            assigned = true;
            break;
          }
        }
        
        // If no match was found, add to "Other" group
        if (!assigned) {
          grouped["#"].push(entry);
        }
      }
    });
    
    return grouped;
  }, [alphabet, page, normalizeString]);

  // Group entries by letter
  const groupedEntries = groupEntriesByLetter(sortedEntries);
  
  // Get only the letters that have entries (including "Other" if it has entries)
  const lettersWithEntries = useMemo(() => [
    ...alphabet.filter(letter => 
      groupedEntries[letter] && groupedEntries[letter].length > 0
    ),
    ...(groupedEntries["#"] && groupedEntries["#"].length > 0 ? ["#"] : [])
  ], [alphabet, groupedEntries]);

  // Set default selected letter when entries load
  useEffect(() => {
    if (!loading && Object.keys(entries).length > 0 && !selectedLetter) {
      // Auto-select the first letter with entries when the component loads
      const firstLetterWithEntries = lettersWithEntries[0];
      if (firstLetterWithEntries) {
        setSelectedLetter(firstLetterWithEntries);
      }
    }
  }, [loading, entries, lettersWithEntries, selectedLetter]);
  
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

          {entry.translatedWords && 
          <h5 className="">
            {entry.translatedWords[0]}
            {entry.partOfSpeech && (
              <button
                key={entry.partOfSpeech}
                className="typeButton-2"
              >
                {entry.partOfSpeech}
              </button>
            )}
          </h5>}
          
          <p className="mb-1">{entry.mankonWord}</p>
        </div>
      ) : (
        <div>
          <h5 className="mb-1">
            {entry.mankonWord} 
            {entry.partOfSpeech && (
              <button
                key={entry.partOfSpeech}
                className="typeButton-2"
              >
                {entry.partOfSpeech}
              </button>
            )}
            </h5>
          <p className="mb-1">{entry.translatedWords ? entry.translatedWords.join(", "): " \n"}</p>
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
          <div className="custom-alpha-nav flex flex-wrap justify-center mt-6 mb-8">
            {lettersWithEntries.map(letter => (
              <button
                key={letter}
                data-nav-type="alpha"
                className={`custom-nav-btn m-1 px-3 py-1 rounded ${
                  selectedLetter === letter
                    ? 'custom-nav-selected'
                    : ''
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
              <div className="custom-pagination flex justify-center items-center mt-8">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  data-nav-type="pagination"
                  className="custom-nav-btn mx-1 px-3 py-1 rounded"
                >
                  &laquo;
                </button>
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  data-nav-type="pagination"
                  className="custom-nav-btn mx-1 px-3 py-1 rounded"
                >
                  &lt;
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const showPageNumbers = 5;
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
                        data-nav-type="pagination"
                        className={`custom-nav-btn mx-1 px-3 py-1 rounded ${
                          currentPage === pageNum ? 'custom-nav-selected' : ''
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
                  data-nav-type="pagination"
                  className="custom-nav-btn mx-1 px-3 py-1 rounded"
                >
                  &gt;
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  data-nav-type="pagination"
                  className="custom-nav-btn mx-1 px-3 py-1 rounded"
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