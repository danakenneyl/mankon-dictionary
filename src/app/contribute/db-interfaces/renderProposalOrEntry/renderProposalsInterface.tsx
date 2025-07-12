import { EntryCollection } from "@/utils/types";
import { useState, useEffect, useCallback, useMemo } from "react";
import { db } from "@/utils/firebase";
import { ref, update, remove, set } from "firebase/database";
import { WordEntry } from "@/utils/types";
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { ref as storageRef, getDownloadURL } from "firebase/storage";
import { storage } from "@/utils/firebase";
import "@/styles/browse.css";

// Interface for grouped entries by letter
interface GroupedEntries {
  [key: string]: [string, WordEntry][];
}

// Function to check if a proposal can be approved
function canBeApproved(proposal: WordEntry): boolean {
  return !!(
    proposal.mankonWord &&
    proposal.mankonSentences &&
    proposal.mankonSentences.length > 0 &&
    proposal.wordAudioFilenames &&
    proposal.wordAudioFilenames.length > 0 &&
    proposal.sentenceAudioFilenames &&
    proposal.sentenceAudioFilenames.length > 0 &&
    proposal.partOfSpeech &&
    proposal.partOfSpeech.length > 0
  );

    // return true;
}

export default function RenderProposalsInterface({filteredEntries, state}: {filteredEntries: EntryCollection; state: string}) {
    const [localChanges, setLocalChanges] = useState<{[entryId: string]: Partial<WordEntry>}>({});
    const [hasChanges, setHasChanges] = useState<{[entryId: string]: boolean}>({});
    const [approving, setApproving] = useState<{[entryId: string]: boolean}>({});
    
    // Pagination and alphabetization state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10); // Fewer items per page for editing interface
    const [selectedLetter, setSelectedLetter] = useState<string>("");

    const [audioUrls, setAudioUrls] = useState<{[key: string]: string}>({});

    // Alphabets
    const mankonAlphabet = ["A", "B", "Bv", "Tʃ", "D", "Dv", "Dz", "E", "Ə", "Ɛ", "F", "G", "Gv", "Ɣ", "ʔ", "I", "Ɨ", "Dʒ", "K", "Kf", "L", "Lv", "M", "N", "Ɲ", "Ŋ", "O", "Ɔ", "S", "Ʃ", "T", "Tf", "Ts", "U", "V", "W", "Y", "Z", "Ʒ"];
    const alphabet = mankonAlphabet; // Using Mankon alphabet for proposals

    // Approve entry function - moves from proposals to entries
    const approveEntry = async (entryId: string, entry: WordEntry) => {
        try {
            setApproving(prev => ({ ...prev, [entryId]: true }));
            
            // Create the approved entry data
            const approvedEntry = {
                ...entry,
                approvedAt: new Date().toISOString(),
                lastModifiedAt: new Date().toISOString(),
                status: 'approved'
            };
            
            // Add to entries collection
            const entryRef = ref(db, `entries/${entryId}`);
            await set(entryRef, approvedEntry);
            
            // Remove from proposals collection
            const proposalRef = ref(db, `proposals/${entryId}`);
            await remove(proposalRef);
            
            alert('Entry approved and moved to dictionary successfully!');
            
            // You might want to refresh the data or update the parent component here
            // This depends on how your data flow is structured
            
        } catch (error) {
            console.error('Error approving entry:', error);
            alert('Failed to approve entry. Please try again.');
        } finally {
            setApproving(prev => ({ ...prev, [entryId]: false }));
        }
    };

    // Update entry in Firebase (only for type field)
    const updateEntry = async (entryId: string) => {
        try {
            const changes = localChanges[entryId];
            if (!changes || !changes.type) return;

            const entryRef = ref(db, `proposals/${entryId}`);
            const updateData = {
                type: changes.type,
                lastModifiedAt: new Date().toISOString()
            };
            
            await update(entryRef, updateData);
            
            // Clear local changes after successful update
            setLocalChanges(prev => {
                const newChanges = { ...prev };
                delete newChanges[entryId];
                return newChanges;
            });
            
            setHasChanges(prev => ({
                ...prev,
                [entryId]: false
            }));
            
            alert('Semantic categories updated successfully!');
        } catch (error) {
            console.error('Error updating entry:', error);
            alert('Failed to update semantic categories. Please try again.');
        }
    };

    // Handle array field changes for type
    const handleArrayFieldChange = (entryId: string, index: number, value: string) => {
        const currentValue = getCurrentValue(entryId, 'type', []);
        const currentArray = Array.isArray(currentValue) ? currentValue : [];
        const newArray = [...currentArray];
        
        if (value.trim() === '') {
            // Remove empty entries
            newArray.splice(index, 1);
        } else {
            newArray[index] = value.trim();
        }
        
        setLocalChanges(prev => ({
            ...prev,
            [entryId]: {
                ...prev[entryId],
                type: newArray.length > 0 ? newArray : undefined
            }
        }));
        
        setHasChanges(prev => ({
            ...prev,
            [entryId]: true
        }));
    };

    // Add new array item
    const addArrayItem = (entryId: string) => {
        const currentValue = getCurrentValue(entryId, 'type', []);
        const currentArray = Array.isArray(currentValue) ? currentValue : [];
        const newArray = [...currentArray, ''];
        
        setLocalChanges(prev => ({
            ...prev,
            [entryId]: {
                ...prev[entryId],
                type: newArray
            }
        }));
        
        setHasChanges(prev => ({
            ...prev,
            [entryId]: true
        }));
    };

    // Remove array item
    const removeArrayItem = (entryId: string, index: number) => {
        const currentValue = getCurrentValue(entryId, 'type', []);
        const currentArray = Array.isArray(currentValue) ? currentValue : [];
        const newArray = currentArray.filter((_, i) => i !== index);
        
        setLocalChanges(prev => ({
            ...prev,
            [entryId]: {
                ...prev[entryId],
                type: newArray.length > 0 ? newArray : undefined
            }
        }));
        
        setHasChanges(prev => ({
            ...prev,
            [entryId]: true
        }));
    };

    // Get current value (from local changes or original entry)
    const getCurrentValue = (entryId: string, fieldName: string, originalValue: string | string[] | undefined) => {
        const localChange = localChanges[entryId]?.[fieldName as keyof WordEntry];
        return localChange !== undefined ? localChange : originalValue;
    };

    // Function to normalize a string (remove tones and convert to uppercase)
    const normalizeString = useCallback((str: string): string => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    }, []);

    // Convert filteredEntries to array and sort, filter for approval state
    const entriesArray = useMemo(() => {
        const allEntries = Object.entries(filteredEntries).sort(([, a], [, b]) => {
            return a.mankonWord.localeCompare(b.mankonWord);
        });
        
        // Filter for approval state - only show complete entries
        if (state === "Approve Proposals") {
            return allEntries.filter(([, entry]) => canBeApproved(entry));
        }
        
        return allEntries;
    }, [filteredEntries, state]);

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
            const word = entry[1].mankonWord;
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
    }, [alphabet, normalizeString]);

    // Group entries by letter
    const groupedEntries = groupEntriesByLetter(entriesArray);
    
    // Get only the letters that have entries (including "Other" if it has entries)
    const lettersWithEntries = useMemo(() => [
        ...alphabet.filter(letter => 
            groupedEntries[letter] && groupedEntries[letter].length > 0
        ),
        ...(groupedEntries["#"] && groupedEntries["#"].length > 0 ? ["#"] : [])
    ], [alphabet, groupedEntries]);

    // Set default selected letter when entries load
    useEffect(() => {
        if (Object.keys(filteredEntries).length > 0 && !selectedLetter) {
            // Auto-select the first letter with entries when the component loads
            const firstLetterWithEntries = lettersWithEntries[0];
            if (firstLetterWithEntries) {
                setSelectedLetter(firstLetterWithEntries);
            }
        }
    }, [filteredEntries, lettersWithEntries, selectedLetter]);
    
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

    // Fetch audio file from Firebase Storage using filename
    const fetchAudioFromStorage = useCallback(async (filename: string): Promise<string> => {
    try {
        const normalizedFilename = filename.normalize('NFC');
        const audioRef = storageRef(storage, `proposal/${normalizedFilename.slice(0, -4)}.ogg`);
        console.log(`proposal/${normalizedFilename.slice(0, -4)}.ogg`);
        const url = await getDownloadURL(audioRef);
        return url;
    } catch (error) {
        // console.error(`Error fetching audio file ${filename}:`, error);
        throw error;
    }
    }, []);

    // Fetch audio files for a specific entry
    const fetchAudioForEntry = useCallback(async (entryId: string, entry: WordEntry) => {
    try {
        const audioMap: {[key: string]: string} = {};
        
        // Fetch sentence audio files
        if (entry.sentenceAudioFilenames && entry.sentenceAudioFilenames.length > 0) {
        for (let i = 0; i < entry.sentenceAudioFilenames.length; i++) {
            if (entry.sentenceAudioFilenames[i]) {
            try {
                const url = await fetchAudioFromStorage(entry.sentenceAudioFilenames[i]);
                audioMap[`${entryId}_sentence_${i}`] = url;
            } catch (err) {
                console.error(`Failed to fetch sentence audio ${i}:`, err);
            }
            }
        }
        }
        
        // Fetch word audio file
        if (entry.wordAudioFilenames && entry.wordAudioFilenames.length > 0) {
        try {
            const url = await fetchAudioFromStorage(entry.wordAudioFilenames[0]);
            audioMap[`${entryId}_word`] = url;
        } catch (err) {
            console.error("Failed to fetch word audio:", err);
        }
        }
        
        setAudioUrls(prev => ({ ...prev, ...audioMap }));
    } catch (err) {
        console.error("Error fetching audio files:", err);
    }
    }, [fetchAudioFromStorage]);

    // Play audio function
    const playAudio = (entryId: string, type: string, index?: number) => {
    let audioKey: string;
    
    if (index !== undefined) {
        audioKey = `${entryId}_${type}_${index}`;
    } else {
        audioKey = `${entryId}_${type}`;
    }
    
    const audioUrl = audioUrls[audioKey];
    
    if (!audioUrl) {
        console.error(`Audio URL not found for ${audioKey}`);
        return;
    }
    
    const audio = new Audio(audioUrl);
    audio.play().catch(err => {
        console.error("Error playing audio:", err);
    });
    };

    // Use effect to fetch audio when entries change
    useEffect(() => {
    if (state === "Approve Proposals") {
        currentWords.forEach(([id, entry]) => {
        fetchAudioForEntry(id, entry);
        });
    }
    }, [currentWords, state, fetchAudioForEntry]);

    // Render array field for semantic categories
    const renderSemanticCategoriesField = (entryId: string, originalValue: string | string[] | undefined) => {
        const currentValue = getCurrentValue(entryId, 'type', originalValue);
        const arrayValue = Array.isArray(currentValue) ? currentValue : [];
        
        return (
            <div>
                <label className="entry-label">Semantic Categories</label>
                <div>
                    {arrayValue.length === 0 ? (
                        <div className="login-input">
                            No categories yet. Click the + button to add one.
                        </div>
                    ) : (
                        arrayValue.map((item, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <input
                                    type="text"
                                    value={item || ''}
                                    placeholder={`Category ${index + 1}`}
                                    className="login-input"
                                    onChange={(e) => handleArrayFieldChange(entryId, index, e.target.value)}
                                />
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem(entryId, index)}
                                        className="next-button remove-button"
                                        title="Remove this category"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    <button
                        type="button"
                        onClick={() => addArrayItem(entryId)}
                        className="next-button"
                        title="Add new category"
                    >
                        +
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* Alphabet Navigation */}
            {lettersWithEntries.length > 0 && (
                <span className="custom-alpha-nav flex flex-wrap justify-center mt-6 mb-8">
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
                </span>
            )}

            {/* Show current letter and pagination info */}
            {selectedLetter && totalWords > 0 && (
                <div className="text-center mb-4">
                    <h3 className="text-xl font-bold">
                        Letter: {selectedLetter} ({totalWords} entries)
                        {state === "Approve Proposals" && (
                            <span className="text-sm text-green-600 ml-2"></span>
                        )}
                    </h3>
                    <p className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages} ({indexOfFirstWord + 1}-{Math.min(indexOfLastWord, totalWords)} of {totalWords})
                    </p>
                </div>
            )}

            {/* Render current page entries */}
            {currentWords.map(([id, entry]) => (
                <div key={id} className="content-card">
                    {state === "Initial Proposals" && (
                        <div className="initial-proposal-card">
                            <h3 className="text-2xl font-bold mb-4">{entry.mankonWord}</h3>
                            {entry.partOfSpeech && <p className="text-lg mb-2">Part of Speech: {entry.partOfSpeech}</p>}
                            {entry.altSpelling && <p className="text-lg mb-2">Alternate Spellings: {entry.altSpelling}</p>}
                            {entry.translatedWords && <p className="text-lg mb-2">Translation(s): {entry.translatedWords.join(", ")}</p>}
                            {entry.mankonSentences && <p className="text-lg mb-2">Mankon Sentences: {entry.mankonSentences.join(", ")}</p>}
                            {entry.translatedSentences && <p className="text-lg mb-2">Sentence Translations: {entry.translatedSentences.join(", ")}</p>}
                            {entry.wordAudioFilenames && <p className="text-lg mb-2">Word Audio Files: {entry.wordAudioFilenames}</p>}
                            {entry.sentenceAudioFilenames && <p className="text-lg mb-2">Sentence Audio Files: {entry.sentenceAudioFilenames.join(", ")}</p>}
                            {entry.pairWords && <p className="text-lg mb-2">Related Word(s): {entry.pairWords.join(", ")}</p>}
                            {entry.contributorUUIDs && <p className="text-lg mb-2">Contributor: {entry.contributorUUIDs.join(", ")}</p>}

                            
                            {/* Semantic Categories Editor */}
                            <div style={{ marginTop: '20px' }}>
                                {renderSemanticCategoriesField(id, entry.type)}
                            </div>
                            
                            {/* Update Button */}
                            {hasChanges[id] && (
                                <div className="center-buttons" style={{ marginTop: '20px' }}>
                                    <button
                                        onClick={() => updateEntry(id)}
                                        className="next-button"
                                    >
                                        Update Category
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {state === "Approve Proposals" && (
                        <div className="approval-proposal-card">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-bold">{entry.mankonWord}</h3>
                                <div className="text-sm text-green-600 font-semibold">
                                    ✓ Ready for Approval
                                </div>
                            </div>
                            
                            <div className="mini-entry-display mb-4" style={{ 
  border: '1px solid #e0e0e0', 
  borderRadius: '8px', 
  padding: '16px', 
  backgroundColor: '#f9f9f9' 
}}>
  <div className="entry__word mb-3" style={{ 
    fontSize: '1.5rem', 
    fontWeight: 'bold', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px' 
  }}>
    <span>{entry.mankonWord}</span>
    {entry.partOfSpeech && (
      <button
        className="typeButton"
        style={{
          fontSize: '0.8rem',
          padding: '2px 8px',
          backgroundColor: '#e3f2fd',
          border: '1px solid #2196f3',
          borderRadius: '4px',
          color: '#1976d2'
        }}
      >
        {entry.partOfSpeech}
      </button>
    )}
    {entry.wordAudioFilenames && entry.wordAudioFilenames.length > 0 && (
      <VolumeUpIcon
        className="pronunciation"
        onClick={() => playAudio(id, 'word')}
        style={{ cursor: "pointer", fontSize: '1.2rem', color: '#2196f3' }}
      />
    )}
  </div>

  {entry.altSpelling && (
    <div className="altSpelling mb-2" style={{ 
      fontWeight: 'bold', 
      color: '#666',
      fontSize: '0.9rem' 
    }}>
      GACL spelling: {entry.altSpelling}
    </div>
  )}
  
  <div className="translationEntry mb-3" style={{ 
    fontSize: '1rem', 
    color: '#333' 
  }}>
    {entry.translatedWords ? entry.translatedWords.join(", ") : ""}
  </div>
  
  {entry.type && (
    <div className="mb-3" style={{ fontSize: '0.9rem', color: '#666' }}>
      <strong>Categories:</strong> {Array.isArray(entry.type) ? entry.type.join(", ") : entry.type}
    </div>
  )}
  
  {entry.pairWords && entry.pairWords.length > 0 && (
    <div className="card pair mb-3" style={{ 
      border: '1px solid #ddd', 
      borderRadius: '4px', 
      padding: '8px' 
    }}>
      <div className="card-header" style={{ 
        fontWeight: 'bold', 
        fontSize: '0.9rem', 
        marginBottom: '4px' 
      }}>
        Paired Word
      </div>
      <div className="card-body">
        {entry.pairWords.map((pair, idx) => (
          <div key={idx} style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
            {pair}
          </div>
        ))}
      </div>
    </div>
  )}
  
  {entry.mankonSentences && entry.mankonSentences.length > 0 && (
    <div className="card sentences" style={{ 
      border: '1px solid #ddd', 
      borderRadius: '4px', 
      padding: '8px' 
    }}>
      <div className="card-header" style={{ 
        fontWeight: 'bold', 
        fontSize: '0.9rem', 
        marginBottom: '8px' 
      }}>
        Sentence Examples
      </div>
      <div className="card-body">
        {entry.mankonSentences.map((example, index) => (
          <div key={index} style={{ 
            marginBottom: '8px', 
            padding: '4px 0' 
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>{example}</span>
              {entry.sentenceAudioFilenames && 
               entry.sentenceAudioFilenames[index] && 
               audioUrls[`${id}_sentence_${index}`] && (
                <VolumeUpIcon 
                  className="pronunciation" 
                  onClick={() => playAudio(id, 'sentence', index)}
                  style={{ cursor: "pointer", fontSize: '1rem', color: '#2196f3' }}
                />
              )}
            </div>
            <div style={{ 
              fontStyle: 'italic', 
              fontSize: '0.85rem', 
              color: '#666',
              marginTop: '2px'
            }}>
              {entry.translatedSentences && entry.translatedSentences[index] 
                ? entry.translatedSentences[index] 
                : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* Additional metadata in smaller text */}
  <div className="metadata mt-3 pt-2" style={{ 
    borderTop: '1px solid #e0e0e0', 
    fontSize: '0.8rem', 
    color: '#888' 
  }}>
    <div>Audio Files: {entry.wordAudioFilenames?.join(", ")} | {entry.sentenceAudioFilenames?.join(", ")}</div>
    {entry.contributorUUIDs && (
      <div>Contributor: {entry.contributorUUIDs.join(", ")}</div>
    )}
  </div>
</div>

                            

                            

                            {/* Approval Button */}
                            <div className="center-buttons border-t pt-4">
                                <button
                                    onClick={() => approveEntry(id, entry)}
                                    disabled={approving[id]}
                                    className="next-button bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                                >
                                    {approving[id] ? 'Approving...' : 'Approve Entry'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}

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

            {/* Show a message if no entries are found */}
            {lettersWithEntries.length === 0 && (
                <div className="text-center my-12">
                    <p className="text-xl">
                        {state === "Approve Proposals" 
                            ? "No complete proposals ready for approval." 
                            : "No entries found for the current filter."
                        }
                    </p>
                </div>
            )}
        </div>
    );
}