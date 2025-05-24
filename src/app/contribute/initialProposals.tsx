'use client';
// pages/dictionary.tsx
import { useState, useEffect } from 'react';
import { db } from "@/utils/firebase";
import Link from 'next/link';
import { ref, onValue } from "firebase/database";
import "@/styles/contribute.css";
import "@/styles/browse.css";

// Updated interface to match the new requirements
interface WordProposal {
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
  partOfSpeech?: string;
  nounClass?: string;
  case?: string;
}

// TypeScript interface for the proposals collection
interface ProposalsCollection {
  [key: string]: WordProposal;
}

// Interface for grouped proposals by letter
interface GroupedProposals {
  [key: string]: [string, WordProposal][];
}

export default function InitialProposals() {
  const [proposals, setProposals] = useState<ProposalsCollection>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(50);
  
  // Mankon alphabet for proper sorting and grouping
  const mankonAlphabet = ["A", "B", "Bv", "Tʃ", "D", "Dv", "Dz", "Dʒ", "E", "G", "Ɣ", "Ɨ", "K", "Kf", "L", "Lv", "M", "N", "Ɲ", "Ŋ", "O", "Ɔ", "S", "Ʃ", "T", "Tf", "Ts", "V", "W", "Y", "Z", "Ʒ"];

  useEffect(() => {
    const proposalsRef = ref(db, 'proposals');
    
    // Listen for changes to the proposals in Firebase
    const unsubscribe = onValue(proposalsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as ProposalsCollection;
        setProposals(data);
      } else {
        setProposals({});
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

  // Get all proposals as an array, filtered to exclude those with status "initial"
  const proposalsArray = Object.entries(proposals).filter(
    ([, proposal]) => proposal.status === "initial"
  );
  
  // Sort proposals alphabetically by Mankon word
  const sortedProposals = proposalsArray.sort(([, a], [, b]) => {
    return a.mankonWord.localeCompare(b.mankonWord);
  });

  // Function to normalize characters (remove tones and convert to uppercase)
  const normalizeChar = (char: string): string => {
    // Convert to uppercase first
    const upperChar = char.toUpperCase();
    
    // Handle all four tone marks in Mankon: acute (á), grave (à), caron/háček (ǎ), and circumflex (â)
    // NFD normalization decomposes characters with diacritical marks
    // Then we remove the combining marks in the Unicode range U+0300 to U+036F
    return upperChar.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // This handles:
    // - Acute accent (á) - U+0301
    // - Grave accent (à) - U+0300
    // - Circumflex (â) - U+0302
    // - Caron/háček (ǎ) - U+030C
  };

  // Group proposals by their first letter according to Mankon alphabet
  const groupProposalsByLetter = (proposals: [string, WordProposal][]): GroupedProposals => {
    const grouped: GroupedProposals = {};
    
    // Initialize groups for each letter in the Mankon alphabet
    mankonAlphabet.forEach(letter => {
      grouped[letter] = [];
    });
    
    // Also create an "Other" group for characters not in the alphabet
    grouped["Other"] = [];

    // Group each proposal by its first letter/character
    proposals.forEach(proposal => {
      const word = proposal[1].mankonWord;
      if (word && word.length > 0) {
        // Get the first character of the word and normalize it
        const firstChar = normalizeChar(word.charAt(0));
        
        // Find the matching letter in the Mankon alphabet (case insensitive)
        let assigned = false;
        
        for (const letter of mankonAlphabet) {
          // Compare the normalized first character with the normalized first character of each letter
          if (normalizeChar(letter.charAt(0)) === firstChar) {
            grouped[letter].push(proposal);
            assigned = true;
            break;
          }
        }
        
        // If no match was found, add to "Other" group
        if (!assigned) {
          grouped["Other"].push(proposal);
        }
      }
    });
    
    return grouped;
  };

  // Group proposals by letter
  const groupedProposals = groupProposalsByLetter(sortedProposals);
  
  // Get only the letters that have proposals (including "Other" if it has entries)
  const lettersWithProposals = [
    ...mankonAlphabet.filter(letter => 
      groupedProposals[letter] && groupedProposals[letter].length > 0
    ),
    ...(groupedProposals["Other"] && groupedProposals["Other"].length > 0 ? ["Other"] : [])
  ];

  // Calculate pagination for words, not letter groups
  // Flatten all proposals for pagination
  const allProposals = sortedProposals;
  const totalWords = allProposals.length;
  
  // Calculate pagination values for words
  const indexOfLastWord = currentPage * itemsPerPage;
  const indexOfFirstWord = indexOfLastWord - itemsPerPage;
  const currentWords = allProposals.slice(indexOfFirstWord, indexOfFirstWord + itemsPerPage);
  const totalPages = Math.ceil(totalWords / itemsPerPage);

  // Function to change page
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

  // Count total words across all groups
  const totalWord = lettersWithProposals.reduce((sum, letter) => {
    return sum + groupedProposals[letter].length;
  }, 0);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-center">Requested Words</h2>

      <div className="intro-decoration">
        <div className="decoration-line"></div>
        <div className="decoration-symbol"></div>
        <div className="decoration-line"></div>
      </div>

      <p>
        While the Mankon Dictionary is interested in collecting any words that pop into your head, thinking of new words can be hard!
        To help you get started, we have compiled a list of words that still need attention from our community. 
        Clicking on the words below will take you to the proposal form for that word. All required typing fields will be filled automatically, 
        so you can focus on recording the word and two sentences if you cannot type.
      </p>

      <p className="alert-text request-wait">WAIT: Do you remember your username? You will need your username to complete your proposal.
        If you don&#39;t have a username, please head over to the Propose Word page to create one.
      </p>

      {/* Pagination Controls */}
      {lettersWithProposals.length > 0 && (
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
      {/* Word count with pagination info */}
      <p className="mb-4 text-gray-600 text-center">
        {totalWord > 0 && (
          <span> (showing {indexOfFirstWord + 1}-{Math.min(indexOfLastWord, totalWords)} of {totalWords})</span>
        )}
      </p>

      {/* Dictionary Listing */}
      <div className="grid grid-cols-1 gap-4">
        <ul className="list-group">
          {lettersWithProposals.map(letter => {
            // Only include this letter's section if it has words in the current page
            const wordsForThisLetter = currentWords.filter(([, proposal]) => {
              const firstChar = normalizeChar(proposal.mankonWord.charAt(0));
              const letterFirstChar = normalizeChar(letter.charAt(0));
              
              // For the "Other" category
              if (letter === "Other") {
                // Check if the word doesn't match any of the alphabet letters
                return !mankonAlphabet.some(alphabetLetter => 
                  normalizeChar(alphabetLetter.charAt(0)) === firstChar
                );
              }
              
              return firstChar === letterFirstChar;
            });
            
            if (wordsForThisLetter.length === 0) {
              return null; // Skip this letter if it has no words in the current page
            }
            
            return (
              <li key={letter} className="list-group-item">
                {letter}
                <div className="list-group">
                  {wordsForThisLetter.map(([id, proposal]) => (
                    <Link 
                      key={id} 
                      href={`/contribute/entry-proposal-form/${id}`}
                      className="list-group-item list-group-item-action"
                    >
                      <div>
                        <h5 className="mb-1">{proposal.mankonWord}</h5>
                        <p className="mb-1">{proposal.translatedWords ? proposal.translatedWords.join(", "): ""}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}