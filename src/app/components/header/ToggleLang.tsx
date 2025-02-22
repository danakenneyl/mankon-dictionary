'use client'; // Need this since we're using state and interactivity

interface LangParams {
  searchEng: boolean;
  setSearchEng: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ToggleLang({ searchEng, setSearchEng }: LangParams) {
  const toggleLang = () => {
    const newSearchEng = !searchEng;
    setSearchEng(newSearchEng);
  };

  return (
    <button
      className="chooseLang"
      onClick={toggleLang}
      style={{ backgroundColor: searchEng ? "#E87200" : "#083e88" }}
    >
      {searchEng ? "ENG" : "MNK"}
    </button>
  );
}