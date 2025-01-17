import { SearchParams } from "../Datatypes"
import BrowseMenu from "./BrowseMenu"
import Emblem from "./Emblem"
import NavButton from "./NavButton"
import Search from "./Search"
import Title from "./Title"

function Header({data, searchEng, setSearchEng}:SearchParams) {
return <div className = "header">
          <Emblem to="/mankon-dictionary/" />
          <Title/>
          <Search data = {data} searchEng={searchEng} setSearchEng={setSearchEng} />
          <div className="nav-buttons">
            <NavButton pageName="About" to="/mankon-dictionary/about/" />
            <BrowseMenu/>
            <NavButton pageName="Language Help" to="/mankon-dictionary/language-help" />
          </div>
        </div>
}

export default Header
