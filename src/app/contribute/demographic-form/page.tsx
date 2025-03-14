'use client';
import {useState, useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { db } from "@/utils/firebase";
import { ref, get, set, push } from "firebase/database";
import { v4 as uuidv4 } from 'uuid';

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

interface formData {
  username: string;
  age: string;
  location: string;
  diaspora: boolean;
  spokenLanguages: string;
  currentLanguages: string;
  childhoodLanguages: string;
  yearsSpeaking: number;
  learnSpeechModality: string;
  speakingProficiency: string;
  writingProficiency: string;
  readingProficiency: string;
}

export default function DemographicQuestions(){
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const router = useRouter();

  // Demographic info inputs
  const [formData, setFormData] = useState<formData>({
    username: "",
    age: "",
    location: "",
    diaspora: false,
    spokenLanguages: "",
    currentLanguages: "",
    childhoodLanguages: "",
    yearsSpeaking: 0,
    learnSpeechModality: "",
    speakingProficiency: "",
    writingProficiency: "",
    readingProficiency: "",
  });

  // Handle text and number inputs (no need to reformat)
  const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Verify Username
  const checkUsernameExists = async (username: string) => {
    const contributorsRef = ref(db, 'contributors');
    const snapshot = await get(contributorsRef);
    
    if (snapshot.exists()) {
      const contributors = snapshot.val() as { [key: string]: Contributor }; 
      return Object.values(contributors).some(
        (contributor) => contributor.username === username
      );
    }
    return false;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Validate username
      const usernameExists = await checkUsernameExists(formData.username);
      if (usernameExists) {
        throw new Error("Username already exists. Please choose a different username.");
      }

      // Generate UUID for contributor
      const contributorUUID = uuidv4();
      const timestamp = new Date().toISOString();
      
      // Create contributor object
      const contributor: Contributor = {
        contribution: [],
        createdAt: timestamp,
        lastModifiedAt: timestamp,
        password: "treesarepretty811481", // Using default password as in example
        username: formData.username
      };
      
      // Create demographic object
      const demographic: DemographicAnswers = {
        UUID: contributorUUID,
        age: formData.age,
        location: formData.location,
        diaspora: formData.diaspora,
        spokenLanguage: formData.spokenLanguages,
        currentLanguage: formData.currentLanguages,
        childhoodLanguage: formData.childhoodLanguages,
        yearsSpeaking: formData.yearsSpeaking,
        learnSpeechModality: formData.learnSpeechModality || "second-language",
        speechProficiency: formData.speakingProficiency,
        writeProficiency: formData.writingProficiency,
        readProficiency: formData.readingProficiency,
        createdAt: timestamp,
        lastModifiedAt: timestamp
      };
      
      // Store in Firebase
      // 1. Store contributor with UUID
      const contributorRef = ref(db, `contributors/${contributorUUID}`);
      await set(contributorRef, contributor);
      
      // 2. Store demographic data
      const demographicListRef = ref(db, 'demographics');
      const newDemographicRef = push(demographicListRef); // This generates a unique key by Firebase
      await set(newDemographicRef, demographic);
      
      // Redirect to success page or next step
      router.push('/contribute');
      
    } catch (error: unknown) {
      setSubmitError("An error occurred during submission.");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Any initialization logic can go here
  }, []);

  return (
    <div className="flex justify-center">
      <div className="content-wrapper">
        <div className="content">
          <form onSubmit={handleSubmit}>
            <h2>Demographic Information</h2>
            <div>
              <p>Choose a username </p>
              <input 
                type="text" 
                name="username" 
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                required
              />
            </div>
            <div>
              <p>How old are you? </p>
              <input 
                type="text" 
                name="age" 
                value={formData.age}
                onChange={handleChange}
                placeholder="age"
                required
              />
            </div>
            
            <div>
              <p>Where do you currently live?</p> 
              <p>Include State/Province/Region and Country seperated by a comma</p>
              <p>Ex: Minnesota, USA</p>
              <input 
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <p>Do you identify as a part of the Mankon diaspora? yes/no</p> 
              <input 
                type="checkbox" 
                name="diaspora" 
                checked={formData.diaspora} 
                onChange={handleChange}
              />
            </div>
            
            <div>
              <p>What language(s) do you speak?</p>
              <p>If you speak multiple languages, seperate them with commas but no spaces</p>
              <p>Ex: English,Mankon</p>
              <input 
                type="text" 
                name="spokenLanguages" 
                value={formData.spokenLanguages} 
                onChange={handleChange}
                placeholder="Enter languages separated by commas"
                required
              />
            </div>
            
            <div>
              <p>What language(s) do you currently speak most often?</p>
              <p>If you speak multiple languages, seperate them with commas but no spaces</p>
              <p>Ex: English,Mankon</p>
              <input 
                type="text" 
                name="currentLanguages" 
                value={formData.currentLanguages} 
                onChange={handleChange}
                placeholder="Enter languages separated by commas"
                required
              />
            </div>
            
            <div>
              <p>What language(s) did you speak with your parents growing up? </p>
              <p>If you spoke multiple languages, seperate them with commas but no spaces</p>
              <p>Ex: Pidgin,Mankon</p>
              <input 
                type="text" 
                name="childhoodLanguages" 
                value={formData.childhoodLanguages} 
                onChange={handleChange}
                placeholder="Enter languages separated by commas"
                required
              />
            </div>

            <div>
              <p>How long have you spoken Mankon? </p>
              <input 
                type="number" 
                name="yearsSpeaking" 
                value={formData.yearsSpeaking} 
                onChange={handleChange}
                placeholder="Years"
                required
              />
            </div>

            <div>
              <p>How did you learn Mankon? </p>
              <input 
                type="text" 
                name="learnSpeechModality" 
                value={formData.learnSpeechModality} 
                onChange={handleChange}
                placeholder="Enter languages separated by commas"
                required
              />
            </div>

            <div>
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
                name="speakingProficiency" 
                min="1" 
                max="5"
                value={formData.speakingProficiency}
                onChange={handleChange}
                required
              />
            </div>

            <div>
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
                name="writingProficiency"
                min="1" 
                max="5"
                value={formData.writingProficiency}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
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
                name="readingProficiency" 
                min="1" 
                max="5"
                value={formData.readingProficiency}
                onChange={handleChange}
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