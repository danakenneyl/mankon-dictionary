'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ref, onValue, Database } from "firebase/database";
import ToggleLang from "./ToggleLang";
import { useSearch } from '@/utils/SearchContext';

// Type definitions based on your structure
interface EntriesCollection {
  [key: string]: Entry;
}

interface Entry {
  altSpelling?: string;
  contributorUUIDs?: string[];
  createdAt: string;
  lastModifiedAt: string;
  mankonSentences?: string[];
  mankonWord: string;
  pairWords?: string[];
  sentenceAudioFilenames?: string[];
  sentenceFileIds?: string[];
  wordAudioFileId?: string;
  translatedSentence?: string[];
  translatedWords: string[];
  type?: string;
  status?: string;
}

interface SearchBarProps {
  db: Database;  // Firebase database instance
}

export default function SearchBar({ db }: SearchBarProps) {
  const router = useRouter();
  const [filteredData, setFilteredData] = useState<{key: string, entry: Entry}[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const { searchEng } = useSearch();
  
  // State for holding dictionary entries from Firebase
  const [entries, setEntries] = useState<EntriesCollection>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to normalize text by removing diacritics for search comparison
  const normalizeDiacritics = (text: string): string => {
    // First, normalize the string to decomposed form (NFD)
    // This separates base characters from combining marks
    return text.normalize('NFD')
      // Then remove the combining marks (diacritics)
      .replace(/[\u0300-\u036f]/g, '');
  };

  // Get word without diacritics for comparison
  const getWordWithoutDiacritics = (word: string): string => {
    return normalizeDiacritics(word.toLowerCase());
  };
  
  // Fetch data from Firebase when component mounts
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
  }, [db]);

  const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchWord = event.target.value.toLowerCase();
    setInputValue(searchWord);
    
    if (!searchWord) {
      clearData();
    } else {
      // Get normalized search word (without diacritics)
      const normalizedSearchWord = getWordWithoutDiacritics(searchWord);
      
      // Filter the entries based on search term and language selection
      const newFilter = Object.entries(entries)
        .filter(([, entry]) => {
          if (searchEng) {
            // For English, match as before
            return entry.translatedWords.some(engWord => 
              engWord.toLowerCase().startsWith(searchWord));
          } else {
            // For Mankon, ignore diacritics when matching
            const normalizedMankonWord = getWordWithoutDiacritics(entry.mankonWord);
            return normalizedMankonWord.startsWith(normalizedSearchWord);
          }
        })
        .map(([key, entry]) => ({
          key,
          entry
        }));
      
      setFilteredData(newFilter);
      setSelectedIndex(-1);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (inputValue === "") return;
    
    if (event.key === "Enter") {
      let match;
      
      if (searchEng) {
        // For English, match exactly as before
        match = filteredData.find(({entry}) => 
          entry.translatedWords.some(engWord => 
            engWord.toLowerCase() === inputValue.toLowerCase())
        );
      } else {
        // For Mankon, match ignoring diacritics
        const normalizedInput = getWordWithoutDiacritics(inputValue);
        match = filteredData.find(({entry}) => 
          getWordWithoutDiacritics(entry.mankonWord) === normalizedInput
        );
      }
            
      if (match) {
        handleNavigateToEntry(match.key);
      } else {
        handleNotFound();
      }
    } else if (event.key === "ArrowDown" && filteredData.length > 0) {
      const newIndex = Math.min(selectedIndex + 1, filteredData.length - 1);
      setSelectedIndex(newIndex);
      // For English, get the first word from the array
      const newValue = searchEng 
        ? filteredData[newIndex].entry.translatedWords[0] 
        : filteredData[newIndex].entry.mankonWord;
      setInputValue(newValue);
    } else if (event.key === "ArrowUp" && selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      // For English, get the first word from the array
      const newValue = searchEng 
        ? filteredData[newIndex].entry.translatedWords[0] 
        : filteredData[newIndex].entry.mankonWord;
      setInputValue(newValue);
    }
  };

  const clearData = () => {
    setFilteredData([]);
    setInputValue("");
  };

  const handleNavigateToEntry = (id: string) => {
    clearData();
    router.push(`/entry/${id}`);
  };

  const handleNotFound = () => {
    clearData();
    router.push("/not-found");
  };

  // Show loading state if data is still loading
  if (loading) {
    return <div className="search">Loading dictionary data...</div>;
  }

  // Show error state if there's an error
  if (error) {
    return <div className="search error">{error}</div>;
  }

  return (
    <div className="search">
      <div className="searchInputs">
        <input
          type="text"
          placeholder={searchEng ? "Search in English" : "Search in Mankon"}
          value={inputValue}
          onChange={handleFilter}
          onKeyDown={handleKeyDown}
          aria-label="Search dictionary"
        />
        <div className="searchIcon">
          <ToggleLang />
        </div>
      </div>
      {filteredData.length > 0 && (
        <div className="dataResult">
          {filteredData.slice(0, 5).map(({key, entry}, index) => (
            <div
              key={key}
              className={`dataItem ${selectedIndex === index ? "selected" : ""}`}
              onClick={() => handleNavigateToEntry(key)}
            >
              {searchEng
                ? <p>{entry.translatedWords.join(", ")}</p>
                : <p>{entry.mankonWord}</p>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
}