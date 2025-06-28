'use client';
// pages/dictionary.tsx
import { useMemo, useState, useEffect, useCallback } from 'react';
import { db } from "@/utils/firebase";
import Link from 'next/link';
import { ref, onValue } from "firebase/database";
import { WordEntry, EntryCollection } from "@/utils/types";
import "@/styles/contribute.css";
import "@/styles/browse.css";
import "@/styles/globals.css";

// Interface for grouped entries by letter
interface GroupedEntries {
  [key: string]: [string, WordEntry][];
}

// Interface for grouped entries by type
interface GroupedEntriesByType {
  [key: string]: [string, WordEntry][];
}

export default function InitialProposals() {  
  const mankonAlphabet = useMemo(() => ["A", "B", "Bv", "Tʃ", "D", "Dv", "Dz", "E", "Ə", "Ɛ", "F", "G", "Ɣ", "I", "Ɨ", "Dʒ", "K", "Kf", "L", "Lv", "M", "N", "Ɲ", "Ŋ", "O", "Ɔ", "S", "Ʃ", "T", "Tf", "Ts", "U", "V", "W", "Y", "Z", "Ʒ"], []);
  
  // Define the types you want to prioritize - you can add more as needed
  const priorityTypes = useMemo(() => [
    "animal",
    "kitchen",
    "anatomy", 
    "food",
    "plant",
    "tool",
    "illness",
    "biblical",
    "clothing",
    "family",
    "emotion",
    "place",
    "male",
    "female",
    "gender-neutral",
    "color",
    "number",
    "date",
    "royal"
  ], []);
  
  const [entries, setEntries] = useState<EntryCollection>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for collapsible sections
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    'entry-proposal': false,
    'priority-requests': false,
    'browse-alphabetically': false
  });
  
  // States for alphabetical browsing
  const [alphabetCurrentPage, setAlphabetCurrentPage] = useState<number>(1);
  const [alphabetItemsPerPage] = useState<number>(50);
  const [selectedLetter, setSelectedLetter] = useState<string>("");
  
  // States for type browsing
  const [typeCurrentPage, setTypeCurrentPage] = useState<number>(1);
  const [typeItemsPerPage] = useState<number>(5);
  const [selectedType, setSelectedType] = useState<string>("");

  // Function to toggle section expansion
  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

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

  // Filter entries to exclude names and get only initial status entries
  const entriesArray: [string, WordEntry][] = Object.entries(entries).filter(
    ([, entry]) => entry.status === "initial" 
  );
  
  // Sort entries by their Mankon word
  const sortedEntries = entriesArray.sort(([, a], [, b]) => {
    return a.mankonWord.localeCompare(b.mankonWord);
  });

  // Function to normalize a string (remove tones and convert to uppercase)
  const normalizeString = useCallback((str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  }, []);

  // Group entries by type
  const groupEntriesByType = useCallback((entries: [string, WordEntry][]): GroupedEntriesByType => {
    const grouped: GroupedEntriesByType = {};
    
    // Initialize groups for each priority type
    priorityTypes.forEach(type => {
      grouped[type] = [];
    });
    
    // Group each entry by type
    entries.forEach(entry => {
      const entryTypes = entry[1].type;
      if (entryTypes && entryTypes.length > 0) {
        // For each type in the entry, add it to the appropriate group
        entryTypes.forEach(type => {
          const normalizedType = type.toLowerCase().trim();
          
          // Check if this type matches any of our priority types
          const matchingPriorityType = priorityTypes.find(priorityType => 
            priorityType.toLowerCase() === normalizedType
          );
          
          if (matchingPriorityType) {
            grouped[matchingPriorityType].push(entry);
          } else {
            // If it's not in our priority list, add it as a new type
            if (!grouped[type]) {
              grouped[type] = [];
            }
            grouped[type].push(entry);
          }
        });
      }
    });
    
    return grouped;
  }, [priorityTypes]);

  // Group entries by letter
  const groupEntriesByLetter = useCallback((entries: [string, WordEntry][]): GroupedEntries => {
    const grouped: GroupedEntries = {};
    
    // Initialize groups for each letter in the Mankon alphabet
    mankonAlphabet.forEach(letter => {
      grouped[letter] = [];
    });
    
    // Also create an "Other" group for characters not in the alphabet
    grouped["#"] = [];

    // Group each entry by matching it to the appropriate alphabet letter
    entries.forEach(entry => {
      const word = entry[1].mankonWord;
      if (word && word.length > 0) {
        // Normalize the word for comparison (uppercase and remove diacritics)
        const normalizedWord = normalizeString(word);
        
        // Find the matching letter in the Mankon alphabet
        let assigned = false;
        
        // Sort the alphabet by length in descending order to check longer prefixes first
        // This ensures "Dʒ" is checked before "D" for correct matching
        const sortedAlphabet = [...mankonAlphabet].sort((a, b) => b.length - a.length);
        
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
  }, [normalizeString, mankonAlphabet]);

  // Group entries by type and letter
  const groupedEntriesByType = groupEntriesByType(sortedEntries);
  const groupedEntries = groupEntriesByLetter(sortedEntries);
  
  // Get only the types that have entries
  const typesWithEntries = useMemo(() => {
    return Object.keys(groupedEntriesByType).filter(type => 
      groupedEntriesByType[type] && groupedEntriesByType[type].length > 0
    ).sort();
  }, [groupedEntriesByType]);
  
  // Get only the letters that have entries (including "Other" if it has entries)
  const lettersWithEntries = useMemo(() => [
    ...mankonAlphabet.filter(letter => 
      groupedEntries[letter] && groupedEntries[letter].length > 0
    ),
    ...(groupedEntries["#"] && groupedEntries["#"].length > 0 ? ["#"] : [])
  ], [groupedEntries, mankonAlphabet]);

  // Set default selected type when entries load
  useEffect(() => {
    if (!loading && Object.keys(entries).length > 0 && !selectedType && typesWithEntries.length > 0) {
      // Auto-select the first type with entries when the component loads
      const firstTypeWithEntries = typesWithEntries[0];
      if (firstTypeWithEntries) {
        setSelectedType(firstTypeWithEntries);
      }
    }
  }, [loading, entries, typesWithEntries, selectedType]);

  // Set default selected letter when entries load (only if no type is selected)
  useEffect(() => {
    if (!loading && Object.keys(entries).length > 0 && !selectedLetter && !selectedType && lettersWithEntries.length > 0) {
      // Auto-select the first letter with entries when the component loads
      const firstLetterWithEntries = lettersWithEntries[0];
      if (firstLetterWithEntries) {
        setSelectedLetter(firstLetterWithEntries);
      }
    }
  }, [loading, entries, lettersWithEntries, selectedLetter, selectedType]);
  
  // Reset page when type changes
  useEffect(() => {
    if (selectedType) {
      setTypeCurrentPage(1);
    }
  }, [selectedType]);
  
  // Reset page when letter changes
  useEffect(() => {
    if (selectedLetter) {
      setAlphabetCurrentPage(1);
    }
  }, [selectedLetter]);

  // Get entries for the selected type
  const entriesForSelectedType = selectedType ? groupedEntriesByType[selectedType] || [] : [];
  
  // Get entries for the selected letter
  const entriesForSelectedLetter = selectedLetter ? groupedEntries[selectedLetter] || [] : [];
  
  // Calculate pagination values for type browsing
  const totalTypeWords = entriesForSelectedType.length;
  const typeIndexOfLastWord = typeCurrentPage * typeItemsPerPage;
  const typeIndexOfFirstWord = typeIndexOfLastWord - typeItemsPerPage;
  const currentTypeWords = entriesForSelectedType.slice(typeIndexOfFirstWord, typeIndexOfFirstWord + typeItemsPerPage);
  const typeTotalPages = Math.ceil(totalTypeWords / typeItemsPerPage);
  
  // Calculate pagination values for alphabet browsing
  const totalAlphabetWords = entriesForSelectedLetter.length;
  const alphabetIndexOfLastWord = alphabetCurrentPage * alphabetItemsPerPage;
  const alphabetIndexOfFirstWord = alphabetIndexOfLastWord - alphabetItemsPerPage;
  const currentAlphabetWords = entriesForSelectedLetter.slice(alphabetIndexOfFirstWord, alphabetIndexOfFirstWord + alphabetItemsPerPage);
  const alphabetTotalPages = Math.ceil(totalAlphabetWords / alphabetItemsPerPage);

  // Function to change type
  const selectType = (type: string) => {
    setSelectedType(type);
    setSelectedLetter(""); // Clear letter selection when selecting type
    setTypeCurrentPage(1);
  };

  // Function to change letter
  const selectLetter = (letter: string) => {
    setSelectedLetter(letter);
    setSelectedType(""); // Clear type selection when selecting letter
    setAlphabetCurrentPage(1);
  };

  // Function to change page within a type
  const paginateType = (pageNumber: number) => setTypeCurrentPage(pageNumber);

  // Function to change page within a letter
  const paginateAlphabet = (pageNumber: number) => setAlphabetCurrentPage(pageNumber);

  // Function to go to next page for type
  const nextTypePage = () => {
    if (typeCurrentPage < typeTotalPages) {
      setTypeCurrentPage(typeCurrentPage + 1);
    }
  };

  // Function to go to previous page for type
  const prevTypePage = () => {
    if (typeCurrentPage > 1) {
      setTypeCurrentPage(typeCurrentPage - 1);
    }
  };

  // Function to go to next page for alphabet
  const nextAlphabetPage = () => {
    if (alphabetCurrentPage < alphabetTotalPages) {
      setAlphabetCurrentPage(alphabetCurrentPage + 1);
    }
  };

  // Function to go to previous page for alphabet
  const prevAlphabetPage = () => {
    if (alphabetCurrentPage > 1) {
      setAlphabetCurrentPage(alphabetCurrentPage - 1);
    }
  };

  // Function to display word entries
  const getDisplayWord = (entry: WordEntry) => {
    return (
      <div>
        <h5 className="mb-1">
          {entry.mankonWord} 
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
    <>
        <h1 className="text-3xl font-bold mb-6 text-center">Propose Word</h1>

        <div className="intro-decoration">
          <div className="decoration-line"></div>
          <div className="decoration-symbol"></div>
          <div className="decoration-line"></div>
        </div>

        {/* Entry Proposal Form Section */}
        <div className="mb-12">
          <div 
            className="flex items-center cursor-pointer mb-4"
            onClick={() => toggleSection('entry-proposal')}
          >
            <h2 className="text-2xl font-bold mr-4">Entry Proposal Form</h2>
            <button 
              data-nav-type="toggle"
              className="custom-nav-btn mx-1 px-3 py-1 rounded"
            >
              {expandedSections['entry-proposal'] ? '−' : '+'}
            </button>
          </div>
          {!expandedSections['entry-proposal'] &&<p>
              Click on the + button to see detailed instuctions for contributing.
              <br/>
              Then click on the &quot;Propose Word&quot; button to navigate to the contribution form. 
          </p> }
          
          {expandedSections['entry-proposal'] && (
            <div className="pl-4">
              <h3>The Entry</h3>
              <p>
                For each entry proposal the Mankon Dictionary asks that you include the word you would 
                like to see represented in this dictionary, its English translation, a recording of its pronunciation,
                and two sentence recordings that caputure the word in context. Writing sentences is optional, although 
                it is prefered.
              </p> 
              <h3>Sentence Examples</h3>
              <p>
                Please take some time before beginning your proposal to compose two sentences that capture your Mankon 
                word in context. The Mankon Dictionary is interested in capturing a diversity of sentence examples to 
                ensure that we can represent Mankon as it lives and breathes. Consider including the word in the middle
                or at the end of a sentence. When choosing a context, consider including the word in a 
                statement, in a question, in a direct order, or in a hypothetical situation. Consider representing the word in 
                several forms. For example, if you wish to propose a verb, consider including the word in a different tense 
                (past, present, future, etc). Most importantly, please ensure that your sentences reflect common contexts
                in which the word appears in Mankon conversations. 
              </p>
              <h3>Recordings</h3>
              <p>
                When creating recordings, keep in mind that natural speech and careful speech often differ. A sentence 
                pronounced slowly and carefully can be valuable in language revitalization efforts, however the Mankon dictionary 
                is currently primarily concerned with representing the Mankon Language as it is spoken in natural conversation.
                As such, the Mankon Dictionary asks that you utilize a natural tone and pace with little concern for precise 
                pronunciation when you are recording. Feel free to clear a recording if you are disatisfied and reattempt 
                until you are satisfied.
              </p>
              <h3>Public Use of Data</h3>
              <p>
                As part of the Mankon Dictionary project, we collect audio recordings from contributors to document 
                and preserve the Mankon language. By submitting a recording, you acknowledge and consent to your voice 
                being publicly available as part of this open-source project. While your audio recordings will be accessible 
                to the public, no identifying information will be associated with them unless you give the Mankon Dictionary 
                express permission by filling out the <strong>Attribution Form </strong> above. 
              </p>
              <h3>What if I cannot type in Mankon?</h3>
              <p>
                That is completely fine! If you are comfortable typing in any language, 
                the Mankon Dictionary is happy to accept proposals in any writing system. 
                If you are not comfortable typing at all, that is OK too!
                Head over to the Propose Word page and click on any requested word that interests you.
                You will be able to propose a new entry without any typing at all.
              </p>

              <p className="alert-text">Please read ALL of the instructions above before filling out this form.</p>
              <div className="button-container">
                <Link href="/contribute/proposal-form/0">
                  <button className="primary-button">Entry Proposal Form</button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Browse by Type Section */}
        {typesWithEntries.length > 0 && (
          <div className="mb-12">
            <div 
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => toggleSection('priority-requests')}
            >
              <h2 className="text-2xl font-bold">Priority Requests</h2>
              <button 
              data-nav-type="toggle"
              className="custom-nav-btn mx-1 px-3 py-1 rounded"
            >
              {expandedSections['priority-requests'] ? '−' : '+'}
            </button>
            </div>
            <p>
              While the Mankon Dictionary is interested in collecting any words that pop into your head, thinking of new words can be hard!
              To help you get started, we have compiled a list of prioritized words that still need attention from our community. 
              Clicking on the words below will take you to the proposal form for that word. All required typing fields will be filled automatically, 
              so you can focus on recording the word and two sentences if you cannot type.
            </p>
            
            {expandedSections['priority-requests'] && (
              <div className="pl-4">

                <p className="alert-text request-wait">WAIT: Do you remember your username? You will need your username to complete your proposal.
                If you don&#39;t have a username, please head over to the Get Started page to create one.
                </p>
                
                {/* Type Navigation */}
                <div className="custom-alpha-nav flex flex-wrap justify-center mt-6 mb-8">
                  {typesWithEntries.map(type => (
                    <button
                      key={type}
                      data-nav-type="type"
                      className={`custom-nav-btn mx-1 px-3 py-1 rounded ${
                        selectedType === type
                          ? 'custom-nav-selected'
                          : ''
                      }`}
                      onClick={() => selectType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Type Dictionary Listing */}
                {selectedType && (
                  <div className="my-6">
                     {/* Type Pagination */}
                     {totalTypeWords > typeItemsPerPage && (
                      <div className="custom-pagination flex justify-center items-center mt-8">
                        <button
                          onClick={() => setTypeCurrentPage(1)}
                          disabled={typeCurrentPage === 1}
                          data-nav-type="pagination"
                          className="custom-nav-btn mx-1 px-3 py-1 rounded"
                        >
                          &laquo;
                        </button>
                        <button
                          onClick={prevTypePage}
                          disabled={typeCurrentPage === 1}
                          data-nav-type="pagination"
                          className="custom-nav-btn mx-1 px-3 py-1 rounded"
                        >
                          &lt;
                        </button>
                        {[...Array(typeTotalPages)].map((_, i) => {
                          const pageNum = i + 1;
                          const showPageNumbers = 5;
                          const halfShow = Math.floor(showPageNumbers / 2);
                          let startPage = Math.max(1, typeCurrentPage - halfShow);
                          const endPage = Math.min(typeTotalPages, startPage + showPageNumbers - 1);
                          if (endPage - startPage + 1 < showPageNumbers) {
                            startPage = Math.max(1, endPage - showPageNumbers + 1);
                          }
                          if (pageNum >= startPage && pageNum <= endPage) {
                            return (
                              <button
                                key={i}
                                onClick={() => paginateType(pageNum)}
                                data-nav-type="pagination"
                                className={`custom-nav-btn mx-1 px-3 py-1 rounded ${
                                  typeCurrentPage === pageNum ? 'custom-nav-selected' : ''
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                          return null;
                        })}
                        <button
                          onClick={nextTypePage}
                          disabled={typeCurrentPage === typeTotalPages}
                          data-nav-type="pagination"
                          className="custom-nav-btn mx-1 px-3 py-1 rounded"
                        >
                          &gt;
                        </button>
                        <button
                          onClick={() => setTypeCurrentPage(typeTotalPages)}
                          disabled={typeCurrentPage === typeTotalPages}
                          data-nav-type="pagination"
                          className="custom-nav-btn mx-1 px-3 py-1 rounded"
                        >
                          &raquo;
                        </button>
                      </div>
                    )}
                    <div className="list-group">
                      {currentTypeWords.map(([id, entry]) => (
                        <Link 
                          key={id} 
                          href={`/contribute/proposal-form/${id}`}
                          className="list-group-item list-group-item-action"
                        >
                          {getDisplayWord(entry)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Browse Alphabetically Section */}
        <div className="mb-8">
          <div 
            className="flex items-center cursor-pointer mb-4"
            onClick={() => toggleSection('browse-alphabetically')}
          >
            <h2 className="text-2xl font-bold mr-4">Browse Requests  Alphabetically</h2>
            <button 
              data-nav-type="toggle"
              className="custom-nav-btn mx-1 px-3 py-1 rounded"
            >
              {expandedSections['browse-alphabetically'] ? '−' : '+'}
            </button>
          </div>
          <p>
              If you have a specific word in mind, but you cannot type in Mankon, see if your word has been requested.
              If you still cannot find your word in this section, navigate to the Contact Us page and send us an email with your word. 
              We will create a special request for you.
          </p>
          
          
          {expandedSections['browse-alphabetically'] && (
            <div className="pl-4">
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
                  <h3 className="text-xl font-bold mb-4">{selectedLetter} ({totalAlphabetWords} words)</h3>
                  {/* Pagination for words within the selected letter */}
                  {totalAlphabetWords > alphabetItemsPerPage && (
                    <div className="custom-pagination flex justify-center items-center mt-8">
                      <button
                        onClick={() => setAlphabetCurrentPage(1)}
                        disabled={alphabetCurrentPage === 1}
                        data-nav-type="pagination"
                        className="custom-nav-btn mx-1 px-3 py-1 rounded"
                      >
                        &laquo;
                      </button>
                      <button
                        onClick={prevAlphabetPage}
                        disabled={alphabetCurrentPage === 1}
                        data-nav-type="pagination"
                        className="custom-nav-btn mx-1 px-3 py-1 rounded"
                      >
                        &lt;
                      </button>
                      {[...Array(alphabetTotalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        const showPageNumbers = 5;
                        const halfShow = Math.floor(showPageNumbers / 2);
                        let startPage = Math.max(1, alphabetCurrentPage - halfShow);
                        const endPage = Math.min(alphabetTotalPages, startPage + showPageNumbers - 1);
                        if (endPage - startPage + 1 < showPageNumbers) {
                          startPage = Math.max(1, endPage - showPageNumbers + 1);
                        }
                        if (pageNum >= startPage && pageNum <= endPage) {
                          return (
                            <button
                              key={i}
                              onClick={() => paginateAlphabet(pageNum)}
                              data-nav-type="pagination"
                              className={`custom-nav-btn mx-1 px-3 py-1 rounded ${
                                alphabetCurrentPage === pageNum ? 'custom-nav-selected' : ''
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                        return null;
                      })}
                      <button
                        onClick={nextAlphabetPage}
                        disabled={alphabetCurrentPage === alphabetTotalPages}
                        data-nav-type="pagination"
                        className="custom-nav-btn mx-1 px-3 py-1 rounded"
                      >
                        &gt;
                      </button>
                      <button
                        onClick={() => setAlphabetCurrentPage(alphabetTotalPages)}
                        disabled={alphabetCurrentPage === alphabetTotalPages}
                        data-nav-type="pagination"
                        className="custom-nav-btn mx-1 px-3 py-1 rounded"
                      >
                        &raquo;
                      </button>
                    </div>
                  )}
                  <div className="list-group">
                    {currentAlphabetWords.map(([id, entry]) => (
                      <Link 
                        key={id} 
                        href={`/contribute/proposal-form/${id}`}
                        className="list-group-item list-group-item-action"
                      >
                        {getDisplayWord(entry)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Show a message if no entries are found */}
        {lettersWithEntries.length === 0 && typesWithEntries.length === 0 && (
          <div className="text-center my-12">
            <p className="text-xl">No dictionary entries found.</p>
          </div>
        )}
    </>
  );
}