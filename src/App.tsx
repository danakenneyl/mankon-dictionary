import Header from "./headerItems/Header"
import HomePage from "./homeItems/HomePage"
import Alphabet from "./alphabetItems/Alphabet"
import Browse from "./browseItems/Browse";
import About from "./aboutItems/About";
import Entry from "./entryItems/Entry";
import './App.css'
import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import dictionary from './assets/data/dictionary.json';
import { useState } from "react";
import NotFound from "./notFoundItems/NotFound";
import { MankonWordInfo } from "./Datatypes";

function App() {
  const dict:MankonWordInfo[] = dictionary; 
  const [searchEng, setSearchEng] = useState(true);
  return (
    <>
    <Router>
      <Header data = {dict} searchEng={searchEng} setSearchEng={setSearchEng}/>
      <Routes>
        <Route path="/mankon-dictionary" element={<HomePage />} />
        <Route path="/mankon-dictionary/about" element={<About />} />
        <Route path="/mankon-dictionary/browse/:id" element={<Browse data={dict}/>} />
        <Route path="/mankon-dictionary/language-help" element={<Alphabet />} />
        <Route path="/mankon-dictionary/entry/:id" element={<Entry data={dict} />} />
        <Route path="/mankon-dictionary/page-does-not-exist" element={<NotFound />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
