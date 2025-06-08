import { EntryCollection } from "@/utils/types";
import { useEffect, useState, useCallback } from "react";
import { db, storage } from "@/utils/firebase";
import { ref, update, remove } from "firebase/database";
import { ref as storageRef, getDownloadURL } from "firebase/storage";
import { WordEntry } from "@/utils/types";
import { DeleteAudioFile } from "@/utils/ClientSideAPICalls";
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

export default function RenderEntriesInterface({filteredEntries, type,}: {filteredEntries: EntryCollection; type: string; state?: string}) {
    const [localChanges, setLocalChanges] = useState<{[entryId: string]: Partial<WordEntry>}>({});
    const [hasChanges, setHasChanges] = useState<{[entryId: string]: boolean}>({});
    const [audioUrls, setAudioUrls] = useState<{[key: string]: string}>({});
    
    // Pagination state for entries
    const [currentEntryIndex, setCurrentEntryIndex] = useState<number>(0);

    // Fetch audio file from Firebase Storage using filename
    const fetchAudioFromStorage = useCallback(async (filename: string): Promise<string> => {
        try {
            // Create a reference to the file in Firebase Storage
            const audioRef = storageRef(storage, `proposal/${filename.slice(0, -4)}.ogg`);
            const url = await getDownloadURL(audioRef);
            return url;
        } catch (error) {
            console.error(`Error fetching audio file ${filename}:`, error);
            throw error;
        }
    }, []);

    // Fetch all audio files for the current entry
    const fetchAllAudioFiles = useCallback(async (entryId: string, data: WordEntry) => {
        try {
            const audioMap: {[key: string]: string} = {};
            
            // Fetch sentence audio files using filenames
            if (data.sentenceAudioFilenames && data.sentenceAudioFilenames.length > 0) {
                for (let i = 0; i < data.sentenceAudioFilenames.length; i++) {
                    if (data.sentenceAudioFilenames[i]) {
                        try {
                            const url = await fetchAudioFromStorage(data.sentenceAudioFilenames[i]);
                            audioMap[`${entryId}_sentence_${i}`] = url;
                        } catch (err) {
                            console.error(`Failed to fetch sentence audio ${i}:`, err);
                        }
                    }
                }
            }
            
            // Fetch word audio files using filenames
            if (data.wordAudioFilenames && data.wordAudioFilenames.length > 0) {
                for (let i = 0; i < data.wordAudioFilenames.length; i++) {
                    if (data.wordAudioFilenames[i]) {
                        try {
                            const url = await fetchAudioFromStorage(data.wordAudioFilenames[i]);
                            audioMap[`${entryId}_word_${i}`] = url;
                        } catch (err) {
                            console.error(`Failed to fetch word audio ${i}:`, err);
                        }
                    }
                }
            }
            
            setAudioUrls(prev => ({ ...prev, ...audioMap }));
        } catch (err) {
            console.error("Error fetching audio files:", err);
        }
    }, [fetchAudioFromStorage]);

    // Play audio using the fetched URLs
    const playAudio = (entryId: string, type: string, index: number) => {
        const audioKey = `${entryId}_${type}_${index}`;
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

   // Update entry in Firebase
    const updateEntry = async (entryId: string) => {
        try {
            const changes = localChanges[entryId];
            if (!changes) return;

            const entryRef = ref(db, `${type}/${entryId}`);
            const updateData = {
                ...changes,
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
            
            alert('Entry updated successfully!');
        } catch (error) {
            console.error('Error updating entry:', error);
            alert('Failed to update entry. Please try again.');
        }
    };

    // Reset pagination when filtered entries change
    useEffect(() => {
        setCurrentEntryIndex(0);
    }, [filteredEntries]);
    // Get current entry for pagination
const getCurrentEntry = useCallback(() => {
    const entriesArray = Object.entries(filteredEntries);
    if (entriesArray.length === 0 || currentEntryIndex >= entriesArray.length) {
        return null;
    }
    return entriesArray[currentEntryIndex];
}, [currentEntryIndex, filteredEntries]);
    // Fetch audio files when current entry changes
    useEffect(() => {
        const currentEntry = getCurrentEntry();
        if (currentEntry) {
            const [entryId, entryData] = currentEntry;
            fetchAllAudioFiles(entryId, entryData);
        }
    }, [currentEntryIndex, filteredEntries, fetchAllAudioFiles, getCurrentEntry]);

    // Delete entry from Firebase
    const deleteEntry = async (entryId: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this entry? This action cannot be undone.');
        
        if (!confirmed) return;
        
        try {
            // Get the entry data to access file IDs
            const entryData = filteredEntries[entryId];
            
            // Collect all audio file IDs from the entry
            const audioFileIds = [
                ...(entryData.wordAudioFileIds || []),
                ...(entryData.sentenceAudioFileIds || [])
            ];
            
            // Delete audio files if there are any
            if (audioFileIds.length > 0) {
                console.log('Deleting audio files:', audioFileIds);
                
                // Delete each audio file
                for (const fileId of audioFileIds) {
                    if (fileId && fileId.trim() !== '') {
                        try {
                            await DeleteAudioFile(fileId);
                            console.log(`Successfully deleted audio file: ${fileId}`);
                        } catch (audioError) {
                            console.error(`Failed to delete audio file ${fileId}:`, audioError);
                            // Continue with other files even if one fails
                        }
                    }
                }
            }

            const entryRef = ref(db, `${type}/${entryId}`);
            await remove(entryRef);
            
            // Clear any local changes for this entry
            setLocalChanges(prev => {
                const newChanges = { ...prev };
                delete newChanges[entryId];
                return newChanges;
            });
            
            setHasChanges(prev => {
                const newChanges = { ...prev };
                delete newChanges[entryId];
                return newChanges;
            });
            
            alert('Entry deleted successfully!');
        } catch (error) {
            console.error('Error deleting entry:', error);
            alert('Failed to delete entry. Please try again.');
        }
    };

// Handle field changes (store locally, don't update Firebase yet)
const handleFieldChange = (entryId: string, fieldName: string, value: string| string[] | undefined) => {
    setLocalChanges(prev => ({
        ...prev,
        [entryId]: {
            ...prev[entryId],
            [fieldName]: value || undefined
        }
    }));
    
    setHasChanges(prev => ({
        ...prev,
        [entryId]: true
    }));
};

// Handle string field changes
const handleStringFieldChange = (entryId: string, fieldName: string, value: string) => {
    handleFieldChange(entryId, fieldName, value);
};

// Handle array field changes
const handleArrayFieldChange = (entryId: string, fieldName: string, index: number, value: string) => {
    const currentValue = getCurrentValue(entryId, fieldName, []);
    const currentArray = Array.isArray(currentValue) ? currentValue : [];
    const newArray = [...currentArray];
    
    if (value.trim() === '') {
        // Remove empty entries
        newArray.splice(index, 1);
    } else {
        newArray[index] = value.trim();
    }
    
    handleFieldChange(entryId, fieldName, newArray.length > 0 ? newArray : undefined);
};

// Add new array item
const addArrayItem = (entryId: string, fieldName: string) => {
    const currentValue = getCurrentValue(entryId, fieldName, []);
    const currentArray = Array.isArray(currentValue) ? currentValue : [];
    const newArray = [...currentArray, ''];
    handleFieldChange(entryId, fieldName, newArray);
};

// Remove array item
const removeArrayItem = (entryId: string, fieldName: string, index: number) => {
    const currentValue = getCurrentValue(entryId, fieldName, []);
    const currentArray = Array.isArray(currentValue) ? currentValue : [];
    const newArray = currentArray.filter((_, i) => i !== index);
    handleFieldChange(entryId, fieldName, newArray.length > 0 ? newArray : undefined);
};

// Get current value (from local changes or original entry)
const getCurrentValue = (entryId: string, fieldName: string, originalValue: string | string[] | undefined) => {
    const localChange = localChanges[entryId]?.[fieldName as keyof WordEntry];
    return localChange !== undefined ? localChange : originalValue;
};

// Render sentence audio fields with associated text inputs
const renderSentenceAudioField = (
    entryId: string, 
    entry: WordEntry
) => {
    const currentFilenames = getCurrentValue(entryId, 'sentenceAudioFilenames', entry.sentenceAudioFilenames);
    const currentFileIds = getCurrentValue(entryId, 'sentenceAudioFileIds', entry.sentenceAudioFileIds);
    const currentMankonSentences = getCurrentValue(entryId, 'mankonSentences', entry.mankonSentences);
    const currentTranslatedSentences = getCurrentValue(entryId, 'translatedSentences', entry.translatedSentences);
    
    const filenameArray = Array.isArray(currentFilenames) ? currentFilenames : [];
    const fileIdArray = Array.isArray(currentFileIds) ? currentFileIds : [];
    const mankonSentenceArray = Array.isArray(currentMankonSentences) ? currentMankonSentences : [];
    const translatedSentenceArray = Array.isArray(currentTranslatedSentences) ? currentTranslatedSentences : [];
    
    // Determine the maximum length to ensure all arrays are properly handled
    const maxLength = Math.max(
        filenameArray.length,
        fileIdArray.length,
        mankonSentenceArray.length,
        translatedSentenceArray.length,
        1 // At least show one empty set if all are empty
    );
    
    return (
        <div>
            <label className="entry-label">Sentence Audio Files & Text</label>
            <div>
                {maxLength === 1 && filenameArray.length === 0 ? (
                    <div className="login-input">
                        No sentence audio files yet. Click the + button to add one.
                    </div>
                ) : (
                    Array.from({ length: maxLength }, (_, index) => (
                        <div key={index} className="audio-item" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                <strong>Sentence Audio {index + 1}:</strong>
                                {filenameArray[index] && audioUrls[`${entryId}_sentence_${index}`] && (
                                    <VolumeUpIcon
                                        style={{ cursor: "pointer", marginLeft: '10px', color: '#007bff' }}
                                        onClick={() => playAudio(entryId, 'sentence', index)}
                                    />
                                )}
                            </div>
                            
                            {/* Mankon Sentence Input */}
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>Mankon Sentence:</label>
                                <input
                                    type="text"
                                    value={mankonSentenceArray[index] || ''}
                                    placeholder={`Mankon sentence ${index + 1}`}
                                    className="login-input"
                                    onChange={(e) => handleArrayFieldChange(entryId, 'mankonSentences', index, e.target.value)}
                                />
                            </div>
                            
                            {/* Translated Sentence Input */}
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>Sentence Translation:</label>
                                <input
                                    type="text"
                                    value={translatedSentenceArray[index] || ''}
                                    placeholder={`Sentence translation ${index + 1}`}
                                    className="login-input"
                                    onChange={(e) => handleArrayFieldChange(entryId, 'translatedSentences', index, e.target.value)}
                                />
                            </div>
                            
                            {/* Audio Filename Input */}
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '3px' }}>Audio Filename:</label>
                                <input
                                    type="text"
                                    value={filenameArray[index] || ''}
                                    placeholder={`Audio filename ${index + 1}`}
                                    className="login-input"
                                    onChange={(e) => handleArrayFieldChange(entryId, 'sentenceAudioFilenames', index, e.target.value)}
                                />
                            </div>
                            
                            {/* Audio File ID Input */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '3px' }}>Audio File ID:</label>
                                <input
                                    type="text"
                                    value={fileIdArray[index] || ''}
                                    placeholder={`Audio file ID ${index + 1}`}
                                    className="login-input"
                                    onChange={(e) => handleArrayFieldChange(entryId, 'sentenceAudioFileIds', index, e.target.value)}
                                />
                            </div>
                            
                            <button
                                type="button"
                                onClick={() => {
                                    removeArrayItem(entryId, 'sentenceAudioFilenames', index);
                                    removeArrayItem(entryId, 'sentenceAudioFileIds', index);
                                    removeArrayItem(entryId, 'mankonSentences', index);
                                    removeArrayItem(entryId, 'translatedSentences', index);
                                }}
                                className="next-button remove-button"
                                title="Remove this sentence audio and text"
                                style={{ fontSize: '12px', padding: '5px 10px' }}
                            >
                                Remove Sentence
                            </button>
                        </div>
                    ))
                )}
                <button
                    type="button"
                    onClick={() => {
                        addArrayItem(entryId, 'sentenceAudioFilenames');
                        addArrayItem(entryId, 'sentenceAudioFileIds');
                        addArrayItem(entryId, 'mankonSentences');
                        addArrayItem(entryId, 'translatedSentences');
                    }}
                    className="next-button"
                    title="Add new sentence audio and text"
                >
                    + Add Sentence Audio & Text
                </button>
            </div>
        </div>
    );
};

