'use client';
import { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import { ref, query, orderByChild, equalTo, get, limitToFirst } from "firebase/database";
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { DemographicData } from "@/types/Datatypes";

interface Proposal {
    proposalUUID: string;
    mankonWord: string;
    altSpelling?: string;
    pairWords?: string;
    type: string;
    translatedWord: string[];
    pairWord?: string[];
    status: string;
    createdAt: string;
    lastModifiedAt: string;
    audioWord: string;
    contributorUUID: string;
    // Optional fields
    audioSentence?: string[];
    mankonSentence?: string[];
    translatedSentence?: string[];
  }

export default function ReviewProposal() {
    const [proposal, setProposal] = useState<Record<string, Proposal>>({});
    const [demographics, setDemographics] = useState<Record<string, string | null | undefined>>({});


    // Update the proposal object 
    const handleUserInput = (proposalId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value,  } = e.target;
        
        setProposal(prevData => ({
          ...prevData,
          [proposalId]: {
            ...prevData[proposalId],
            [name]: value,
          }
        }));
    };
    // Update the proposal object with sentence inputs
    const handleSentenceInput = (proposalId: string, index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;   
        setProposal(prevData => ({
            ...prevData,
            [proposalId]: {
                ...prevData[proposalId],
                [name]: (prevData[proposalId][name as keyof Proposal] as string[]).map(
                    (sentence, i) => i === index ? value : sentence
                  )
            }
        }));
        
    }
    // Retrieve Demographic information about the contributor
    const retrieveDemographic = async (contributorUUID: string) => {
        const demographicRef = ref(db, "demographics");
        const demographicQuery = query(demographicRef, orderByChild("speechProfiency"));
        try {
            const snapshot = await get(demographicQuery);
            if (snapshot.exists()) {
                // Extract the first (and usually only) matching demographic entry
                const demographicData = Object.values(snapshot.val())[0] as DemographicData;
                return demographicData.speechProficiency;
            } else {
                console.error("No demographic data found for contributor:", contributorUUID);
                return null;
            }
        } catch (error) {
            console.error("Error fetching demographics:", error);
        }
    }
        
    // Play audio for word pronunciation and sentence pronunciations
    const playAudio = (audioSrc: string) => {
        if (!audioSrc || audioSrc === "") return;  // Prevent errors if there's no audio file
        const audio = new Audio(`/mankon-dictionary/audio/${audioSrc}`); 
        audio.play();
    };

    // Fetch proposals from the database 
    useEffect(() => {
        const fetchProposals = async () => {
            const proposalsRef = ref(db, "proposals");
            const pendingProposalsQuery = query(proposalsRef, orderByChild("status"), equalTo("pending"), limitToFirst(5));
            try {
                const snapshot = await get(pendingProposalsQuery);
                if (snapshot.exists()) {
                    const proposalData = snapshot.val();
                    setProposal(proposalData);
                }
                else {
                    setProposal({});
                }
             
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchProposals();
    }, []);

        // Fetch demographics from the database 
    useEffect(() => {

        const fetchDemographics = async () => {
            const newDemographics: Record<string, string | null> = {};

            // Assuming proposal is already populated in the state
            await Promise.all(
                Object.values(proposal).map(async (p) => {
                    const speechProficiency = await retrieveDemographic(p.contributorUUID);
                    newDemographics[p.contributorUUID] = speechProficiency ?? null; 
                })
            );

            setDemographics(newDemographics);
        };

        fetchDemographics();
    }, [proposal]);

    return (
        <div className="flex justify-center">
            <div className="content-wrapper">
                <div className="content">
                    {Object.entries(proposal).map(([key, proposal]) => (
                        <div key={key} className="border p-4 mb-4 rounded-md">
                            <div><strong> Contributor ID: {proposal.contributorUUID}</strong></div>
                            <div><strong> Contributor Speech Proficiency: {demographics[proposal.contributorUUID] || "Loading..."}</strong></div>
                            <div><strong> Created at: {new Date(proposal.createdAt).toLocaleDateString()}</strong></div>
                            <div> 
                                <strong>Mankon Word </strong>
                                <input 
                                    type="text" 
                                    name="mankonWord" 
                                    value={proposal.mankonWord}
                                    onChange={(e) => handleUserInput(key, e)}
                                    placeholder=""
                                />
                            </div>
                            <div>
                                <strong>Entry Type / Part of Speech </strong>
                                <input 
                                    type="text" 
                                    name="type" 
                                    value={proposal.type}
                                    onChange={(e) => handleUserInput(key, e)}
                                    placeholder=""
                                />
                            </div>
                            <div>
                                <strong>Pronunciation </strong>  
                                {proposal.audioWord?.[0] && (
                                    <VolumeUpIcon 
                                        className="pronunciation" 
                                        onClick={() => playAudio(proposal.audioWord[0])}
                                        style={{ cursor: "pointer" }}
                                    />
                                )}
                            </div>
                            <div>
                                <strong>Alternate Spelling </strong>
                                <input 
                                    type="text" 
                                    name="altSpelling" 
                                    value={proposal.altSpelling}
                                    onChange={(e) => handleUserInput(key, e)}
                                    placeholder=""
                                />
                            </div>
                            <div>
                                <strong>Translation </strong>
                                <input 
                                    type="text" 
                                    name="translatedWord" 
                                    value={proposal.translatedWord}
                                    onChange={(e) => handleUserInput(key, e)}
                                    placeholder={proposal.translatedWord.join(", ")}
                                />
                            </div>
                            <div>
                                <strong>Paired Words </strong>
                                <input 
                                    type="text" 
                                    name="pairWord" 
                                    value={proposal.pairWord}
                                    onChange={(e) => handleUserInput(key, e)}
                                    placeholder={proposal.pairWord?.join(", ")}
                                />
                                <em> seperate words with commas </em>
                            </div>
                            {proposal.mankonSentence?.map((sentence, index) => (
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
                                        name="mankonSentence"  
                                        value={proposal.translatedSentence ? proposal.translatedSentence[index] : ""}  
                                        onChange={(e) => handleSentenceInput(key, index, e)}
                                        placeholder={proposal.translatedSentence ? proposal.translatedSentence[index] : ""}
                                        style={{ width: '100%', minWidth: '300px' }}
                                    />
                                    <strong> Sentence {index + 1} Pronunciation </strong>  
                                    {proposal.audioSentence?.[index] && (
                                        <VolumeUpIcon 
                                            className="audioSentence" 
                                            onClick={() => playAudio(proposal.audioSentence ? proposal.audioSentence[index] : "")}
                                            style={{ cursor: "pointer" }}
                                        />
                                    )}
                                </div>
                            ))}
                            

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}