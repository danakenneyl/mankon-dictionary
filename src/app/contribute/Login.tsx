import React, { useState } from "react";
import { db } from "@/utils/firebase";
import { get, ref } from "firebase/database";
import { WordProposal, Contributor } from "@/utils/types";

interface LoginProps {
    type: "administrator" | "contributor";
    username: string;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
    setFormData?: React.Dispatch<React.SetStateAction<WordProposal>>;
}

export default function Login({ type, username, setUsername, setIsAuthenticated, setFormData }: LoginProps) {
    const [authError, setAuthError] = useState("");
    const [authenticating, setAuthenticating] = useState(false);
    
    // Authenticate user and get UUID
      const authenticateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthenticating(true);
        setAuthError("");
        
        try {
          // Get reference to users in database
          const usersRef = ref(db, 'contributors');
          const snapshot = await get(usersRef);
          
          if (snapshot.exists()) {
            const users = snapshot.val();
            let foundUser: Contributor | null = null;
            let role : string = "";
            let UUID: string = "";

            // Find the user by username
            Object.keys(users).forEach(key => {
              if (users[key].username === username) {
                foundUser = {
                  ...users[key],
                };
                role = users[key].role;
                UUID = key;
              }
            });
            
            if (foundUser && (role === "administrator" || type === "contributor")) {
              // Set authentication state
              setIsAuthenticated(true);
              if (type === "contributor" && setFormData) {
                // Set contributor UUID in form data
                setFormData(prev => ({
                  ...prev,
                  contributorUUID: [UUID as string],
                }));
              }
            } else {
              if (type === "administrator") {
                setAuthError("This username do not have administrator access.");
              } else {
                setAuthError("Username not found. Please try again.");
              }
           }
          } else {
            setAuthError("No users found in the database.");
          }
        } catch (error) {
          console.error("Authentication error:", error);
          setAuthError("Error authenticating user. Please try again.");
        } finally {
          setAuthenticating(false);
        }
      };

    return (

        <div className="content-wrapper">
        <div className="content">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">{type === "administrator" ? "Administrator Login": "Hello! Welcome back."}</h1>
          <p className="login-subtitle">Please enter your username.</p>
          <form onSubmit={authenticateUser} className="login-form">
            <div className="input-group">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input"
                placeholder="Your username"
                required
              />
            </div>
            <div className= "login-group">
            {authError && (
              <div className="error-message">
                {authError}
              </div>
            )}
            <button
              type="submit"
              disabled={authenticating}
              className="next-button"
            >
              {authenticating ? "Just a moment..." : "Login"}
            </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>


    );
}