// Render word audio fields (unchanged)
const renderWordAudioField = (
    entryId: string, 
    filenameFieldName: string, 
    fileIdFieldName: string, 
    label: string, 
    audioType: string,
    filenameValue: string[] | undefined,
    fileIdValue: string[] | undefined
) => {
    const currentFilenames = getCurrentValue(entryId, filenameFieldName, filenameValue);
    const currentFileIds = getCurrentValue(entryId, fileIdFieldName, fileIdValue);
    const filenameArray = Array.isArray(currentFilenames) ? currentFilenames : [];
    const fileIdArray = Array.isArray(currentFileIds) ? currentFileIds : [];
    
    return (
        <div>
            <label className="entry-label">{label}</label>
            <div>
                {filenameArray.length === 0 ? (
                    <div className="login-input">
                        No audio files yet. Click the + button to add one.
                    </div>
                ) : (
                    filenameArray.map((filename, index) => (
                        <div key={index} className="audio-item" style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <strong>Audio {index + 1}:</strong>
                                {filename && audioUrls[`${entryId}_${audioType}_${index}`] && (
                                    <VolumeUpIcon
                                        style={{ cursor: "pointer", marginLeft: '10px', color: '#007bff' }}
                                        onClick={() => playAudio(entryId, audioType, index)}
                                    />
                                )}
                            </div>
                            
                            <div style={{ marginBottom: '8px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#666' }}>Filename:</label>
                                <input
                                    type="text"
                                    value={filename || ''}
                                    placeholder={`Audio filename ${index + 1}`}
                                    className="login-input"
                                    onChange={(e) => handleArrayFieldChange(entryId, filenameFieldName, index, e.target.value)}
                                />
                            </div>
                            
                            <div style={{ marginBottom: '8px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#666' }}>File ID:</label>
                                <input
                                    type="text"
                                    value={fileIdArray[index] || ''}
                                    placeholder={`Audio file ID ${index + 1}`}
                                    className="login-input"
                                    onChange={(e) => handleArrayFieldChange(entryId, fileIdFieldName, index, e.target.value)}
                                />
                            </div>
                            
                            <button
                                type="button"
                                onClick={() => {
                                    removeArrayItem(entryId, filenameFieldName, index);
                                    removeArrayItem(entryId, fileIdFieldName, index);
                                }}
                                className="next-button remove-button"
                                title="Remove this audio file"
                                style={{ fontSize: '12px', padding: '5px 10px' }}
                            >
                                Remove Audio
                            </button>
                        </div>
                    ))
                )}
                <button
                    type="button"
                    onClick={() => {
                        addArrayItem(entryId, filenameFieldName);
                        addArrayItem(entryId, fileIdFieldName);
                    }}
                    className="next-button"
                    title="Add new audio file"
                >
                    + Add Audio File
                </button>
            </div>
        </div>
    );
};

