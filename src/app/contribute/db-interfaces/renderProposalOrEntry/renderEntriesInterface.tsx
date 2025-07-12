import { EntryCollection } from "@/utils/types";
import { useEffect, useState, useCallback } from "react";
import { db, storage } from "@/utils/firebase";
import { ref, update, remove } from "firebase/database";
import { ref as storageRef, getDownloadURL } from "firebase/storage";
import { WordEntry } from "@/utils/types";
import { DeleteAudioFile } from "@/utils/ClientSideAPICalls";
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

export default function RenderEntriesInterface({
    filteredEntries, 
    type, 
}: {
    filteredEntries: EntryCollection; 
    type: string;
}) {
    const [localChanges, setLocalChanges] = useState<{[entryId: string]: Partial<WordEntry>}>({});
    const [hasChanges, setHasChanges] = useState<{[entryId: string]: boolean}>({});
    const [audioUrls, setAudioUrls] = useState<{[key: string]: string}>({});
    const [currentEntryIndex, setCurrentEntryIndex] = useState<number>(0);

    // Fetch audio file from Firebase Storage
    const fetchAudioFromStorage = useCallback(async (filename: string): Promise<string> => {
        try {
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
            
            // Fetch sentence audio files
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
            
            // Fetch word audio files
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

// Modify to never return undefined
    const trimTrailingSpaces = (value: string | string[] | undefined): string | string[] => {
    if (Array.isArray(value)) {
        return value.map(item => item.trim()).filter(item => item !== '');
    }
    if (typeof value === 'string') {
        return value.trim();
    }
    return ''; // Return empty string instead of undefined
    };

    const updateEntry = async (entryId: string) => {
    try {
        const changes = localChanges[entryId];
        if (!changes) return;
        
        const trimmedChanges: Partial<WordEntry> = {};
        Object.keys(changes).forEach(key => {
        const typedKey = key as keyof WordEntry;
        const value = changes[typedKey];
        const trimmedValue = trimTrailingSpaces(value);
        
        // Use index signature assignment to avoid intersection type issues
        (trimmedChanges as Record<keyof WordEntry, string | string[]>)[typedKey] = trimmedValue;
        });
        
        const entryRef = ref(db, `${type}/${entryId}`);
        const updateData = {
        ...trimmedChanges,
        lastModifiedAt: new Date().toISOString()
        };
        
        await update(entryRef, updateData);
        
        // rest of your code...
    } catch (error) {
        console.error('Error updating entry:', error);
        alert('Failed to update entry. Please try again.');
    }
    };

    // Delete entry from Firebase
    const deleteEntry = async (entryId: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this entry? This action cannot be undone.');
        
        if (!confirmed) return;
        
        try {
            const entryData = filteredEntries[entryId];
            
            // Collect all audio file IDs from the entry
            const audioFileIds = [
                ...(entryData.wordAudioFileIds || []),
                ...(entryData.sentenceAudioFileIds || [])
            ];
            
            // Delete audio files if there are any
            if (audioFileIds.length > 0) {
                for (const fileId of audioFileIds) {
                    if (fileId && fileId.trim() !== '') {
                        try {
                            await DeleteAudioFile(fileId);
                        } catch (audioError) {
                            console.error(`Failed to delete audio file ${fileId}:`, audioError);
                        }
                    }
                }
            }

            const entryRef = ref(db, `${type}/${entryId}`);
            await remove(entryRef);
            
            // Clear local changes
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

            // Adjust pagination after deletion
            const totalEntries = Object.keys(filteredEntries).length - 1;
            if (currentEntryIndex >= totalEntries && totalEntries > 0) {
                setCurrentEntryIndex(totalEntries - 1);
            } else if (totalEntries === 0) {
                setCurrentEntryIndex(0);
            }
            
            alert('Entry deleted successfully!');
        } catch (error) {
            console.error('Error deleting entry:', error);
            alert('Failed to delete entry. Please try again.');
        }
    };

    // Delete individual audio file
    const deleteAudioFile = async (entryId: string, audioType: 'word' | 'sentence', index: number) => {
        const confirmed = window.confirm('Are you sure you want to delete this audio file?');
        if (!confirmed) return;

        try {
            const entry = filteredEntries[entryId];
            const fileIdField = audioType === 'word' ? 'wordAudioFileIds' : 'sentenceAudioFileIds';
            const filenameField = audioType === 'word' ? 'wordAudioFilenames' : 'sentenceAudioFilenames';
            
            const fileIds = getCurrentValue(entryId, fileIdField, entry[fileIdField]) as string[];
            const filenames = getCurrentValue(entryId, filenameField, entry[filenameField]) as string[];
            
            // Delete from storage if file ID exists
            if (fileIds && fileIds[index]) {
                await DeleteAudioFile(fileIds[index]);
            }
            
            // Remove from arrays
            const newFileIds = fileIds ? fileIds.filter((_, i) => i !== index) : [];
            const newFilenames = filenames ? filenames.filter((_, i) => i !== index) : [];
            
            // Update local changes
            setLocalChanges(prev => ({
                ...prev,
                [entryId]: {
                    ...prev[entryId],
                    [fileIdField]: newFileIds.length > 0 ? newFileIds : undefined,
                    [filenameField]: newFilenames.length > 0 ? newFilenames : undefined
                }
            }));
            
            setHasChanges(prev => ({
                ...prev,
                [entryId]: true
            }));
            
            alert('Audio file deleted successfully!');
        } catch (error) {
            console.error('Error deleting audio file:', error);
            alert('Failed to delete audio file. Please try again.');
        }
    };

    // Get current value (from local changes or original entry)
    const getCurrentValue = (entryId: string, fieldName: string, originalValue: string | string[] | undefined) => {
    const localChange = localChanges[entryId]?.[fieldName as keyof WordEntry];
    
    // If there's a local change, use it
    if (localChange !== undefined) {
        return localChange;
    }
    
    // Otherwise, use the original value
    return originalValue;
};

    // Handle field changes
    const handleFieldChange = (entryId: string, fieldName: string, value: string | string[] | undefined) => {
        setLocalChanges(prev => ({
            ...prev,
            [entryId]: {
                ...prev[entryId],
                [fieldName]: value
            }
        }));
        
        setHasChanges(prev => ({
            ...prev,
            [entryId]: true
        }));
    };

    // Handle array field changes - FIXED VERSION
    const handleArrayFieldChange = (entryId: string, fieldName: string, index: number, value: string) => {
        // Get the current value from local changes OR original entry
        const originalValue = filteredEntries[entryId]?.[fieldName as keyof WordEntry];
        const localChangeValue = localChanges[entryId]?.[fieldName as keyof WordEntry];
        
        // Use local changes if they exist, otherwise use original value
        const currentValue = localChangeValue !== undefined ? localChangeValue : originalValue;
        
        // Ensure we have an array to work with
        const currentArray = Array.isArray(currentValue) ? [...currentValue] : [];
        
        // Ensure the array is large enough
        while (currentArray.length <= index) {
            currentArray.push('');
        }
        
        // Update the specific index
        currentArray[index] = value;
        
        // Update local changes
        setLocalChanges(prev => ({
            ...prev,
            [entryId]: {
                ...prev[entryId],
                [fieldName]: currentArray
            }
        }));
        
        setHasChanges(prev => ({
            ...prev,
            [entryId]: true
        }));
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

    // Get current entry
    const getCurrentEntry = useCallback(() => {
        const entriesArray = Object.entries(filteredEntries);
        if (entriesArray.length === 0 || currentEntryIndex >= entriesArray.length) {
            return null;
        }
        return entriesArray[currentEntryIndex];
    }, [currentEntryIndex, filteredEntries]);

    // Reset pagination when filtered entries change
    useEffect(() => {
        const totalEntries = Object.keys(filteredEntries).length;
        if (totalEntries === 0) {
            setCurrentEntryIndex(0);
        } else if (currentEntryIndex >= totalEntries) {
            setCurrentEntryIndex(totalEntries - 1);
        }
    }, [filteredEntries, currentEntryIndex]);

    // Fetch audio files when current entry changes
    useEffect(() => {
        const currentEntry = getCurrentEntry();
        if (currentEntry) {
            const [entryId, entryData] = currentEntry;
            fetchAllAudioFiles(entryId, entryData);
        }
    }, [currentEntryIndex, filteredEntries, fetchAllAudioFiles, getCurrentEntry]);

    // Render single editable field
    const renderEditableField = (entryId: string, fieldName: string, label: string, originalValue: string | undefined) => {
        const currentValue = getCurrentValue(entryId, fieldName, originalValue);
        
        return (
            <div>
                <label className="entry-label">{label}:</label>
                <input
                    type="text"
                    value={currentValue || ''}
                    className="login-input"
                    onChange={(e) => handleFieldChange(entryId, fieldName, e.target.value)}
                />
            </div>
        );
    };

    // Render array field (translations, related words, semantic categories)
    const renderArrayField = (entryId: string, fieldName: string, label: string, originalValue: string[] | undefined) => {
        const currentValue = getCurrentValue(entryId, fieldName, originalValue);
        const arrayValue = Array.isArray(currentValue) ? currentValue : [];
        
        return (
            <div>
                <label className="entry-label">{label}:</label>
                <div>
                    {arrayValue.length === 0 ? (
                        <div className="login-input" style={{ color: '#999' }}>
                            No items yet. Click the + button to add one.
                        </div>
                    ) : (
                        arrayValue.map((item, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                <input
                                    type="text"
                                    value={item || ''}
                                    className="login-input"
                                    style={{ marginRight: '10px' }}
                                    onChange={(e) => handleArrayFieldChange(entryId, fieldName, index, e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem(entryId, fieldName, index)}
                                    className="next-button remove-button"
                                    style={{ fontSize: '14px', padding: '5px 10px' }}
                                >
                                    ×
                                </button>
                            </div>
                        ))
                    )}
                    <button
                        type="button"
                        onClick={() => addArrayItem(entryId, fieldName)}
                        className="next-button"
                        style={{ fontSize: '14px', padding: '5px 10px' }}
                    >
                        + Add
                    </button>
                </div>
            </div>
        );
    };

    // Render word audio files
    const renderWordAudioFiles = (entryId: string, entry: WordEntry) => {
        const currentFilenames = getCurrentValue(entryId, 'wordAudioFilenames', entry.wordAudioFilenames);
        const currentFileIds = getCurrentValue(entryId, 'wordAudioFileIds', entry.wordAudioFileIds);
        const filenameArray = Array.isArray(currentFilenames) ? currentFilenames : [];
        const fileIdArray = Array.isArray(currentFileIds) ? currentFileIds : [];
        
        return (
            <div>
                <label className="entry-label">Word Audio Files:</label>
                <div>
                    {filenameArray.length === 0 ? (
                        <div className="login-input" style={{ color: '#999' }}>
                            No audio files yet. Click the + button to add one.
                        </div>
                    ) : (
                        filenameArray.map((filename, index) => (
                            <div key={index} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                    <strong>Word Audio {index + 1}:</strong>
                                    {filename && audioUrls[`${entryId}_word_${index}`] && (
                                        <VolumeUpIcon
                                            style={{ cursor: "pointer", marginLeft: '10px', color: '#007bff' }}
                                            onClick={() => playAudio(entryId, 'word', index)}
                                        />
                                    )}
                                </div>
                                
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '3px' }}>Audio Filename:</label>
                                    <input
                                        type="text"
                                        value={filename || ''}
                                        className="login-input"
                                        onChange={(e) => handleArrayFieldChange(entryId, 'wordAudioFilenames', index, e.target.value)}
                                    />
                                </div>
                                
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '3px' }}>Audio File ID:</label>
                                    <input
                                        type="text"
                                        value={fileIdArray[index] || ''}
                                        className="login-input"
                                        onChange={(e) => handleArrayFieldChange(entryId, 'wordAudioFileIds', index, e.target.value)}
                                    />
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={() => deleteAudioFile(entryId, 'word', index)}
                                    className="next-button remove-button"
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
                            // Placeholder for future functionality
                            console.log('Add new word audio - functionality to be implemented');
                        }}
                        className="next-button"
                    >
                        + Add Word Audio
                    </button>
                </div>
            </div>
        );
    };

    // Render sentence audio files
    const renderSentenceAudioFiles = (entryId: string, entry: WordEntry) => {
        const currentFilenames = getCurrentValue(entryId, 'sentenceAudioFilenames', entry.sentenceAudioFilenames);
        const currentFileIds = getCurrentValue(entryId, 'sentenceAudioFileIds', entry.sentenceAudioFileIds);
        const currentMankonSentences = getCurrentValue(entryId, 'mankonSentences', entry.mankonSentences);
        const currentTranslatedSentences = getCurrentValue(entryId, 'translatedSentences', entry.translatedSentences);
        
        const filenameArray = Array.isArray(currentFilenames) ? currentFilenames : [];
        const fileIdArray = Array.isArray(currentFileIds) ? currentFileIds : [];
        const mankonSentenceArray = Array.isArray(currentMankonSentences) ? currentMankonSentences : [];
        const translatedSentenceArray = Array.isArray(currentTranslatedSentences) ? currentTranslatedSentences : [];
        
        const maxLength = Math.max(
            filenameArray.length,
            fileIdArray.length,
            mankonSentenceArray.length,
            translatedSentenceArray.length,
            0
        );
        
        return (
            <div>
                <label className="entry-label">Sentence Audio Files & Text:</label>
                <div>
                    {maxLength === 0 ? (
                        <div className="login-input" style={{ color: '#999' }}>
                            No sentence audio files yet. Click the + button to add one.
                        </div>
                    ) : (
                        Array.from({ length: maxLength }, (_, index) => (
                            <div key={index} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                    <strong>Sentence Audio {index + 1}:</strong>
                                    {filenameArray[index] && audioUrls[`${entryId}_sentence_${index}`] && (
                                        <VolumeUpIcon
                                            style={{ cursor: "pointer", marginLeft: '10px', color: '#007bff' }}
                                            onClick={() => playAudio(entryId, 'sentence', index)}
                                        />
                                    )}
                                </div>
                                
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>Mankon Sentence:</label>
                                    <input
                                        type="text"
                                        value={mankonSentenceArray[index] || ''}
                                        className="login-input"
                                        onChange={(e) => handleArrayFieldChange(entryId, 'mankonSentences', index, e.target.value)}
                                    />
                                </div>
                                
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>Sentence Translation:</label>
                                    <input
                                        type="text"
                                        value={translatedSentenceArray[index] || ''}
                                        className="login-input"
                                        onChange={(e) => handleArrayFieldChange(entryId, 'translatedSentences', index, e.target.value)}
                                    />
                                </div>
                                
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '3px' }}>Audio Filename:</label>
                                    <input
                                        type="text"
                                        value={filenameArray[index] || ''}
                                        className="login-input"
                                        onChange={(e) => handleArrayFieldChange(entryId, 'sentenceAudioFilenames', index, e.target.value)}
                                    />
                                </div>
                                
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '3px' }}>Audio File ID:</label>
                                    <input
                                        type="text"
                                        value={fileIdArray[index] || ''}
                                        className="login-input"
                                        onChange={(e) => handleArrayFieldChange(entryId, 'sentenceAudioFileIds', index, e.target.value)}
                                    />
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={() => deleteAudioFile(entryId, 'sentence', index)}
                                    className="next-button remove-button"
                                    style={{ fontSize: '12px', padding: '5px 10px' }}
                                >
                                    Remove Sentence Audio
                                </button>
                            </div>
                        ))
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            // Placeholder for future functionality
                            console.log('Add new sentence audio - functionality to be implemented');
                        }}
                        className="next-button"
                    >
                        + Add Sentence Audio
                    </button>
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

    // Main render function
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
                            {getCurrentValue(id, 'mankonWord', entry.mankonWord) || 'Untitled Entry'}
                        </h1>
                    </div>
                    
                    <div>
                        {renderEditableField(id, 'mankonWord', 'Mankon Word', entry.mankonWord)}
                        {renderEditableField(id, 'altSpelling', 'Alternate Spelling', entry.altSpelling)}
                        {renderArrayField(id, 'translatedWords', 'Translations', entry.translatedWords)}
                        
                        <hr className="section-divider-mini" />
                        
                        {renderWordAudioFiles(id, entry)}
                        
                        <hr className="section-divider-mini" />
                        
                        {renderEditableField(id, 'partOfSpeech', 'Part of Speech', entry.partOfSpeech)}
                        
                        <hr className="section-divider-mini" />
                        
                        {renderSentenceAudioFiles(id, entry)}
                        
                        <hr className="section-divider-mini" />
                        
                        {renderArrayField(id, 'pairWords', 'Related Words', entry.pairWords)}
                        
                        <hr className="section-divider-mini" />
                        
                        {renderArrayField(id, 'type', 'Semantic Categories', entry.type)}
                        
                        <hr className="section-divider-mini" />
                    </div>
                    
                    <div>
                        <div className="center-buttons">
                            <button
                                onClick={() => updateEntry(id)}
                                disabled={!hasChanges[id]}
                                className="next-button"
                                style={{ 
                                    opacity: !hasChanges[id] ? 0.5 : 1,
                                    cursor: !hasChanges[id] ? 'not-allowed' : 'pointer'
                                }}
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