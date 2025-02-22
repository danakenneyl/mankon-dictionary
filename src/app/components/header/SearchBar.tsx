'use client'; // Need this since we're using state and browser APIs

import { MankonWordInfo } from "@/types/Datatypes";
import { SearchParams } from "@/types/Datatypes";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ToggleLang from "./ToggleLang";
import { useSearch } from '@/context/SearchContext';

export default function SearchBar({ data}: SearchParams) {
  const router = useRouter();
  const [filteredData, setFilteredData] = useState<MankonWordInfo[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1); 
  const { searchEng, setSearchEng } = useSearch();
  const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchWord = event.target.value.toLowerCase();
    setInputValue(searchWord);                         
    if (!searchWord) {
      clearData();
    } else {
      const newFilter = data.filter((value) =>
        searchEng
          ? value.english.some((engWord) => engWord.toLowerCase().startsWith(searchWord))
          : value.mankon.toLowerCase().startsWith(searchWord)
      );
      setFilteredData(newFilter);
      setSelectedIndex(-1);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (inputValue === "") return;
  
    if (event.key === "Enter") {
      const match = searchEng
        ? filteredData.find((value) => value.english.some((engWord) => engWord.toLowerCase() === inputValue))
        : filteredData.find((value) => value.mankon.toLowerCase() === inputValue);
      if (match && (match.english.length === 1)) {
        handleNavigateToEntry(searchEng ? match.english[0] : match.mankon);
      } else {
        handleNotFound();
      }
    } else if (event.key === "ArrowDown" && selectedIndex < filteredData.length - 1) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      setInputValue(searchEng ? filteredData[newIndex].english[0] : filteredData[newIndex].mankon);
    } else if (event.key === "ArrowUp" && selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      setInputValue(searchEng ? filteredData[newIndex].english[0] : filteredData[newIndex].mankon);
    }
  };
  
  const clearData = () => {
    setFilteredData([]);
    setInputValue("");
  }

  const handleNavigateToEntry = (word: string) => {
    clearData();
    router.push(`/entry/${word}`);
  };

  const handleNotFound = () => {
    clearData();
    router.push("/page-does-not-exist");
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
            <ToggleLang/>
        </div>
      </div>
      {filteredData.length > 0 && (
        <div className="dataResult">
          {filteredData.slice(0, 5).map((value, index) => (
            <div
              key={index}
              className={`dataItem ${selectedIndex === index ? "selected" : ""}`}
              onClick={() => handleNavigateToEntry(value.mankon)}
            >
              {searchEng
                ? <p>{value.english.join(", ")}</p>
                : <p>{value.mankon}</p>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
}