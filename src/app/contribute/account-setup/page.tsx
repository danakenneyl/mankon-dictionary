'use client';
import "@/styles/globals.css";
import { useState } from 'react';
import { db } from '@/utils/firebase';
import { ref, get, set } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import { Contributor } from "@/utils/types";
import { useRouter } from "next/navigation";

export interface formData {
    username: string;
    password: string;
}

export default function AccountSetup() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [usernameStatus, setUsernameStatus] = useState<{valid: boolean; message: string | null}>({
        valid: false, 
        message: null
    });
    const router = useRouter();

    // Init user input 
    const [formData, setFormData] = useState<formData>({
        username: "",
        password: "",
        });

    // Required fields for fast reference
    const requiredFields: (keyof formData)[] = [
        "username",
        "password", 
    ];

    // Verify username is unique
    const uniqueUser= async (username: string) => {
        if (username === "") {
          setUsernameStatus({
            valid: false,
            message: "Invalid username"
          });
          return false;
        }
        const contributorsRef = ref(db, 'contributors');
        const data = await get(contributorsRef);

        if (data.exists()) {
            const contributors = data.val() as { [key : string] : Contributor};
            const user = Object.values(contributors).some(
                (contributor) => contributor.username === username);
            
            // If username already exists
            if (user) {
                setUsernameStatus({
                    valid: false,
                    message: "Username already exists. Please choose another."
                });
                return user;
            } else {
                setUsernameStatus({
                    valid: true,
                    message: "Valid username!"
                });
            }       
        }
        return false;
    };

    // Update user input as user types (less processing at submission time)
    const handleUserInput = (e : React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }))
        console.log(formData);
        // Validate username when it changes
        if (name === 'username') {
            uniqueUser(value);
        }
    };

    // Verify all required fields are filled and username is unique
    const validSubmission = async () => {
        if (requiredFields.every(field => !!formData[field])) {
            // Valid inputs
            const newUser = usernameStatus.valid;
            // Return true if all fields are filled and username is unique
            return newUser;
        }
        return false;
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Validate username and all fields
            const validate = await validSubmission();
            if (!validate) {
                setIsSubmitting(false);
                return;
            }

            // User input not needed for these fields 
            const contributorUUID = uuidv4();
            const timestamp = new Date().toISOString();

            // New user
            const contributor: Contributor = {
                contribution: [],
                createdAt: timestamp,
                lastModifiedAt: timestamp,
                role: "contributor",
                password: formData.password,
                username: formData.username
            };
            
            // Update database
            // 1. new Contributor entry
            const contributorRef = ref(db, `contributors/${contributorUUID}`);
            await set(contributorRef, contributor);

            // Return to contribute page
            router.push('/contribute/contribute-instructions');

        } catch (error: unknown) {
            const errorMessage =  error instanceof Error ? error.message : "unspecified error occurred";
            const message = "Submission error:" + errorMessage;
            setSubmitError(message);
        }
        finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="content-wrapper">
            <div className="content">
                <div className="login-container login-card">
                    <form onSubmit={handleSubmit}>
                        <h1>Create Account</h1>
                        <div className="intro-decoration">
                        <div className="decoration-line"></div>
                        <div className="decoration-symbol"></div>
                        <div className="decoration-line"></div>
                        </div>
                        <p className="center-text txt">Please choose a username and password.</p>
                        {/* Question 1: Unique username */}
                        <div >
                            <input 
                                type="text" 
                                name="username" 
                                value={formData.username}
                                onChange={handleUserInput}
                                placeholder="username"
                                className="login-input"
                                required
                            />
                            <p>{usernameStatus.message}</p>
                        </div>
                        {/* Question 1: Password */}
                        <div>
                            <input 
                                type="text" 
                                name="password" 
                                value={formData.password}
                                onChange={handleUserInput}
                                placeholder="password"
                                className = "login-input"
                                required
                            />
                        </div>

                        {submitError && (
                            <div className="error-message text-red-500 mt-2">
                                {submitError}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="next-button"
                            >
                            Create Account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
