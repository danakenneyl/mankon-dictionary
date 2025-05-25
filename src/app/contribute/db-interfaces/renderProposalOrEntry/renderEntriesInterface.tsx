import { EntryCollection } from "@/utils/types";
import { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import { ref, update, remove } from "firebase/database";
import { WordEntry } from "@/utils/types";


export default function RenderEntriesInterface({filteredEntries, type,}: {filteredEntries: EntryCollection; type: string; state?: string}) {
    const [localChanges, setLocalChanges] = useState<{[entryId: string]: Partial<WordEntry>}>({});
    const [hasChanges, setHasChanges] = useState<{[entryId: string]: boolean}>({});
    
    // Pagination state for entries
    const [currentEntryIndex, setCurrentEntryIndex] = useState<number>(0);

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


    // Delete entry from Firebase
    const deleteEntry = async (entryId: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this entry? This action cannot be undone.');
        
        if (!confirmed) return;
        
        try {
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
// Render editable field
const renderEditableField = (
    entryId: string, 
    fieldName: string, 
    label: string, 
    originalValue: string | string[] | undefined, 
    placeholder: string = ''
) => {
    const currentValue = getCurrentValue(entryId, fieldName, originalValue);
    
    // Check if this is an array field
    const arrayFields = [
        'mankonSentences', 'pairWords', 'sentenceAudioFileIds', 
        'sentenceAudioFilenames', 'translatedSentences', 'translatedWords', 
        'type', 'wordAudioFileIds', 'wordAudioFilenames'
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
            <div >
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

// Get current entry for pagination
const getCurrentEntry = () => {
    const entriesArray = Object.entries(filteredEntries);
    if (entriesArray.length === 0 || currentEntryIndex >= entriesArray.length) {
        return null;
    }
    return entriesArray[currentEntryIndex];
};

const renderEntriesInterface = () => {
    const currentEntry = getCurrentEntry();
    if (!currentEntry) return null;
    
    const [id, entry] = currentEntry;
    const totalEntries = Object.keys(filteredEntries).length;
    
    return (
        <div className="content-card">
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
                    ← Previous
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
                    <hr className="section-divider-mini" />
                    {renderEditableField(id, 'partOfSpeech', 'Part of Speech', entry.partOfSpeech, '')}
                    <hr className="section-divider-mini" />
                    {renderEditableField(id, 'altSpelling', 'Alternate Spelling', entry.altSpelling, '')}
                    <hr className="section-divider-mini" />
                    {renderEditableField(id, 'translatedWords', 'Translations', entry.translatedWords, '')}
                    <hr className="section-divider-mini" />
                </div>
                <div>
                    {renderEditableField(id, 'mankonSentences', 'Mankon Sentences', entry.mankonSentences,'')}
                    <hr className="section-divider-mini" />
                    {renderEditableField(id, 'translatedSentences', 'Sentence Translations', entry.translatedSentences,'')}
                    <hr className="section-divider-mini" />
                    {renderEditableField(id, 'pairWords', 'Related Words', entry.pairWords, '')}
                    <hr className="section-divider-mini" />
                    {renderEditableField(id, 'type', 'Semantic Categories', entry.type, '')}
                    <hr className="section-divider-mini" />
                    {renderEditableField(id, 'wordAudioFilenames', 'Word Audio Filenames', entry.wordAudioFilenames, '')}
                    <hr className="section-divider-mini" />
                    {renderEditableField(id, 'wordAudioFileIds', 'Word Audio File IDs', entry.wordAudioFileIds, '')}
                    <hr className="section-divider-mini" />
                    {renderEditableField(id, 'sentenceAudioFilenames', 'Sentence Audio Filenames', entry.sentenceAudioFilenames,'')}
                    <hr className="section-divider-mini" />
                    {renderEditableField(id, 'sentenceAudioFileIds', 'Sentence Audio File IDs', entry.sentenceAudioFileIds,'')}
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
        </div>
    );
};

return renderEntriesInterface();

}