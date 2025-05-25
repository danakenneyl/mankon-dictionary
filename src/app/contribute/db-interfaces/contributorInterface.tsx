"use client";
import React from "react";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";

import { db } from "@/utils/firebase";
import {ContributorCollection, EntryCollection } from "@/utils/types";

export default function ContributorInterface() {
      const [contributors, setContributors] = useState<ContributorCollection>({});
      const [entries, setEntries] = useState<EntryCollection>({});

      const [, setLoading] = useState<boolean>(true);
      const [, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const contributorsRef = ref(db, 'contributors');
        
        // Listen for changes to the entries in Firebase
        const unsubscribe = onValue(contributorsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val() as ContributorCollection;
            setContributors(data);
          } else {
            setContributors({});
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

      useEffect(() => {
        const entriesRef = ref(db, 'entries');
        
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
    
    return (<div className="center">
                <section className="max-w-3xl mx-auto p-6 interface-head">
                <h1 className="text-4xl font-bold mb-6 text-center">Contributors</h1>
                <div className="intro-decoration">
                <div className="decoration-line"></div>
                <div className="decoration-symbol"></div>
                <div className="decoration-line"></div>
                </div>
                </section>
                <div className="contributors-list">
                    {Object.entries(contributors).map(([id, contributor]) => (
                        <div key={id} className="contributor-card">
                        <h3>{contributor.username}</h3>
                        <p><strong>Role:</strong> {contributor.role}</p>
                        <p><strong>Created:</strong> {new Date(contributor.createdAt).toLocaleDateString()}</p>
                        <p><strong>Last Modified:</strong> {new Date(contributor.lastModifiedAt).toLocaleDateString()}</p>
                        <div>
                            { contributor.contribution ? 
                                <>
                                    <strong>Contributions:</strong>
                                    <ul>
                                    {contributor.contribution.map((contrib, index) => ( 
                                        <li key={index+1}>{entries[contrib] ? entries[contrib].mankonWord : "Unknown Entry"}</li>
                                    ))}
                                    </ul> 
                                </> : <></>
                            } 
                        </div>
                        </div>
                    ))}
                </div>
            </div>);
}