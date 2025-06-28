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
                        <p>
                            The Mankon Dictionary prioritizes the informed consent of all of our contributors. 
                            Before creating an account, please read through the following descriptions. It is important that you fully understand 
                            the scope and purpose of the project, and the terms of participation before you begin contributing.  
                        </p>
                        <hr className="section-divider" />
                        <p className="center-text">
                            <strong>Key Information About this Project</strong>
                        </p>
                        <p>
                            The following is a short summary to help you decide whether or not you want to be a part of this project. 
                            This project is timely and urgent because of the interruption to language transmission experienced by Mankon people amidst the Anglophone crisis, and the need for high-quality linguistic documentation. 
                            This project will fill gaps in Mankon language documentation, addressing multiple areas that are not well-documented. 
                            The recordings, transcriptions, and translations collected in this project will serve as an important resource for Mankon literacy efforts and linguistic research on a variety of topics. 
                        </p>
                        <hr className="section-divider" />
                        <p className="center-text">
                            <strong>What should I know about this project?</strong>
                        </p>
                        <p>
                            <li>This project will be explained to you.</li>
                            <li>Your participation is completely voluntary.</li>
                            <li>You can choose to not take part.</li>
                            <li>You can agree to take part and later change your mind.</li>
                            <li>Your decision to stop participating will not affect your relationships with any person or organization involved with the project.</li>
                            <li>You can ask all the questions you want before you decide to participate.</li>
                        </p>
                        <hr className="section-divider" />
                        <p className="center-text">
                            <strong>Why is this project being done?</strong>
                        </p>
                        <p>
                            The purpose of this research is to better understand and explain the grammar of Mankon and to carry this knowledge to L1 and L2 learners of Mankon. 
                            The research is part of Dana Kenney-Lillejord&apos;s undergraduate research in linguistics. 
                        </p>
                        <hr className="section-divider" />

                        <p className="center-text">
                            <strong>What will I need to do to participate?</strong>
                        </p>
                        <p>
                            If you agree to be in this project, we will ask you to submit recordings of individual words and sentences that feature those words in a common context. 
                            If you have an interest in learning how to write and read in Mankon we will ask you to use the process of transcribing (i.e. writing down what you hear in Mankon) 
                            and translating recordings as an opportunity to practice your literacy skills. 
                        </p>
                        <hr className="section-divider" />
                     
                        <p className="center-text">
                            <strong>What happens if I say “Yes, I want to be a part of the Mankon Dictionary Project”? </strong>
                        </p>
                        <p>
                            If you agree to aid this project, you will be able to submit recordings of Mankon words and Mankon sentences at any time that is convenient for you. 
                            You will likewise be able to practice writing and translating from Mankon to English at any time that is convenient for you.
                            <br></br>
                            Contribution opportunities will focus on Mankon. 
                            You will not be asked about your personal opinions, about private details of your life, or about anyone else’s private life. 
                            If you accidentally disclose private information, for example including it as part of an example sentence, please contact the Mankon Dictionary at mankon.dictionary@gmail.com 
                            so it can be removed. 
                            <br></br>
                            The Mankon dictionary will not ask you to disclose information that is culturally inappropriate. 
                        </p>
                        <hr className="section-divider" />

                        <p className="center-text">
                            <strong>What are my responsibilities if I take part? </strong>
                        </p>
                        <p>
                            All you will need to do for this project is to fill out the &apos;Propose Word&apos; form or find a word on the &apos;Word Requests&apos; page and fill out its accompanying proposal form. 
                            The Mankon Dictionary will also provide you with opportunities for Mankon writing and translation practice. 
                        </p>
                        <hr className="section-divider" />

                        <p className="center-text">
                            <strong>What happens if I say “Yes”, but I change my mind later? </strong>
                        </p>
                        <p>
                            You can leave the project at any time and no one will be upset by your decision. 
                            If you decide to leave the project, contact the Mankon Dictionary at mankon.dictionary@gmail.com, so that they can arrange for any audio to be removed from the website at your request.
                            Additionally, we will provide you with a digital copy of your audio if requested.
                        </p>
                        <hr className="section-divider" />

                        <p className="center-text">
                            <strong>Will it cost me anything to participate in this project? </strong>
                        </p>
                        <p>
                            It will not cost you to participate in this project. 
                        </p>
                        <hr className="section-divider" />

                        <p className="center-text">
                            <strong>What happens to the information collected for the project? </strong>
                        </p>
                        <p>
                           The language data (audio) you provide in the Entry Proposal Form and written transcriptions you provide on the ‘Writing Practice’ page, will be used for the following purposes: 
                           <li>As materials to be shared with all Mankon people, other researchers, language learners, or the general public, according to your preferences </li>
                           <li>As part of a Mankon language material collection (i.e. annotated corpus) for linguistic researchers; and, </li>
                           <li>As data/information to be studied by the researcher (and possibly others, depending on your preferences) for descriptive and analytical research; </li>
                            
                        </p>
                        <hr className="section-divider" />
                        <p>
                            If you fill out the optional Attribution Consent Form available on the Create Account Page, you will have ownership of your language data.
                            That means that you can request a copy of the recorded audio from any or all of your entries, and use it as you choose. 
                            It also means that you get to choose how your language data is used and shared. 
                            You will have the opportunity to tell us how we can use and share your language data, and in which contexts you want your identity to be associated with it.
                            With your consent, we will use your language data under Creative Commons licensure; 
                            this allow you to keep some rights and share some rights (read more at https://creativecommons.org/faq/#general-license-information). 
                        </p>
                        <hr className="section-divider" />

                        <strong className="center-text txt">By creating an account with the Mankon Dictionary Project, you confirm that you have read, understood, and agree to the scope, purpose, and terms of participation outlined above.</strong>
                        {/* Question 1: Unique username */}
                        <div className="account-input">
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
                        <div className="account-input">
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
                        <div className="flex items-center justify-center">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="next-button "
                                >
                                Create Account
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
