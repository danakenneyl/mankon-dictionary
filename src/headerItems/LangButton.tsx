interface LangButtonProps {
    searchEng:boolean;
    setSearchEng: React.Dispatch<React.SetStateAction<boolean>>; // State setter function passed from parent
}

function LangButton({ searchEng, setSearchEng }: LangButtonProps) {
    const toggleLang = () => {
        const newSearchEng = !searchEng;
        setSearchEng(newSearchEng); // Update parent state
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

