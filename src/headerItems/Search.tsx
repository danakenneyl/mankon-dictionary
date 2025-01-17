import React, { useState } from "react";
import './headerItems.css';
import LangButton from "./LangButton";
import { useNavigate } from "react-router-dom";
import { SearchParams  } from "../Datatypes";
import { MankonWordInfo } from "../Datatypes";


function SearchBar({ data, searchEng, setSearchEng }: SearchParams) {
    const navigate = useNavigate();
    const [filteredData, setFilteredData] = useState<MankonWordInfo[]>([]);
    const [inputValue, setInputValue] = useState<string>("");

    const handleFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchWord = event.target.value.toLowerCase();
        setInputValue(searchWord); // Update input value for tracking
        if (!searchWord) {
          clearData();
        } else {
            const newFilter = data.filter((value) =>
                searchEng
                    ? value.english.toLowerCase().startsWith(searchWord) // Search in English
                    : value.mankon.toLowerCase().startsWith(searchWord) // Search in Mankon
            );
            setFilteredData(newFilter);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
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
    const clearData = () => {
      setFilteredData([]);
      setInputValue("");
    }
    const handleNavigate = (word: string) => {
        clearData();
        navigate(`/mankon-dictionary/entry/${word}`);
    };
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
                    onKeyDown={handleKeyDown} // Handle Enter key press
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
