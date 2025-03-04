'use client'; // Need this since we're using state and interactivity
import { useSearch } from '@/context/SearchContext';

export default function ToggleLang() {

  const { searchEng, setSearchEng } = useSearch();
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