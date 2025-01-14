import Header from "./headerItems/Header"
import HomePage from "./homeItems/HomePage"
import Alphabet from "./alphabetItems/Alphabet"
import Browse from "./browseItems/Browse";
import About from "./aboutItems/About";
import Entry from "./entryItems/Entry";
import './App.css'
import { BrowserRouter as Router, Route, Routes} from "react-router-dom";


function App() {
  return (
    <>
    <Router>
      <Header />
      <Routes>
        <Route path="/mankon-dictionary" element={<HomePage />} />
        <Route path="/mankon-dictionary/about" element={<About />} />
        <Route path="/mankon-dictionary/browse-dictionary" element={<Browse />} />
        <Route path="/mankon-dictionary/language-help" element={<Alphabet />} />
        <Route path="/mankon-dictionary/entry" element={<Entry />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
