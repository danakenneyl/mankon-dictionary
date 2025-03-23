import { formData } from "./page";

interface LanguageCheckboxes {
  mankon: boolean;
  english: boolean;
  french: boolean;
  pidgin: boolean;
}

// Handle language checkbox changes
const handleLanguageCheckbox = (
  category: "spoken" | "current" | "childhood",
  language: keyof LanguageCheckboxes,
  checked: boolean,
  setFormData: React.Dispatch<React.SetStateAction<formData>>
) => {
  setFormData((prevData) => {
    const checkKey = `${category}LanguageCheck` as keyof formData;

    // Ensure the language check object exists
    const currentCheckboxes = prevData[checkKey] as LanguageCheckboxes || {
      mankon: false,
      english: false,
      french: false,
      pidgin: false,
    };

    return {
      ...prevData,
      [checkKey]: {
        ...currentCheckboxes,
        [language]: checked,
      },
    };
  });
};

// Handle other language input changes
const handleOtherLanguageChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  category: "spoken" | "current" | "childhood",
  setFormData: React.Dispatch<React.SetStateAction<formData>>
) => {
  const { value } = e.target;
  const otherKey = `${category}LanguageOther` as keyof formData;

  setFormData((prevData) => ({
    ...prevData,
    [otherKey]: value,
  }));
};

// Checkbox Component
export default function LanguageCheckBoxes({
  category,
  formData,
  setFormData,
}: {
  category: "spoken" | "current" | "childhood";
  formData: formData;
  setFormData: React.Dispatch<React.SetStateAction<formData>>;
}) {
  const checkKey = `${category}LanguageCheck` as keyof formData;
  const otherKey = `${category}LanguageOther` as keyof formData;

  const checks: LanguageCheckboxes = (formData[checkKey] as LanguageCheckboxes) || {
    mankon: false,
    english: false,
    french: false,
    pidgin: false,
  };

  const otherValue = (formData[otherKey] as string) || "";

  return (
    <div className="language-checkboxes">
      {(["mankon", "english", "french", "pidgin"] as (keyof LanguageCheckboxes)[]).map(
        (lang) => (
          <div key={lang}>
            <input
              type="checkbox"
              id={`${category}-${lang}`}
              checked={checks[lang]}
              onChange={(e) =>
                handleLanguageCheckbox(category, lang, e.target.checked, setFormData)
              }
            />
            <label htmlFor={`${category}-${lang}`}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </label>
          </div>
        )
      )}

      <div className="other-language-section">
        <label htmlFor={`${category}-other`}>Other:</label>
        <input
          type="text"
          id={`${category}-other`}
          name={`${category}LanguageOther`}
          value={otherValue}
          onChange={(e) => handleOtherLanguageChange(e, category, setFormData)}
          placeholder="lang1, lang2"
        />
      </div>
    </div>
  );
}
