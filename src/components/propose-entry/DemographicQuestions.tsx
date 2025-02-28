'use client';
import {useState} from 'react';
import { useRouter } from 'next/navigation';

export default function DemographicQuestions(){
    // For navigation after submission
    const router = useRouter();
    // Demographic info inputs
    const [formData, setFormData] = useState({
        age: 1,
        location: [],
        languagesSpoken: [],
        currentLanguages: [],
        childhoodLanguages: [],
        readingProficiency: 1,
        writingProficiency: 1,
        id: 1
    })

    // Handle text and number inputs (no need to reformat)
    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
        ...prevData,
        [name]: value
        }));
    };

    // Handle language inputs (convert comma-separated strings to arrays)
    const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Split by comma and trim whitespace from each item
        const languageArray = value.split(',').map(lang => lang.trim()).filter(lang => lang !== '');
        
        setFormData(prevData => ({
          ...prevData,
          [name]: languageArray
        }));
      };

    // Handle form submission
    const handleSubmit = (e : any) => {
        e.preventDefault();
        
        // Log the collected data (for testing)
        console.log('Form Data:', formData);
        
        // Here's the data in JSON format ready to be appended
        const jsonData = JSON.stringify(formData, null, 2);
        console.log('JSON Data ready for appending:', jsonData);

        // Return user to Contribute page
        router.push('/contribute');

        };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Entry Proposal</h2>
      <div>
        <h4>Demographic Information</h4>
        
        <div>
          <p>How old are you? </p>
          <input 
            type="text" 
            name="age" 
            value={formData.age} 
            onChange={handleChange}
          />
        </div>
        
        <div>
          <p>Where do you currently live? (Ex: Bamenda, Cameroon) </p>
          <input 
            type="text" 
            name="location" 
            value={formData.location} 
            onChange={handleChange}
          />
        </div>
        
        <div>
          <p>What language(s) do you speak? (Ex: English,Mankon) </p>
          <input 
            type="text" 
            name="languagesSpoken" 
            value={formData.languagesSpoken.join(', ')} 
            onChange={handleLanguageChange}
            placeholder="Enter languages separated by commas"
          />
        </div>
        
        <div>
          <p>What language(s) do you currently speak most often? </p>
          <input 
            type="text" 
            name="currentLanguages" 
            value={formData.currentLanguages.join(', ')} 
            onChange={handleLanguageChange}
            placeholder="Enter languages separated by commas"
          />
        </div>
        
        <div>
          <p>What language(s) did/do you speak with your parents growing up? </p>
          <input 
            type="text" 
            name="childhoodLanguages" 
            value={formData.childhoodLanguages.join(', ')} 
            onChange={handleLanguageChange}
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
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
}