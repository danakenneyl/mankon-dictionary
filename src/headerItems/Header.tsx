import NavButton from "./NavButton"
import Emblem from "./Emblem"
import Search from "./Search"
import Title from "./Title"
import { MankonWordInfo} from '../headerItems/Search';

export interface DataProps {
    data : MankonWordInfo[];
    searchEng: boolean;
    setSearchEng: React.Dispatch<React.SetStateAction<boolean>>;
}

function Header({data, searchEng, setSearchEng}:DataProps) {
    return <div className = "header">
                <Emblem to="/mankon-dictionary/" />
                <Title/>
                <Search data = {data} searchEng={searchEng} setSearchEng={setSearchEng} />
                <div className="nav-buttons">
                  <NavButton pageName="About" to="/mankon-dictionary/about/" />
                  <NavButton pageName="Browse Dictionary" to="/mankon-dictionary/browse-dictionary" />
                  <NavButton pageName="Language Help" to="/mankon-dictionary/language-help" />
              </div>
            </div>
}

export default Header