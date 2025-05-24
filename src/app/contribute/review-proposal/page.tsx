'use client';
import { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import { ref, query, orderByChild, equalTo, get, limitToFirst, remove, update, push, set } from "firebase/database";
import dynamic from 'next/dynamic';
import Login from "@/app/contribute/Login";
import { DemographicData } from "@/types/Datatypes";
import {FetchAudioFileIDs, FetchAudioFile, DeleteAudioFile} from "@/utils/ClientSideAPICalls";
// Dynamic import with SSR disabled
const AudioRecorder = dynamic(
  () => import('@/app/contribute/entry-proposal-form/ProposeEntryRecord'),
  { ssr: false }
);

interface Proposal {
    proposalUUID: string;
    mankonWord: string;
    altSpelling?: string;
    pairWords?: string[];
    type: string;
    translatedWord: string[];
    status: string;
    createdAt: string;
    lastUpdated: string;
    audioWord: string;
    contributorUUID: string;
    audioSentence?: string[];
    mankonSentence?: string[];
    translatedSentence?: string[];
}

export default function ReviewProposal() {
    // Split state approach
    const [proposal, setProposal] = useState<Record<string, Proposal>>({});
    const [editedProposal, setEditedProposal] = useState<Record<string, Proposal>>({});
    const [demographics, setDemographics] = useState<Record<string, string | null | undefined>>({});
    const [audioCache, setAudioCache] = useState<Record<string, string>>({});
    const [audioMap, setAudioMap] = useState<Record<string, string>>({});
    
    // Authentication states
    const [username, setUsername] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    const requiredFields: (keyof Proposal)[] = [
        "mankonWord",
        "altSpelling",
        "pairWords",
        "type",
        "translatedWord",
        "createdAt",
        "lastUpdated",
        "audioWord",
        "contributorUUID",
        "audioSentence",
        "mankonSentence",
        "translatedSentence",
    ];

    // Update the edited proposal object
    const handleUserInput = (proposalId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        setEditedProposal(prevData => ({
            ...prevData,
            [proposalId]: {
                ...prevData[proposalId],
                [name]: value,
            }
        }));
    };

    // Update edited proposal when adding to array
    const handleUserInputArray = (proposalId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newContent = value.split(",");
        setEditedProposal(prevData => ({
            ...prevData,
            [proposalId]: {
                ...prevData[proposalId],
                [name]: newContent,
            }
        }));
    };

    // Update the edited proposal object with sentence inputs
    const handleSentenceInput = (proposalId: string, index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;   
        setEditedProposal(prevData => ({
            ...prevData,
            [proposalId]: {
                ...prevData[proposalId],
                [name]: (prevData[proposalId][name as keyof Proposal] as string[]).map(
                    (sentence, i) => i === index ? value : sentence
                )
            }
        }));
    }

    const handleRecordingComplete = (uuid: string, field: keyof Proposal, blobUrl: string, index?: number) => {
        setEditedProposal((prev) => {
          const proposal = prev[uuid];
          if (!proposal) return prev; // Ensure the proposal exists
      
          // Handle array fields like audioSentence
          if (index !== undefined && Array.isArray(proposal[field])) {
            const updatedArray = [...(proposal[field] as string[])];
            updatedArray[index] = blobUrl || ""; // Clear if empty
      
            return {
              ...prev,
              [uuid]: {
                ...proposal,
                [field]: updatedArray
              }
            };
          } 
          
          // Handle single value fields like audioWord
          return {
            ...prev,
            [uuid]: {
              ...proposal,
              [field]: blobUrl || ""
            }
          };
        });
    };
      
    const handleReject = async (id: string) => {
        if (!window.confirm('Are you sure you want to reject this proposal?')) return;
        
        try {   
            // Get sentence audio files if they exist
            const audioSentences = editedProposal[id].audioSentence || [];
            
            // Combine all audio filenames
            const audioFiles = [editedProposal[id].audioWord, ...audioSentences];
            const results = [];
            
            // Delete all audio files
            for (const filename of audioFiles) {
                const fileId = audioMap[filename];
                if (!fileId) {
                    console.error(`No fileId found for ${filename}`);
                    continue;
                }
                try {
                    const result = await DeleteAudioFile(fileId);
                    results.push(result);
                } catch (error : unknown) {
                    console.error(`Error deleting file ${filename}:`, error);
                }    
            }  

            const proposalRef = ref(db, `proposals/${id}`);
            await remove(proposalRef);
            // Update local state to remove the rejected proposal
            setEditedProposal(prevData => {
                const newData = {...prevData};
                delete newData[id];
                return newData;
            });
            setProposal(editedProposal);
        } catch (err) {
            alert('Error rejecting proposal: ' + (err instanceof Error ? err.message : String(err)));
        }
    };  

    const handleReturnToProposals = async (id : string) => {
        try {
            // Delete files
            const proposalRef = ref(db, `proposals/${id}`);
            const currentProposal = editedProposal[id];
            const updatedProposal = {
                ...currentProposal, 
                lastUpdated: new Date().toISOString(),
            };
            
            await update(proposalRef, updatedProposal);
            alert('Changes saved and returned to proposals');
        } catch (err) {
            alert('Error updating proposal: ' + (err instanceof Error ? err.message : String(err)));
        }
    };

    const validResponse = (entry : Proposal) => {
        if (requiredFields.every(field => !!entry[field])) {
            console.log(entry.type);
            const validType = entry.type === "noun" || entry.type === "verb" || entry.type === "adj" || entry.type === "name" || entry.type === "quarter";
            return validType;
        }
        return false;
    } 
    
    const handleAccept = async (id: string) => {
        if (!window.confirm('Are you sure you want to accept this proposal?')) return;
        
        try {
          // Get the proposal data from the state using the provided id
          const selectedProposal = editedProposal[id];
          
          // If no proposal is found for the given id, show an error and return
          if (!selectedProposal) {
            alert('Proposal not found!');
            return;
          }
          if (!validResponse(selectedProposal)){
            alert('Invalid proposal');
            return;
          }
          // Create entry object from the selected proposal
          const newEntry = {
            mankonWord: selectedProposal.mankonWord,
            altSpelling: selectedProposal.altSpelling,
            translatedWord: selectedProposal.translatedWord,
            pairWords: selectedProposal.pairWords,
            mankonSentence: selectedProposal.mankonSentence,
            translatedSentence: selectedProposal.translatedSentence,
            audioWord: selectedProposal.audioWord,
            audioSentence: selectedProposal.audioSentence,
            createdAt: new Date().toISOString(),
            lastModifiedAt: new Date().toISOString(),
            type: selectedProposal.type,
            contributorUUIDs: [selectedProposal.contributorUUID]
          };
          
          // Get a reference to the "entries" path in Firebase
          const entriesRef = ref(db, 'entries');
          
          // Push a new entry to the "entries" node, Firebase will generate the unique ID
          const newEntryRef = push(entriesRef);
          await set(newEntryRef, newEntry);
          
          // Remove the proposal from the "proposals" node
          const proposalRef = ref(db, `proposals/${id}`);
          await remove(proposalRef);
          // Update local state to remove the rejected proposal
          setEditedProposal(prevData => {
            const newData = {...prevData};
            delete newData[id];
            return newData;
        });
        setProposal(editedProposal);
    
          alert('Proposal accepted and added to dictionary');
        } catch (err) {
          alert('Error accepting proposal: ' + (err instanceof Error ? err.message : String(err)));
        }
    };
      
    // Retrieve Demographic information about the contributor
    const retrieveDemographic = async (contributorUUID: string) => {
        const demographicRef = ref(db, "demographics");
        const demographicQuery = query(demographicRef, orderByChild("UUID"), equalTo(contributorUUID));
        try {
            const snapshot = await get(demographicQuery);
            if (snapshot.exists()) {
                const demographicData = Object.values(snapshot.val())[0] as DemographicData;
                return demographicData.speechProficiency;
            } else {
                console.error("No demographic data found for contributor:", contributorUUID);
                return null;
            }
        } catch (error) {
            console.error("Error fetching demographics:", error);
            return null;
        }
    }

    // First effect: Fetch proposals only after authentication
    useEffect(() => {
        // Only fetch proposals if user is authenticated
        if (!isAuthenticated) return;
        
        const fetchProposals = async () => {
            const proposalsRef = ref(db, "proposals");
            const pendingProposalsQuery = query(proposalsRef, orderByChild("status"), equalTo("pending"), limitToFirst(5));
            try {
                const snapshot = await get(pendingProposalsQuery);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setProposal(data);
                    setEditedProposal(data); // Initialize editable state with the same data
                } else {
                    setProposal({});
                    setEditedProposal({});
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
        fetchProposals();
    }, [isAuthenticated]);

    // Second effect: Fetch audio files when original proposal data changes
    useEffect(() => {
        // Only run if we have proposals
        if (Object.keys(proposal).length === 0) return;
        
        const fetchAudioData = async () => {
            try {
                // Get all audio files needed from the original data
                const audioWords = Object.values(proposal).map(p => p.audioWord);
                
                // Also get sentence audio files if they exist
                const audioSentences = Object.values(proposal)
                    .flatMap(p => p.audioSentence || [])
                    .filter(Boolean);
                
                // Combine all audio filenames
                const allAudioFiles = [...audioWords, ...audioSentences];
                
                // Fetch file IDs just once
                const fileMap = await FetchAudioFileIDs(allAudioFiles);
                setAudioMap(fileMap);
                
                // Create audio elements without updating state inside the loop
                const newAudioCache: Record<string, string> = {};
            
                try {
                    const audioPromises = Object.entries(fileMap).map(async ([filename, fileId]) => {
                        const audio = await FetchAudioFile(fileId);
                        newAudioCache[filename] = audio;
                    });
                
                    await Promise.all(audioPromises);
                    setAudioCache(newAudioCache);
                } catch (error) {
                    console.error("Error preloading audio:", error);
                }
            } catch (error) {
                console.error("Error loading audio:", error);
            }
        };
        
        fetchAudioData();
    }, [proposal]); // Depend only on the original data, not edited version

    // Fetch demographics from the database - only when original data changes
    useEffect(() => {
        const fetchDemographics = async () => {
            const newDemographics: Record<string, string | null> = {};

            // Process each proposal to get contributor demographics
            await Promise.all(
                Object.values(proposal).map(async (p) => {
                    const speechProficiency = await retrieveDemographic(p.contributorUUID);
                    newDemographics[p.contributorUUID] = speechProficiency ?? null; 
                })
            );

            setDemographics(newDemographics);
        };

        // Only fetch demographics if we have proposals
        if (Object.keys(proposal).length > 0) {
            fetchDemographics();
        }
    }, [proposal]); // Depend only on the original data

    // If not authenticated, show login form
    if (!isAuthenticated) {
       return (<Login type="administrator" username={username} setUsername={setUsername} setIsAuthenticated={setIsAuthenticated} />);
    }

    // If authenticated, show the proposals
    return (
        <div className="flex justify-center">
            <div className="content-wrapper">
                <div className="content">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Review Proposals</h1>
                        <div className="text-sm text-gray-600">
                            Logged in as: <span className="font-semibold">{username}</span>
                        </div>
                    </div>

                    {Object.entries(editedProposal).length === 0 ? (
                        <div className="text-center py-8">
                            <p>No pending proposals found.</p>
                        </div>
                    ) : (
                        Object.entries(editedProposal).map(([key, editedProposal]) => (
                            <div key={key} className="border p-4 mb-4 rounded-md">
                                <div><strong> Contributor ID: {editedProposal.contributorUUID}</strong></div>
                                <div><strong> Contributor Speech Proficiency: {demographics[editedProposal.contributorUUID] || "Loading..."}</strong></div>
                                <div><strong> Created at: {new Date(editedProposal.createdAt).toLocaleDateString()}</strong></div>
                                <div> 
                                    <strong>Mankon Word </strong>
                                    <input 
                                        type="text" 
                                        name="mankonWord" 
                                        value={editedProposal.mankonWord || ""}
                                        onChange={(e) => handleUserInput(key, e)}
                                        placeholder=""
                                    />
                                </div>
                                <div>
                                    <strong>Entry Type / Part of Speech </strong>
                                    <input 
                                        type="text" 
                                        name="type" 
                                        value={editedProposal.type || ""}
                                        onChange={(e) => handleUserInput(key, e)}
                                        placeholder=""
                                    />
                                </div>
                                <div>
                                    <strong>Pronunciation </strong>  
                                    <AudioRecorder
                                        instanceId="sentence-recording-1"
                                        initialAudio= {audioCache[editedProposal.audioWord]}
                                        onRecordingComplete={(blobUrl) => handleRecordingComplete(editedProposal.contributorUUID, "audioWord", blobUrl, 0)}
                                    />
                                </div>
                                <div>
                                    <strong>Alternate Spelling </strong>
                                    <input 
                                        type="text" 
                                        name="altSpelling" 
                                        value={editedProposal.altSpelling || ""}
                                        onChange={(e) => handleUserInput(key, e)}
                                        placeholder=""
                                    />
                                </div>
                                <div>
                                    <strong>Translation </strong>
                                    <input 
                                        type="text" 
                                        name="translatedWord" 
                                        value={editedProposal.translatedWord.join(", ") || ""}
                                        onChange={(e) => handleUserInput(key, e)}
                                        placeholder={editedProposal.translatedWord.join(", ") || ""}
                                    />
                                </div>
                                <div>
                                    <strong>Paired Words </strong>
                                    <input 
                                        type="text" 
                                        name="pairWords" 
                                        value={editedProposal.pairWords ? editedProposal.pairWords.join(", ") : ""}
                                        onChange={(e) => handleUserInputArray(key, e)}
                                        placeholder={editedProposal.pairWords ? editedProposal.pairWords.join(", ") : ""}
                                    />
                                    <em> seperate words with commas </em>
                                </div>
                                {editedProposal.mankonSentence?.map((sentence, index) => (
                                    <div key={index}> 
                                        <strong>Mankon Sentence {index + 1} </strong>
                                        <input 
                                            type="text" 
                                            name="mankonSentence"  
                                            value={sentence}  
                                            onChange={(e) => handleSentenceInput(key, index, e)}
                                            placeholder={sentence}
                                            style={{ width: '100%', minWidth: '300px' }}
                                        />
                                        <strong>English Sentence {index + 1} </strong>
                                        <input 
                                            type="text" 
                                            name="translatedSentence"  
                                            value={editedProposal.translatedSentence ? editedProposal.translatedSentence[index] : ""}  
                                            onChange={(e) => handleSentenceInput(key, index, e)}
                                            placeholder={editedProposal.translatedSentence ? editedProposal.translatedSentence[index] : ""}
                                            style={{ width: '100%', minWidth: '300px' }}
                                        />
                                        <strong> Sentence {index + 1} Pronunciation </strong>  
                                        {editedProposal.audioSentence?.[index] && (
                                            <AudioRecorder
                                                instanceId="sentence-recording-1"
                                                initialAudio= {audioCache[editedProposal.audioSentence[index]]}
                                                onRecordingComplete={(blobUrl) => handleRecordingComplete(editedProposal.contributorUUID, "audioSentence", blobUrl, 0)}
                                            />
                                        )}
                                    </div>
                                ))}
                                <div className="action-buttons">
                                    <button 
                                        className="action-button reject" 
                                        onClick={() => handleReject(key)}
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        className="action-button return" 
                                        onClick={() => handleReturnToProposals(key)}
                                    >
                                        Return to Proposals
                                    </button>
                                    <button 
                                        className="action-button accept" 
                                        onClick={() => handleAccept(key)}
                                    >
                                        Accept
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}