import { MankonWordInfo } from "../Datatypes";
import { SearchParams } from "../Datatypes";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './headerItems.css';
import LangButton from "./LangButton";

function SearchBar({ data, searchEng, setSearchEng }: SearchParams) {
  const navigate = useNavigate();
  const [filteredData, setFilteredData] = useState<MankonWordInfo[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1); 

  const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchWord = event.target.value.toLowerCase();
    setInputValue(searchWord);                         
    if (!searchWord) {
      clearData();
    } else {
      const newFilter = data.filter((value) =>
        searchEng
          ? value.english.some((engWord) => engWord.toLowerCase().startsWith(searchWord)) // Check if any English word matches
          : value.mankon.toLowerCase().startsWith(searchWord)  // Filter in Mankon
      );
      setFilteredData(newFilter); // Set the filtered data
      setSelectedIndex(-1); // Reset selection
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Don't search if search bar is empty
    if (inputValue === "") return;
  
    if (event.key === "Enter") {
      const match = searchEng
        ? filteredData.find((value) => value.english.some((engWord) => engWord.toLowerCase() === inputValue)) // Check any English word matches
        : filteredData.find((value) => value.mankon.toLowerCase() === inputValue);
      if (match && (match.english.length === 1)) {
        handleNavigateToEntry(searchEng ? match.english[0] : match.mankon);
      } else {
        handleNotFound();
      }
    } else if (event.key === "ArrowDown" && selectedIndex < filteredData.length - 1) {
      // Move selection down
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      setInputValue(searchEng ? filteredData[newIndex].english[0] : filteredData[newIndex].mankon); // Update input value
    } else if (event.key === "ArrowUp" && selectedIndex > 0) {
      // Move selection up
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      setInputValue(searchEng ? filteredData[newIndex].english[0] : filteredData[newIndex].mankon); // Update input value
    }
  };
  


  // Dropbox disappears after search
  const clearData = () => {
    setFilteredData([]);
    setInputValue("");
  }
  // Successful search sends user to parameter word's entry page
  const handleNavigateToEntry = (word: string) => {
    clearData();
    navigate(`/mankon-dictionary/entry/${word}`);
  };
  // Unsuccessful search sends user to "Word Not Found" page
  const handleNotFound = () => {
    clearData();
    navigate("/mankon-dictionary/page-does-not-exist");
  }

  return (
    <div className="search">
      <div className="searchInputs">
        <input
          type="text"
          placeholder={searchEng ? "Search in English" : "Search in Mankon"}
          value={inputValue}
          onChange={handleFilter}
          onKeyDown={handleKeyDown}
        />
        <div className="searchIcon">
            <LangButton searchEng={searchEng} setSearchEng={setSearchEng} />
        </div>
    </div>
      {filteredData.length > 0 && (
        <div className="dataResult">
          {filteredData.slice(0, 5).map((value, index) => (
            <div
              key={index}
              className={`dataItem ${selectedIndex === index ? "selected" : ""}`} // Highlight the selected item
              onClick={() => handleNavigateToEntry(value.mankon)} // Navigate using mankon value
            >
              {searchEng
                ? value.english.map((engWord, idx) => (
                  <p key={idx}>{engWord}</p> // Each English word in a new <p>
                ))
                : <p>{value.mankon}</p> // Otherwise, display Mankon word
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
