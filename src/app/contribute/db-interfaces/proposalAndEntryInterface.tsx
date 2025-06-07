"use client";
import React from "react";
import { useEffect, useState } from "react";
import { ref, onValue,} from "firebase/database";

import { db } from "@/utils/firebase";
import { WordEntry, EntryCollection } from "@/utils/types";
import RenderProposalsInterface from "./renderProposalOrEntry/renderProposalsInterface";
import RenderEntriesInterface from "./renderProposalOrEntry/renderEntriesInterface";

interface Props {
    type: string;
    state?: string;
}

export default function EntryInterface(props: Props) {
    const [allEntries, setAllEntries] = useState<EntryCollection>({});
    const [filteredEntries, setFilteredEntries] = useState<EntryCollection>({});
    const [, setLoading] = useState<boolean>(true);
    const [, setError] = useState<string | null>(null);
    // Fetch data from Firebase
    useEffect(() => {
        const entriesRef = ref(db, props.type);
        
        const unsubscribe = onValue(entriesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val() as EntryCollection;
                setAllEntries(data);
            } else {
                setAllEntries({});
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching data:', error);
            setError('Failed to load dictionary data. Please try again later.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [props.type]);

    // Filter entries when allEntries, type, or state changes
    useEffect(() => {
        if (props.type === "proposals" && props.state) {
            const filtered: EntryCollection = {};
            
            Object.entries(allEntries).forEach(([id, entry]) => {
                if (props.state === "Initial Proposals" && entry.status === "initial") {
                    filtered[id] = entry;
                }
                else if (props.state === "Review Proposals" && entry.status === "pending") {
                    filtered[id] = entry;
                }
                else if (props.state === "Approve Proposals" && canBeApproved(entry)) {
                    filtered[id] = entry;
                }
            });
            
            setFilteredEntries(filtered);
        } else {
            setFilteredEntries(allEntries);
        }
    }, [allEntries, props.type, props.state]);

    // Helper function to check if a WordProposal can become a WordEntry
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
    }

    return (
        <div className="outline">
            {filteredEntries && Object.keys(filteredEntries).length > 0 ? (
                <>
                    <h1 className="text-4xl font-bold mb-6 text-center">
                        {props.type === "proposals" ? props.state : "Complete Entries"}
                    </h1>
                    <div className="intro-decoration">
                        <div className="decoration-line"></div>
                        <div className="decoration-symbol"></div>
                        <div className="decoration-line"></div>
                    </div>
                    {props.state === "Initial Proposals" && <RenderProposalsInterface filteredEntries={filteredEntries} state={props.state}/> }
                    {props.state === "Review Proposals" && <RenderEntriesInterface filteredEntries={filteredEntries} type={props.type} state={props.state}/> }
                    {props.state === "Approve Proposals" && <RenderProposalsInterface filteredEntries={filteredEntries} state={props.state}/>}
                    {props.type === "entries" && <RenderEntriesInterface filteredEntries={filteredEntries} type={props.type}/> }
                </>
            ) : (
                <h2>No {props.type} Found</h2>
            )}
        </div>
    );
}