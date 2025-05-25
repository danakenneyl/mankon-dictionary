"use client";
import React from "react";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";

import { db } from "@/utils/firebase";
import { DemographicCollection } from "@/utils/types";

export default function DemographicInterface() {
      const [demographics, setDemographics] = useState<DemographicCollection>({});
      const [, setLoading] = useState<boolean>(true);
      const [, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const entriesRef = ref(db, 'demographics');
        
        // Listen for changes to the entries in Firebase
        const unsubscribe = onValue(entriesRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val() as DemographicCollection;
            setDemographics(data);
          } else {
            setDemographics({});
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
    
    return (<div className="left">
                {demographics && Object.keys(demographics).length > 0 ? 
                <>
                    <section className="max-w-3xl mx-auto p-6 interface-head">
                    <h1 className="text-4xl font-bold mb-6 text-center">Demographics</h1>
                    <div className="intro-decoration">
                    <div className="decoration-line"></div>
                    <div className="decoration-symbol"></div>
                    <div className="decoration-line"></div>
                    </div>
                    </section>
                    {Object.entries(demographics).map(([id, demographic]) => (
                        <div key = {id} className="demographic-card">
                            <h3 className="text-2xl font-bold">{demographic.UUID}</h3>
                            <p className="text-lg">Age: {demographic.age}</p>
                            <p className="text-lg">Currently living at: {demographic.location}</p>
                            <p className="text-lg">Identifies as diaspora: {demographic.diaspora}</p>
                            <p className="text-lg">Languages understood: {demographic.spokenLanguage}</p>
                            <p className="text-lg">Languages currently spoken: {demographic.currentLanguage}</p>
                            <p className="text-lg">Childhood languages: {demographic.childhoodLanguage}</p>
                            <p className="text-lg">Years speaking: {demographic.yearsSpeaking}</p>
                            <p className="text-lg">Learned how to speak: {demographic.learnSpeechModality}</p>
                            <p className="text-lg">Speech proficiency: {demographic.speechProficiency}</p>
                            <p className="text-lg">Writing proficiency: {demographic.writeProficiency}</p>
                            <p className="text-lg">Reading proficiency: {demographic.readProficiency}</p>
                            <p className="text-lg">Created at: {demographic.createdAt}</p>
                            <p className="text-lg">Last modified at: {demographic.lastModifiedAt}</p>
                        </div>
                    ))}
                </> 
                : <h2>No Demographics Found</h2>
                } 
            </div>);
}