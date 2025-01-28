import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import { MankonWordInfo } from "./Datatypes";
import { useState } from "react";
import './App.css'
import About from "./about/About";
import Alphabet from "./alphabet/Alphabet"
import Browse from "./browse/Browse";
import Entry from "./entry/Entry";
import Header from "./header/Header"
import HomePage from "./home/HomePage"
import NotFound from "./notFound/NotFound";
import dictionary from './assets/dictionary.json';
import Contribute from "./contribute/Contribute";

function App() {
  const dict:MankonWordInfo[] = dictionary; 
  const [searchEng, setSearchEng] = useState(true);
  return (
    <>
    <Router>
      <Header data = {dict} searchEng = {searchEng} setSearchEng={setSearchEng}/>
      {/* <Header data = {dict} searchEng={searchEng} setSearchEng={setSearchEng}/> */}
      <Routes>
        <Route path="/mankon-dictionary" element={<HomePage />} />
        <Route path="/mankon-dictionary/about" element={<About />} />
        <Route path="/mankon-dictionary/browse/:id" element={<Browse data={dict} />} />
        <Route path="/mankon-dictionary/language-help" element={<Alphabet />} />
        <Route path="/mankon-dictionary/entry/:id" element={<Entry data={dict} />} />
        <Route path="/mankon-dictionary/page-does-not-exist" element={<NotFound />} />
        <Route path="/mankon-dictionary/contribute" element={<Contribute />} />
      </Routes>
    </Router>
    </>
  )
}

export default App

