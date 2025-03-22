import { formData } from "./page";

// Handle language checkbox changes
const handleLanguageCheckbox = (category: 'spoken' | 'current' | 'childhood', language: string, checked: boolean, setFormData: React.Dispatch<React.SetStateAction<formData>>) => {
    setFormData(prevData=> {
      // Update the specific checkbox
      const updatedCheckboxes = {
        ...prevData[`${category}LanguageCheck`],
        [language]: checked
      };
      
      // Update the form data
      const updatedData = {
        ...prevData,
        [`${category}LanguageCheckboxes`]: updatedCheckboxes
      };
      return updatedData;
    });
  };

const handleOtherLanguageChange = (e : React.ChangeEvent<HTMLInputElement>, setFormData: React.Dispatch<React.SetStateAction<formData>>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
        ...prevData,
        [name]: value
    }))
};

export default function LanguageCheckBoxes({
    category,
    formData,
    setFormData
  }: {
    category: 'spoken' | 'current' | 'childhood';
    formData: formData;
    setFormData: React.Dispatch<React.SetStateAction<formData>>;
  }) {
    return (
    <div className="language-checkboxes">
      <div>
        <input
          type="checkbox"
          id={`${category}-mankon`}
          checked={formData[`${category}LanguageCheck`].mankon}
          onChange={(e) => handleLanguageCheckbox(category, 'mankon', e.target.checked, setFormData)}
        />
        <label htmlFor={`${category}-mankon`}>Mankon</label>
      </div>
      
      <div>
        <input
          type="checkbox"
          id={`${category}-english`}
          checked={formData[`${category}LanguageCheck`].english}
          onChange={(e) => handleLanguageCheckbox(category, 'english', e.target.checked, setFormData)}
        />
        <label htmlFor={`${category}-english`}>English</label>
      </div>
      
      <div>
        <input
          type="checkbox"
          id={`${category}-french`}
          checked={formData[`${category}LanguageCheck`].french}
          onChange={(e) => handleLanguageCheckbox(category, 'french', e.target.checked, setFormData)}
        />
        <label htmlFor={`${category}-french`}>French</label>
      </div>
      
      <div>
        <input
          type="checkbox"
          id={`${category}-pidgin`}
          checked={formData[`${category}LanguageCheck`].pidgin}
          onChange={(e) => handleLanguageCheckbox(category, 'pidgin', e.target.checked, setFormData)}
        />
        <label htmlFor={`${category}-pidgin`}>Cameroon Pidgin English</label>
      </div>
      
      <div className="other-language-section">
        <label htmlFor={`${category}-other`}>Other:</label>
        <input
          type="text"
          id={`${category}-other`}
          value={formData[`${category}LanguageOther`]}
          onChange={(e) => handleOtherLanguageChange(e, setFormData)}
          placeholder="lang1,lang2"
        />
      </div>
    </div>
  );
}