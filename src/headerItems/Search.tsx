import React, { useState, useEffect } from 'react';

export interface MankonEntry {
  partOfSpeech: string;
  wordAudioFiles: string[];
  translation: string[];
  definition: string;
  sentencesMankon: string[];
  sentencesTranslation: string[];
  sentencesAudioFiles: string[];
}

interface DictionaryData {
  searchMankon: {
    [key: string]: MankonEntry;
  };
  searchEnglish: Array<{
    [key: string]: string;
  }>;
}

export interface SearchResult extends MankonEntry {
  englishWord: string;
  mankonWord: string;
}

export interface SearchError {
  error: string;
}

type SearchResultOrError = SearchResult | SearchError;

interface SearchProps {
  onSearch: (result: SearchResultOrError) => void;
}

const Search: React.FC<SearchProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<Array<{ [key: string]: string }>>([]);
  const [dictionaryData, setDictionaryData] = useState<DictionaryData>({
    searchMankon: {},
    searchEnglish: []
  });

  useEffect(() => {
    const loadDictionaryData = async () => {
      try {
        const response = await fetch('/dictionary.json');
        const data: DictionaryData = await response.json();
        console.log("Loaded dictionary data:", data);
        setDictionaryData(data);
      } catch (error) {
        console.error('Error loading dictionary:', error);
      }
    };

    loadDictionaryData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!isComposing && value.trim() !== '') {
      const filtered = dictionaryData.searchEnglish
        .filter(entry => {
          const englishWord = Object.keys(entry)[0];
          return englishWord.toLowerCase().startsWith(value.toLowerCase());
        })
        .slice(0, 5);

      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
    // Update suggestions after composition ends
    if (searchTerm.trim() !== '') {
      const filtered = dictionaryData.searchEnglish
        .filter(entry => {
          const englishWord = Object.keys(entry)[0];
          return englishWord.toLowerCase().startsWith(searchTerm.toLowerCase());
        })
        .slice(0, 5);

      setSuggestions(filtered);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isComposing) {
      performSearch(searchTerm);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: { [key: string]: string }) => {
    const englishWord = Object.keys(suggestion)[0];
    setSearchTerm(englishWord);
    performSearch(englishWord);
    setSuggestions([]);
  };

  const performSearch = (term: string) => {
    const englishEntry = dictionaryData.searchEnglish.find(
      entry => Object.keys(entry)[0].toLowerCase() === term.toLowerCase()
    );

    if (!englishEntry) {
      onSearch({ error: 'Word not found in English dictionary' });
      return;
    }

    const mankonWord = englishEntry[Object.keys(englishEntry)[0]];
    const mankonEntry = dictionaryData.searchMankon[mankonWord];

    if (!mankonEntry) {
      onSearch({ error: 'Mankon translation not found' });
      return;
    }

    onSearch({
      englishWord: term,
      mankonWord,
      ...mankonEntry
    });
  };

  return (
    <div className="header__search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Search in English..."
        value={searchTerm}
        onChange={handleInputChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
      />
      <div id="searchResults" className={suggestions.length > 0 ? '' : 'hidden'}>
        {suggestions.map((suggestion, index) => {
          const englishWord = Object.keys(suggestion)[0];
          return (
            <div
              key={index}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {englishWord} - {suggestion[englishWord]}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Search;
