"use client";
import "@/styles/globals.css";
import "@/styles/interfaces.css";
import {useState} from "react";
import ContributorInterface from "./contributorInterface";
import DemographicInterface from "./demographicInterface";
import EntryInterface from "./proposalAndEntryInterface";
import Login from "@/app/contribute/Login";

export default function DatabaseInterfaces() {
    const [activeView, setActiveView] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("");
    
    const handleViewClick = (view : string) => {
      setActiveView(view);
    };
    if (!isAuthenticated) {
    return (<Login type="administrator" username={username} setUsername={setUsername} setIsAuthenticated={setIsAuthenticated} />);
    }
    return (
        <div className="content-wrapper">
            <div className="content">
                <div className="interface-homepage">
                    <div className="scaffold">
                        <div className="sub-scaffold">
                        <button className="next-button" onClick={() => handleViewClick("contributors")}>Contributors</button>
                        <button className="next-button" onClick={() => handleViewClick("demographics")}>Demographics</button>
                        <button className="next-button" onClick={() => handleViewClick("entries")}>Complete Entries</button>
                        </div>
                        <div className="sub-scaffold">
                        <button className="next-button" onClick={() => handleViewClick("initial")}>Initial Entry</button>
                        <button className="next-button" onClick={() => handleViewClick("review")}>Review Entry</button>
                        <button className="next-button" onClick={() => handleViewClick("approve")}>Approve Entry</button>
                        </div>
                    </div>
                    {activeView === "contributors" && <ContributorInterface/>}
                    {activeView === "demographics" && <DemographicInterface/>}
                    {activeView === "entries" && <EntryInterface type="entries"/>}
                    {activeView === "initial" && <EntryInterface type="proposals" state="Initial Proposals"/>}
                    {activeView === "review" && <EntryInterface type="proposals" state="Review Proposals"/>}
                    {activeView === "approve" && <EntryInterface type="proposals" state="Approve Proposals"/>}  
                </div>
            </div>
        </div>
    );
}