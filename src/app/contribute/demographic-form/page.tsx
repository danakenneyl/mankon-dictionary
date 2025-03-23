'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/utils/firebase';
import { ref, get, set, push } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import LanguageCheckBoxes from "./languageCheckbox";

interface DemographicAnswers {
    UUID: string;
    age: string;
    location: string;
    diaspora: boolean;
    spokenLanguage: string;
    currentLanguage: string;
    childhoodLanguage: string;
    yearsSpeaking: number;
    learnSpeechModality: string;
    speechProficiency: string;
    writeProficiency: string;
    readProficiency: string;
    createdAt: string;
    lastModifiedAt: string;
}

interface Contributor {
    contribution: string[];
    createdAt: string;
    lastModifiedAt: string;
    password: string;
    username: string;
}
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

export interface formData {
    username: string;
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
        });

    // Required fields for fast reference
    const requiredFields: (keyof formData)[] = [
        "username",
        "age", 
        "location",
        "diaspora",
        "yearsSpeaking",
        "learnSpeechModality",
        "speechProficiency",
        "writeProficiency",
        "readProficiency",
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

    const handleDiasporaChange = (option: "yes" | "no") => {
        setFormData((prevData) => ({
          ...prevData,
          diaspora: {
            yes: option === "yes",
            no: option === "no",
          },
        }));
      };

    // Validate Language Checkbox 
    const validLanguageInput = (boxes: languageCheckboxes, other: string ) => {
        const boxChecked = Object.values(boxes).some(value => value);
        const otherFilled = other !== '';
        return boxChecked || otherFilled;

    };

    // Verify all required fields are filled and username is unique
    const validSubmission = async () => {
        if (requiredFields.every(field => !!formData[field])) {
            // Valid inputs
            const newUser = usernameStatus.valid;
            const currentLanguage = validLanguageInput(formData.currentLanguageCheck, formData.currentLanguageOther);
            const spokenLanguage = validLanguageInput(formData.spokenLanguageCheck, formData.spokenLanguageOther);
            const childhoodLanguage = validLanguageInput(formData.childhoodLanguageCheck, formData.childhoodLanguageOther);
            
            // Return true if all fields are filled and username is unique
            return newUser && currentLanguage && spokenLanguage && childhoodLanguage;
        }
        return false;
    };

    // Combine checkbox and other language input
    const buildLanguageInputString = (checkboxes: languageCheckboxes, other: string) => {
        const languages = Object.entries(checkboxes)
            .filter(([, value]) => value)
            .map(([key]) => key);
        if (other.trim() !== '') {
            const otherLanguages = other.split(',').map(lang => lang.trim());
            languages.push(...otherLanguages);
        }
        
        return languages.join(",");
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
                password: "",
                username: formData.username
            };
            const demographic: DemographicAnswers = {
                UUID: contributorUUID,
                age: formData.age,
                location: formData.location,
                diaspora: formData.diaspora.yes,
                spokenLanguage: buildLanguageInputString(formData.spokenLanguageCheck, formData.spokenLanguageOther),
                currentLanguage: buildLanguageInputString(formData.currentLanguageCheck, formData.currentLanguageOther),
                childhoodLanguage: buildLanguageInputString(formData.childhoodLanguageCheck, formData.childhoodLanguageOther),
                yearsSpeaking: formData.yearsSpeaking,
                learnSpeechModality: formData.learnSpeechModality,
                speechProficiency: formData.speechProficiency,
                writeProficiency: formData.writeProficiency,
                readProficiency: formData.readProficiency,
                createdAt: timestamp,
                lastModifiedAt: timestamp
            };

            // Update database
            // 1. new Contributor entry
            const contributorRef = ref(db, `contributors/${contributorUUID}`);
            await set(contributorRef, contributor);
            // 2. new Demographic entry
            const demographicListRef = ref(db, 'demographics');
            const newDemographicRef = push(demographicListRef); // Generate a unique Firebase key
            await set(newDemographicRef, demographic);

            // Return to contribute page
            router.push('/contribute');

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
        <div className="flex justify-center">
            <div className="content-wrapper">
                <div className="content">
                    <form onSubmit={handleSubmit}>
                        <h2>Demographic Questionnaire</h2>
                        {/* Question 1: Unique username */}
                        <div>
                            <p></p>
                            <p>Please choose your username.</p>
                            <p>Please do not include identifying information in your username</p>
                            <input 
                                type="text" 
                                name="username" 
                                value={formData.username}
                                onChange={handleUserInput}
                                placeholder="username"
                                required
                            />
                            <p>{usernameStatus.message}</p>
                        </div>
                        {/* Question 2: Age */}
                        <div>
                            <p></p>
                            <p>How old are you? </p>
                            <input 
                                type="number" 
                                name="age" 
                                value={formData.age}
                                onChange={handleUserInput}
                                placeholder="age"
                                required
                            />
                        </div>

                        {/* Question 3: Location */}
                        <div>
                            <p></p>
                            <p>Where do you currently live?</p> 
                            <p>Include State/Province/Region and Country separated by a comma</p>
                            <p>Ex: Minnesota, USA</p>
                            <input 
                                type="text" 
                                name="location" 
                                value={formData.location} 
                                onChange={handleUserInput}
                                placeholder="Bamenda, Cameroon"
                                required
                            />
                        </div>

                        {/* Question 4: Diaspora */}
                        <div>
                            <p></p>
                            <p>Do you identify as a part of the Mankon diaspora?</p> 
                            <div className="diaspora-options">
                                <div>
                                    <input 
                                        type="checkbox" 
                                        id="diaspora-yes" 
                                        checked={formData.diaspora.yes} 
                                        onChange={() => handleDiasporaChange("yes")}
                                    />
                                    <label htmlFor="diaspora-yes">Yes</label>
                                </div>
                                <div>
                                    <input 
                                        type="checkbox" 
                                        id="diaspora-no" 
                                        checked={formData.diaspora.no} 
                                        onChange={() => handleDiasporaChange("no")}
                                    />
                                    <label htmlFor="diaspora-no">No</label>
                                </div>
                            </div>
                        </div>

                        {/* Question 5: All Languages Spoken*/}
                        <div>
                            <p></p>
                            <p>What language(s) do you speak?</p> 
                            <LanguageCheckBoxes category="spoken" formData={formData} setFormData={setFormData} />
                        </div>

                        {/* Question 6: Current Languages */}
                        <div>
                            <p></p>
                            <p>What language(s) do you currently speak most often?</p> 
                            <LanguageCheckBoxes category="current" formData={formData} setFormData={setFormData} />
                        </div>

                        {/* Question 7: Childhood Languages */}
                        <div>
                            <p></p>
                            <p>What language(s) do/did you speak with your parents growing up?</p> 
                            <LanguageCheckBoxes category="childhood" formData={formData} setFormData={setFormData} />
                        </div>

                        {/* Question 8: Years Speaking */}
                        <div>
                            <p></p>
                            <p>How long have you spoken Mankon? </p>
                            <input 
                                type="number" 
                                name="yearsSpeaking" 
                                value={formData.yearsSpeaking} 
                                onChange={handleUserInput}
                                required
                            />
                        </div>

                        {/* Question 9: Speech Modality */}
                        <div>
                            <p></p>
                            <p>How did you learn Mankon? </p>
                            <input 
                                type="text" 
                                name="learnSpeechModality" 
                                value={formData.learnSpeechModality} 
                                onChange={handleUserInput}
                                placeholder=""
                                required
                            />
                        </div>

                        {/* Question 10: Speech Proficiency */}
                        <div>
                            <p></p>
                            <p>How proficient are you at speaking Mankon?</p>
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
                                required
                            />
                        </div>

                        {/* Question 11: Writing Proficiency */}
                        <div>
                            <p></p>
                            <p>How proficient are you at writing Mankon?</p>
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
                                required
                            />
                        </div>

                        {/* Question 12: Reading Proficiency */}
                        <div>
                            <p></p>
                            <p>How proficient are you at reading Mankon?</p>
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
                            className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                            >
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
