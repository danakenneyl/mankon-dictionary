interface LangParams {
  searchEng:boolean;
  setSearchEng: React.Dispatch<React.SetStateAction<boolean>>;
}

function LangButton({ searchEng, setSearchEng }: LangParams) {
  // Set search to opposite language
  const toggleLang = () => {
    const newSearchEng = !searchEng;
    // Update parent state
    setSearchEng(newSearchEng);
  };

  return (
    <button 
      className="chooseLang" 
      onClick={toggleLang} 
      style={{backgroundColor: searchEng ? "#E87200" : "#083e88"}}
    >
      {searchEng ? "ENG" : "MNK"}
    </button>
  );
}

export default LangButton;
