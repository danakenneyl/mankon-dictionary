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

  // Only display relevant words in drop down menu as user types search word
  const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchWord = event.target.value.toLowerCase();
    setInputValue(searchWord);                         
    if (!searchWord) {
      clearData();
    } else {
      const newFilter = data.filter((value) =>
        searchEng
        // Search in English
        ? value.english.toLowerCase().startsWith(searchWord) 
        // Search in Mankon   
        : value.mankon.toLowerCase().startsWith(searchWord)     
      );
      setFilteredData(newFilter);
    }
  };
  // Initiate search when user hits enter
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Don't search if search bar is empty
    if (event.key === "Enter" && inputValue) {
      const match = searchEng
        ? filteredData.find((value) => value.english.toLowerCase() === inputValue)
        : filteredData.find((value) => value.mankon.toLowerCase() === inputValue);
      if (match) {
        handleNavigate(searchEng ? match.english : match.mankon);
      } else {
        handleNotFound();
      }
    }
};
  // Dropbox disappears after search
  const clearData = () => {
    setFilteredData([]);
    setInputValue("");
  }
  // Successful search sends user to parameter word's entry page
  const handleNavigate = (word: string) => {
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
              className="dataItem"
              onClick={() => handleNavigate(searchEng ? value.english : value.mankon)}
            >
              <p>{searchEng ? value.english : value.mankon}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
