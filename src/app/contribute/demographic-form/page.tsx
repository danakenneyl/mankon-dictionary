'use client';
import "@/styles/globals.css";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/utils/firebase';
import { ref, get, push, set } from 'firebase/database';
import LanguageCheckBoxes from "./languageCheckbox";
import { Demographics, Contributor } from "@/utils/types";

interface diaspora {
    yes: boolean;
    no: boolean;
}

interface languageCheckboxes {
    mankon: boolean;
    english: boolean;
    french: boolean;
    pidgin: boolean;
}

interface communicationMode {
    email: boolean;
    phone: boolean;
}

export interface formData {
    username: string;
    name: string;
    age: string;
    location: string;
    diaspora: diaspora;
    spokenLanguageCheck: languageCheckboxes;
    spokenLanguageOther: string;
    currentLanguageCheck: languageCheckboxes;
    currentLanguageOther: string;
    childhoodLanguageCheck: languageCheckboxes;
    childhoodLanguageOther: string;
    yearsSpeaking: number;
    learnSpeechModality: string;
    speechProficiency: string;
    writeProficiency: string;
    readProficiency: string;
    communicationMode: communicationMode;
    email: string;
    phoneNumber: string;
    consentReceived: boolean;
}

export default function DemographicQuestions() {
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
        name: "",
        age: "",
        location: "",
        diaspora: {
            yes: false,
            no: false,
        },
        spokenLanguageCheck: {
            mankon: false,
            english: false,
            french: false,
            pidgin: false
        },
        spokenLanguageOther: "",
        currentLanguageCheck: {
            mankon: false,
            english: false,
            french: false,
            pidgin: false
        },
        currentLanguageOther: "",
        childhoodLanguageCheck: {
            mankon: false,
            english: false,     
            french: false,
            pidgin: false
        },
        childhoodLanguageOther: "",
        yearsSpeaking: 0,
        learnSpeechModality: "",
        speechProficiency: "",
        writeProficiency: "",
        readProficiency: "",
        communicationMode: {
            email: false,
            phone: false
        },
        email: "",
        phoneNumber: "",
        consentReceived: false
    });

    // Required fields for fast reference
    const requiredFields: (keyof formData)[] = [
        "username",
        "name",
        "age", 
        "location",
        "diaspora",
        "yearsSpeaking",
        "learnSpeechModality",
        "speechProficiency",
        "writeProficiency",
        "readProficiency",
    ];

    // Verify username exists in database
    const verifyExistingUser = async (username: string) => {
        if (username === "") {
          setUsernameStatus({
            valid: false,
            message: "Please enter a username"
          });
          return false;
        }
        
        const contributorsRef = ref(db, 'contributors');
        const data = await get(contributorsRef);

        if (data.exists()) {
            const contributors = data.val() as { [key : string] : Contributor};
            const userExists = Object.values(contributors).some(
                (contributor) => contributor.username === username);
            
            if (userExists) {
                setUsernameStatus({
                    valid: true,
                    message: "Username found!"
                });
                return true;
            } else {
                setUsernameStatus({
                    valid: false,
                    message: "Username not found. "
                });
                return false;
            }
        } else {
            setUsernameStatus({
                valid: false,
                message: "No accounts found. Please create an account first."
            });
            return false;
        }
    };

    // Update user input as user types (less processing at submission time)
    const handleUserInput = (e : React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        
        // Validate username when it changes
        if (name === 'username') {
            verifyExistingUser(value);
        }
    };

    const handleDiasporaChange = (option: "yes" | "no") => {
        setFormData((prevData) => ({
          ...prevData,
          diaspora: {
            yes: option === "yes",
            no: option === "no",
          },
        }));
      };

    const handleCommunicationModeChange = (mode: "email" | "phone") => {
        setFormData((prevData) => ({
            ...prevData,
            communicationMode: {
                ...prevData.communicationMode,
                [mode]: !prevData.communicationMode[mode]
            },
            // Clear the corresponding field if unchecked
            ...(mode === "email" && !prevData.communicationMode.email ? { email: "" } : {}),
            ...(mode === "phone" && !prevData.communicationMode.phone ? { phoneNumber: "" } : {})
        }));
    };

    const handleConsentChange = () => {
        setFormData((prevData) => ({
            ...prevData,
            consentReceived: !prevData.consentReceived
        }));
    };

    // Validate Language Checkbox 
    const validLanguageInput = (boxes: languageCheckboxes, other: string) => {
        const boxChecked = Object.values(boxes).some(value => value);
        const otherFilled = other !== '';
        return boxChecked || otherFilled;
    };

    // Verify all required fields are filled and username exists
    const validSubmission = async () => {
        if (requiredFields.every(field => !!formData[field])) {
            // Valid inputs
            const existingUser = usernameStatus.valid;
            const currentLanguage = validLanguageInput(formData.currentLanguageCheck, formData.currentLanguageOther);
            const spokenLanguage = validLanguageInput(formData.spokenLanguageCheck, formData.spokenLanguageOther);
            const childhoodLanguage = validLanguageInput(formData.childhoodLanguageCheck, formData.childhoodLanguageOther);
            
            // Return true if all fields are filled and username exists
            return existingUser && currentLanguage && spokenLanguage && childhoodLanguage;
        }
        return false;
    };

    // Combine checkbox and other language input
    const buildLanguageString = (
        checkboxes: languageCheckboxes,
        other: string
      ) => {
        // gather checked boxes
        const languages: string[] = Object.entries(checkboxes)
          .filter(([, v]) => v)
          .map(([k]) => k);
      
        // append any “other” languages (comma-separated input allowed)
        if (other.trim() !== "") {
          const extras = other
            .split(",")
            .map((l) => l.trim().toLowerCase())
            .filter(Boolean);
          languages.push(...extras);
        }
      
        // remove duplicates & return "english, spanish" format
        return Array.from(new Set(languages)).join(", ");
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
                setSubmitError("Please complete all required fields correctly before submitting.");
                setIsSubmitting(false);
                return;
            }

            // Get contributor UUID from database
            const contributorsRef = ref(db, 'contributors');
            const contributorsData = await get(contributorsRef);
            let contributorUUID = "";

            if (contributorsData.exists()) {
                const contributors = contributorsData.val() as { [key: string]: Contributor };
                const contributorEntry = Object.entries(contributors).find(
                    ([, contributor]) => contributor.username === formData.username
                );
                if (contributorEntry) {
                    contributorUUID = contributorEntry[0];
                }
            }

            if (!contributorUUID) {
                setSubmitError("Could not find user account.");
                setIsSubmitting(false);
                return;
            }

            const timestamp = new Date().toISOString();

            const demographic: Demographics = {
                UUID: contributorUUID,
                name: formData.name,
                age: formData.age,
                location: formData.location,
                diaspora: formData.diaspora.yes,
                consentReceived: formData.consentReceived,
                spokenLanguage: buildLanguageString(
                  formData.spokenLanguageCheck,
                  formData.spokenLanguageOther
                ).split(", "),
                currentLanguage: buildLanguageString(
                  formData.currentLanguageCheck,
                  formData.currentLanguageOther
                ).split(", "),
                childhoodLanguage: buildLanguageString(
                  formData.childhoodLanguageCheck,
                  formData.childhoodLanguageOther
                ).split(", "),
                yearsSpeaking: formData.yearsSpeaking.toString(),
                learnSpeechModality: formData.learnSpeechModality,
                speechProficiency: formData.speechProficiency,
                writeProficiency: formData.writeProficiency,
                readProficiency: formData.readProficiency,
                email: formData.communicationMode.email ? formData.email : "",
                phoneNumber: formData.communicationMode.phone ? formData.phoneNumber : "",
                createdAt: timestamp,
                lastModifiedAt: timestamp
              };

            // Update database - new Demographic entry
            const demographicListRef = ref(db, 'demographics');
            const newDemographicRef = push(demographicListRef); // Generate a unique Firebase key
            await set(newDemographicRef, demographic);

            // Return to contribute page
            router.push('/contribute/contribute-instructions');

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "unspecified error occurred";
            const message = "Submission error: " + errorMessage;
            setSubmitError(message);
        }
        finally {
            setIsSubmitting(false);
        }
    };

    return (
            <div className="content-wrapper">
                <div className="content">
                    <form onSubmit={handleSubmit}>
                        <h1>Attribution Form</h1>
                        <div className="intro-decoration">
                        <div className="decoration-line"></div>
                        <div className="decoration-symbol"></div>
                        <div className="decoration-line"></div>
                        </div>
                        <div className="attribution-form">
                        {/* Username */}
                        <div className="lang-space">
                            <h2 className= "language-checkboxes">Section 1:  General Information</h2>
                        <div>
                            <p>
                                Please enter your username.
                                <br/>
                                {usernameStatus.message}
                            </p>
                            <input 
                                type="text" 
                                name="username" 
                                value={formData.username}
                                onChange={handleUserInput}
                                placeholder="username"
                                className="login-input attribution-input"
                                required
                            />
                        {/* Full Name */}
                            <p>Please enter your full name.</p>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name}
                                onChange={handleUserInput}
                                placeholder="Full Name"
                                className="login-input attribution-input"
                                required
                            />
                        {/* Age */}
            
                            <p>How old are you? </p>
                            <input 
                                type="number" 
                                name="age" 
                                value={formData.age}
                                onChange={handleUserInput}
                                placeholder="0"
                                className="login-input attribution-input"
                                required
                            />
             

                        {/* Location */}
                   
                            <p className="center-text">
                                Where do you currently live?
                                <br/>
                                Include State/Province/Region and Country separated by a comma
                                <br/>
                                Example: Minnesota, USA
                                </p> 
                            <input 
                                type="text" 
                                name="location" 
                                value={formData.location} 
                                onChange={handleUserInput}
                                placeholder="State, Country"
                                className="login-input attribution-input"
                                required
                            />
 

                        {/* Diaspora */}
                 
                            <p className="center-text">Do you identify as a part of the Mankon diaspora?</p> 
                            <div className="diaspora-options">
                                <div>
                                    <input 
                                        type="checkbox" 
                                        id="diaspora-yes" 
                                        checked={formData.diaspora.yes} 
                                        className="check-orange"
                                        onChange={() => handleDiasporaChange("yes")}
                                    />
                                    <label htmlFor="diaspora-yes">Yes</label>
                                </div>
                                <div>
                                    <input 
                                        type="checkbox" 
                                        id="diaspora-no" 
                                        checked={formData.diaspora.no} 
                                        className="check-orange"
                                        onChange={() => handleDiasporaChange("no")}
                                    />
                                    <label htmlFor="diaspora-no">No</label>
                                </div>
                            </div>
                        </div>
                        {/* All Languages Spoken*/}
                        <div className="lang-space">
                            <h2 className= "language-checkboxes">Section 2:  General Language History</h2>
                            <p >What language(s) do you speak?</p> 
                            <LanguageCheckBoxes category="spoken" formData={formData} setFormData={setFormData} />
                        {/* Current Languages */}
                            <p>What language(s) do you currently speak most often?</p> 
                            <LanguageCheckBoxes category="current" formData={formData} setFormData={setFormData} />
                        {/* Childhood Languages */}
                            <p>What language(s) do/did you speak with your parents growing up?</p> 
                            <LanguageCheckBoxes category="childhood" formData={formData} setFormData={setFormData} />
              
                        </div>

                        <div className="lang-space">
                            <h2 className= "language-checkboxes">Section 3:  Mankon Language History</h2>
                            {/* Years Speaking */}
          
                            <p>How long have you spoken Mankon? </p>
                            <input 
                                type="number" 
                                name="yearsSpeaking" 
                                value={formData.yearsSpeaking} 
                                onChange={handleUserInput}
                                className="login-input"
                                required
                            />
    

                        {/* Speech Modality */}
               
                            <p>How did you learn Mankon? </p>
                            <input 
                                type="text" 
                                name="learnSpeechModality" 
                                value={formData.learnSpeechModality} 
                                onChange={handleUserInput}
                                placeholder=""
                                className="login-input"
                                required
                            />
                  

                        {/* Speech Proficiency */}
              
                
                        <p>How proficient are you at speaking Mankon? (Scale 1-5)</p>
                        <ul>
                            <li><strong>1</strong> - No experience speaking Mankon</li>
                            <li><strong>2</strong> - Able to speak basic words and simple phrases</li>
                            <li><strong>3</strong> - Able to speak with some assistance on comprehension</li>
                            <li><strong>4</strong> - Second-Language Fluent Speaker</li>
                            <li><strong>5</strong> - Native Speaker</li>
                        </ul>
                        <input 
                            type="number" 
                            name="speechProficiency" 
                            min="1" 
                            max="5"
                            value={formData.speechProficiency}
                            onChange={handleUserInput}
                            className="login-input"
                            placeholder="0"
                            required
                        />
                        {/* Writing Proficiency */}
                        <p>How proficient are you at writing Mankon? (Scale 1-5)</p>
                        <ul>
                            <li><strong>1</strong> - No experience writing Mankon</li>
                            <li><strong>2</strong> - Able to write with assistance</li>
                            <li><strong>3</strong> - Able to write with occasional support</li>
                            <li><strong>4</strong> - Able to write with minimal support</li>
                            <li><strong>5</strong> - Able to write independently</li>
                        </ul>
                        <input 
                            type="number" 
                            name="writeProficiency"
                            min="1" 
                            max="5"
                            value={formData.writeProficiency}
                            onChange={handleUserInput}
                            className="login-input"
                            placeholder="0"
                            required
                        />
                        {/* Reading Proficiency */}
                        <p>How proficient are you at reading Mankon? (Scale 1-5)</p>
                        <ul>
                            <li><strong>1</strong> - No experience reading Mankon</li>
                            <li><strong>2</strong> - Able to read basic words and simple phrases</li>
                            <li><strong>3</strong> - Able to read with some assistance on comprehension</li>
                            <li><strong>4</strong> - Able to read independently, slowly, with minimal difficulty</li>
                            <li><strong>5</strong> - Able to read independently with ease</li>
                        </ul>
                        <input 
                            type="number" 
                            name="readProficiency" 
                            min="1" 
                            max="5"
                            value={formData.readProficiency}
                            onChange={handleUserInput}
                            className="login-input"
                            placeholder="0"
                            required
                        />
                        </div>
                        <div className="lang-space">
                            <h2 className= "language-checkboxes">Section 4:  Contact and Consent</h2>
                            <strong>Please read the following section carefully before checking any boxes.</strong>
                        {/* Communication Preferences */}
                        <p>If you are interested in contributing in a larger capacity, let us know how we can reach out to you! (Optional)</p>
                        <div className="diaspora-options">
                            <div>
                                <input 
                                    type="checkbox" 
                                    id="comm-email" 
                                    checked={formData.communicationMode.email} 
                                    onChange={() => handleCommunicationModeChange("email")}
                                />
                                <label htmlFor="comm-email">Email</label>
                            </div>
                            <div>
                                <input 
                                    type="checkbox" 
                                    id="comm-phone" 
                                    checked={formData.communicationMode.phone} 
                                    onChange={() => handleCommunicationModeChange("phone")}
                                />
                                <label htmlFor="comm-phone">Phone Number</label>
                            </div>
                        </div>
                        </div>

                        {/* Email Input */}
                        {formData.communicationMode.email && (
                            <div>
                                <p>Please enter your email address:</p>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email}
                                    onChange={handleUserInput}
                                    className="login-input"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                        )}

                        {/* Phone Number Input */}
                        {formData.communicationMode.phone && (
                            <div>
                                <p>Please enter your phone number:</p>
                                <input 
                                    type="tel" 
                                    name="phoneNumber" 
                                    value={formData.phoneNumber}
                                    onChange={handleUserInput}
                                    className="login-input"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        )}
                        <p>
                            I understand that any entries I submit to the Mankon dictionary project may be published alongside identifying information 
                            I provide—including my name, generation (e.g., age group or cohort), diaspora status, and general location. By checking the box below, 
                            I voluntarily give permission for this information to be displayed with my submissions on the Mankon Dictionary website. I acknowledge 
                            that it may be visible to other users and researchers, and confirm that I have the authority to grant this consent.
                            </p>
                        <div className="diaspora-options">
                            <input 
                                type="checkbox" 
                                id="consent-checkbox" 
                                checked={formData.consentReceived} 
                                onChange={handleConsentChange}
                            />
                            <label>I consent</label>
                        </div>
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
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                        </div>
                    </form>

                </div>
            </div>
    );
}