'use client';
import {useState, useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { DemographicFormData } from '@/components/types/Datatypes';


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
  // const [data, setData] = useState<DriveFilesResponse | null>(null);
  // const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);
  const [uniqueId, setUniqueId] = useState<number | null>(null);

  // For navigation after submission
  const router = useRouter();
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

  const fetchDriveFile = async (): Promise<number | undefined> => {
    try {
      // setLoading(true);
      const fileId = "1FqZL4Ttzc7Y_ENeSyJ0ik7b_aLMZSoRh";
      console.log('File ID lala:', fileId);
      const response = await fetch(`/api/get-file?fileId=${fileId}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const fileData = await response.json();
      console.log('Fetched result:', fileData);
      // Assuming the last entry in the JSON contains the "contributor" key
      const lastEntry = fileData[fileData.length - 1]; // Get the last item
      
      // Return the incremented value
      const newId = lastEntry.contributor + 1;
      console.log('New ID:', newId);
      return newId;
      
    } catch (err) {
      // setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.log('Error fetching drive files:', err);
      return undefined;
    } finally {
      // setLoading(false);
    }
  };

  // Handle text and number inputs (no need to reformat)
  const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prevData => ({
      ...prevData,
      [name]: value
      }));
  };

  const convertToFormData = (formData: RawFormData) => {
    const data : DemographicFormData = {
      age: parseInt(formData.age),
      location: formData.location.split(',').map(lang => lang.trim()).filter(lang => lang !== ''),
      languagesSpoken: formData.languagesSpoken.split(',').map(lang => lang.trim()).filter(lang => lang !== ''),
      currentLanguages: formData.currentLanguages.split(',').map(lang => lang.trim()).filter(lang => lang !== ''),
      childhoodLanguages: formData.childhoodLanguages.split(',').map(lang => lang.trim()).filter(lang => lang !== ''),
      readingProficiency: parseInt(formData.readingProficiency),
      writingProficiency: parseInt(formData.writingProficiency),
      id: parseInt(formData.id)
    }
    return data;
  }

  // Handle form submission
  const handleSubmit = (e : React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      const formReadyData = convertToFormData(formData);

      // Log the collected data (for testing)
      console.log('Form Data:', formReadyData);
      
      // Here's the data in JSON format ready to be appended
      const jsonData = JSON.stringify(formReadyData, null, 2);
      console.log('JSON Data ready for appending:', jsonData);

      // Return user to Contribute page
      router.push('/contribute');

      };

  useEffect(() => {
    const getUniqueId = async () => {
      try {
        const id = await fetchDriveFile();
        if (id) {
          setUniqueId(id);
        }
      } catch (error) {
        console.error("Error getting unique ID:", error);
        // setError(error instanceof Error ? error.message : 'Error retrieving unique ID');
      }
    };
    
    getUniqueId();
  }, []);

  return (
    <div className="flex justify-center">
    <div className="content-wrapper">
      <div className="content">
          <form onSubmit={handleSubmit}>
            <h2>Demographic Information </h2>
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
                />
              </div>
              
              <div>
                <p>Where do you currently live? (Ex: Minnesota, USA) </p>
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange}
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
                />
              </div>

            
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}