import Button from "./Button"
import Emblem from "./Emblem"
import Search from "./Search"
import Title from "./Title"
import { SearchResult, SearchError } from './Search';
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const handleSearch = (result: SearchResult | SearchError) => {
    if ('error' in result) {
      console.error(result.error);
      return;
    }
    navigate("/entry");
    // Now TypeScript knows all the properties available in result
    console.log(result.englishWord);    // The English word searched
    console.log(result.mankonWord);     // The Mankon translation
    console.log(result.definition);     // The Mankon definition
    console.log(result.wordAudioFiles); // Array of audio files
    // etc.
  };
    return <div className = "header">
                <Emblem to="/mankon-dictionary/" />
                <Title/>
                <Search onSearch={handleSearch} />
                <div className="nav-buttons">
                  <Button pageName="About" to="/mankon-dictionary/about" />
                  <Button pageName="Browse Dictionary" to="/mankon-dictionary/browse-dictionary" />
                  <Button pageName="Language Help" to="/mankon-dictionary/language-help" />
              </div>
            </div>
}

export default Header