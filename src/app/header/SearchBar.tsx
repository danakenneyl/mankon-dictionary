'use client'; // Need this since we're using state and browser APIs

import { BaseEntry } from "@/types/Datatypes";
import { SearchParams } from "@/types/Datatypes";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ToggleLang from "./ToggleLang";
import { useSearch } from '@/utils/SearchContext';

export default function SearchBar( data: SearchParams) {
  const dictionary = data.data;
  const router = useRouter();
  const [filteredData, setFilteredData] = useState<BaseEntry[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1); 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { searchEng, setSearchEng } = useSearch();
  const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchWord = event.target.value.toLowerCase();
    setInputValue(searchWord);                         
    if (!searchWord) {
      clearData();
    } else {
      const newFilter = dictionary.filter((value) =>
        searchEng
          ? value.englishWord.some((engWord) => engWord.toLowerCase().startsWith(searchWord))
          : value.mankonWord.toLowerCase().startsWith(searchWord)
      );
      setFilteredData(newFilter);
      setSelectedIndex(-1);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (inputValue === "") return;
  
    if (event.key === "Enter") {
      const match = searchEng
        ? filteredData.find((value) => value.englishWord.some((engWord) => engWord.toLowerCase() === inputValue))
        : filteredData.find((value) => value.mankonWord.toLowerCase() === inputValue);
      if (match && (match.englishWord.length === 1)) {
        handleNavigateToEntry(searchEng ? match.englishWord[0] : match.mankonWord);
      } else {
        handleNotFound();
      }
    } else if (event.key === "ArrowDown" && selectedIndex < filteredData.length - 1) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      setInputValue(searchEng ? filteredData[newIndex].englishWord[0] : filteredData[newIndex].mankonWord);
    } else if (event.key === "ArrowUp" && selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      setInputValue(searchEng ? filteredData[newIndex].englishWord[0] : filteredData[newIndex].mankonWord);
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
    router.push("/not-found");
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
              onClick={() => handleNavigateToEntry(value.mankonWord)}
            >
              {searchEng
                ? <p>{value.englishWord.join(", ")}</p>
                : <p>{value.mankonWord}</p>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
}