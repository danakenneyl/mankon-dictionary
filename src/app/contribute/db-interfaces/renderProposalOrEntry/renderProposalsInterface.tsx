import { EntryCollection } from "@/utils/types";
import { useState, useEffect, useCallback, useMemo } from "react";
import { db } from "@/utils/firebase";
import { ref, update } from "firebase/database";
import { WordEntry } from "@/utils/types";
import "@/styles/browse.css";

// Interface for grouped entries by letter
interface GroupedEntries {
  [key: string]: [string, WordEntry][];
}

export default function RenderProposalsInterface({filteredEntries, state}: {filteredEntries: EntryCollection; state: string}) {
    const [localChanges, setLocalChanges] = useState<{[entryId: string]: Partial<WordEntry>}>({});
    const [hasChanges, setHasChanges] = useState<{[entryId: string]: boolean}>({});
    
    // Pagination and alphabetization state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10); // Fewer items per page for editing interface
    const [selectedLetter, setSelectedLetter] = useState<string>("");

    // Alphabets
    const mankonAlphabet = ["A", "B", "Bv", "Tʃ", "D", "Dv", "Dz", "E", "Ə", "Ɛ", "F", "G", "Ɣ", "I", "Ɨ", "Dʒ", "K", "Kf", "L", "Lv", "M", "N", "Ɲ", "Ŋ", "O", "Ɔ", "S", "Ʃ", "T", "Tf", "Ts", "U", "V", "W", "Y", "Z", "Ʒ"];
    const alphabet = mankonAlphabet; // Using Mankon alphabet for proposals

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

    // Convert filteredEntries to array and sort
    const entriesArray = useMemo(() => {
        return Object.entries(filteredEntries).sort(([, a], [, b]) => {
            return a.mankonWord.localeCompare(b.mankonWord);
        });
    }, [filteredEntries]);

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
                    <p className="text-xl">No entries found for the current filter.</p>
                </div>
            )}
        </div>
    );
}