// Render editable field
const renderEditableField = (
    entryId: string, 
    fieldName: string, 
    label: string, 
    originalValue: string | string[] | undefined, 
    placeholder: string = ''
) => {
    const currentValue = getCurrentValue(entryId, fieldName, originalValue);
    
    // Check if this is an array field (excluding audio fields and sentence fields which are handled separately)
    const arrayFields = [
        'pairWords', 'translatedWords', 'type'
    ];
    
    if (arrayFields.includes(fieldName)) {
        return renderArrayField(entryId, fieldName, label, currentValue, placeholder);
    }

    // Render single input field for non-array fields
    let displayValue = '';
    if (currentValue) {
        displayValue = currentValue.toString();
    }

    return (
        <div>
            <label className="entry-label">{label}:</label>
            <input
                type="text"
                value={displayValue}
                placeholder={placeholder}
                className="login-input"
                onChange={(e) => handleStringFieldChange(entryId, fieldName, e.target.value)}
            />
        </div>
    );
};

// Render array field with individual inputs
const renderArrayField = (
    entryId: string,
    fieldName: string,
    label: string,
    currentValue: string | string[] | undefined,
    placeholder: string = ''
) => {
    const arrayValue = Array.isArray(currentValue) ? currentValue : [];
    
    return (
        <div>
            <label className="entry-label">{label}</label>
            <div>
                {arrayValue.length === 0 ? (
                    <div className="login-input">
                        No items yet. Click the + button to add one.
                    </div>
                ) : (
                    arrayValue.map((item, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <input
                                type="text"
                                value={item || ''}
                                placeholder={`${placeholder} ${index + 1}`}
                                className="login-input"
                                onChange={(e) => handleArrayFieldChange(entryId, fieldName, index, e.target.value)}
                            />
                            <div>
                            <button
                                type="button"
                                onClick={() => removeArrayItem(entryId, fieldName, index)}
                                className="next-button remove-button"
                                title="Remove this item"
                            >
                                ×
                            </button>
                            </div>
                        </div>
                    ))
                )}
                <button
                    type="button"
                    onClick={() => addArrayItem(entryId, fieldName)}
                    className="next-button"
                    title="Add new item"
                >
                    +
                </button>
                <div> 
            </div>
            </div>
        </div>
    );
};

