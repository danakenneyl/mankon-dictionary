'use client';
import {useState, useEffect, useCallback} from 'react';
import { useRouter } from 'next/navigation';
import { DemographicData } from '@/components/types/Datatypes';

interface RawFormData {
  age: string;
  location: string;
  languagesSpoken: string;
  currentLanguages: string;
  childhoodLanguages: string;
  readingProficiency: string;
  writingProficiency: string;
  id: string;
}

export default function DemographicQuestions(){
  const [uniqueId, setUniqueId] = useState<number>(-1);
  const [fileContent, setFileContent] = useState<DemographicData[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const router = useRouter();
  
  // File ID constant
  const FILE_ID = process.env.GOOGLE_DRIVE_DEMOGRAPHIC_FILE_ID;
  
  // Demographic info inputs
  const [formData, setFormData] = useState<RawFormData>({
      age: "",
      location: "",
      languagesSpoken: "",
      currentLanguages: "",
      childhoodLanguages: "",
      readingProficiency: "",
      writingProficiency: "",
      id: ""
  });

  const fetchDriveFile = useCallback(async (): Promise<DemographicData[] | undefined> => {
    try {
      const response = await fetch(`/api/get-file?fileId=${FILE_ID}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const fileData = await response.json();
      // Assuming the last entry in the JSON contains the "contributor" key
      const lastEntry = fileData[fileData.length - 1]; // Get the last item
      const newId = lastEntry.contributor + 1;
      setUniqueId(newId);

      return fileData;
      
    } catch (err) {
      console.log('Error fetching drive files:', err);
      return undefined;
    }
  }, [FILE_ID]);

  // Handle text and number inputs (no need to reformat)
  const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prevData => ({
      ...prevData,
      [name]: value
      }));
  };

  const convertToFormData = (formData: RawFormData) => {
      const data : DemographicData = {
        age: parseInt(formData.age),
        location: formData.location.split(',').map(lang => lang.trim()).filter(lang => lang !== ''),
        languagesSpoken: formData.languagesSpoken.split(',').map(lang => lang.trim()).filter(lang => lang !== ''),
        currentLanguages: formData.currentLanguages.split(',').map(lang => lang.trim()).filter(lang => lang !== ''),
        childhoodLanguages: formData.childhoodLanguages.split(',').map(lang => lang.trim()).filter(lang => lang !== ''),
        readingProficiency: parseInt(formData.readingProficiency),
        writingProficiency: parseInt(formData.writingProficiency),
        contributor: uniqueId  // Use the uniqueId as contributor
      };
      return data;
  }

  const appendToExistingJson = (existingJson: DemographicData[], newEntry: DemographicData): DemographicData[] => {
    return [...existingJson, newEntry];
  };

  // Function to update the file on Google Drive
  const updateDriveFile = async (updatedContent: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/update-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: FILE_ID,
          content: updatedContent
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      return true;
    } catch (err) {
      console.error('Error updating file:', err);
      setSubmitError(err instanceof Error ? err.message : 'An unknown error occurred while updating the file');
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Validate form data
      if (!formData.age || !formData.location || !formData.readingProficiency || !formData.writingProficiency) {
        throw new Error("Please fill out all required fields");
      }
      
      // Make sure we have the file content
      if (!fileContent) {
        throw new Error("Could not load existing data");
      }
      
      // Convert and prepare the form data
      const formReadyData = convertToFormData(formData);
      
      // Append the new data to the existing content
      const updatedContent = appendToExistingJson(fileContent, formReadyData);
      
      // Convert the updated content to a JSON string
      const jsonString = JSON.stringify(updatedContent, null, 2);
      
      // Update the file on Google Drive
      const success = await updateDriveFile(jsonString);
      
      if (success) {
        console.log('File successfully updated on Google Drive');
        // Navigate back to contribute page on success
        router.push('/contribute');
      } else {
        throw new Error("Failed to update the file");
      }
    } catch (err) {
      console.error('Error during submission:', err);
      setSubmitError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const getFileContent = async () => {
      try {
        const file = await fetchDriveFile();
        console.log("Something should have happened");
        if (file) {
          setFileContent(file);
        }
      } catch (error) {
        console.error("Error getting file content:", error);
      }
    };
    
    getFileContent();
  }, [fetchDriveFile]);

  return (
    <div className="flex justify-center">
      <div className="content-wrapper">
        <div className="content">
          <form onSubmit={handleSubmit}>
            <h2>Demographic Information</h2>
            <div>
              <p>Here is your unique id. Remember it: {uniqueId !== null ? uniqueId : 'Loading...'}</p>
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
              <p>Where do you currently live? (Ex: Minnesota, USA) </p>
              <input 
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <p>What language(s) do you speak? (Ex: English, Mankon) </p>
              <input 
                type="text" 
                name="languagesSpoken" 
                value={formData.languagesSpoken} 
                onChange={handleChange}
                placeholder="Enter languages separated by commas"
                required
              />
            </div>
            
            <div>
              <p>What language(s) do you currently speak most often? </p>
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
              <p>What language(s) do/did you speak with your parents growing up? </p>
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