// Pagination functions
const goToPreviousEntry = () => {
    setCurrentEntryIndex(prev => Math.max(0, prev - 1));
};

const goToNextEntry = () => {
    const totalEntries = Object.keys(filteredEntries).length;
    setCurrentEntryIndex(prev => Math.min(totalEntries - 1, prev + 1));
};


const renderEntriesInterface = () => {
    const currentEntry = getCurrentEntry();
    if (!currentEntry) return null;
    
    const [id, entry] = currentEntry;
    const totalEntries = Object.keys(filteredEntries).length;
    
    return (
        <>
            {/* Pagination controls */}
            <div className="center-buttons" style={{ marginBottom: '20px' }}>
                <button
                    onClick={goToPreviousEntry}
                    disabled={currentEntryIndex === 0}
                    className="next-button"
                    style={{ 
                        opacity: currentEntryIndex === 0 ? 0.5 : 1,
                        cursor: currentEntryIndex === 0 ? 'not-allowed' : 'pointer'
                    }}
                >
                    ← Prev
                </button>
                <span style={{ margin: '0 20px', fontSize: '16px', fontWeight: 'bold' }}>
                    {currentEntryIndex + 1} of {totalEntries}
                </span>
                <button
                    onClick={goToNextEntry}
                    disabled={currentEntryIndex === totalEntries - 1}
                    className="next-button"
                    style={{ 
                        opacity: currentEntryIndex === totalEntries - 1 ? 0.5 : 1,
                        cursor: currentEntryIndex === totalEntries - 1 ? 'not-allowed' : 'pointer'
                    }}
                >
                    Next →
                </button>
            </div>
            
            {/* Entry card */}
            <div className="entry-card">
                <div>
                    <h1 className="entry-title">
                        {entry.mankonWord}
                    </h1>
                </div>
                <div>
                    {renderEditableField(id, 'mankonWord', 'Mankon Word', entry.mankonWord, '')}
                    {renderEditableField(id, 'altSpelling', 'Alternate Spelling', entry.altSpelling, '')}
                    {renderEditableField(id, 'translatedWords', 'Translations', entry.translatedWords, '')}
                     {/* Word Audio fields */}
                     {renderWordAudioField(
                        id, 
                        'wordAudioFilenames', 
                        'wordAudioFileIds', 
                        'Word Audio Files:', 
                        'word',
                        entry.wordAudioFilenames, 
                        entry.wordAudioFileIds
                    )}
                    <hr className="section-divider-mini" />
                    {renderEditableField(id, 'partOfSpeech', 'Part of Speech', entry.partOfSpeech, '')}
                    
                    <hr className="section-divider-mini" />
                </div>
                <div>
                    {/* Sentence Audio Field with integrated text inputs */}
                    {renderSentenceAudioField(id, entry)}
                    <hr className="section-divider-mini" />
                    {renderEditableField(id, 'pairWords', 'Related Words', entry.pairWords, '')}
                    <hr className="section-divider-mini" />
                    {renderEditableField(id, 'type', 'Semantic Categories', entry.type, '')}
                    <hr className="section-divider-mini" />
                    
                </div>
                <div>
                    <div className="center-buttons">
                        <button
                            onClick={() => updateEntry(id)}
                            disabled={!hasChanges[id]}
                            className = "next-button"
                        >
                            Update Entry
                        </button>
                        <button
                            onClick={() => deleteEntry(id)}
                            className="next-button"
                        >
                            Delete Entry
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

return renderEntriesInterface();

}