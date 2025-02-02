import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import SearchBar from '../header/Search';
import NavButton from '../header/NavButton';
import BrowseMenu from '../header/BrowseMenu';
import { SearchParams } from '../Datatypes';
import { Link } from 'react-router-dom';
import { useState } from 'react';

function Header({data, searchEng, setSearchEng}:SearchParams) {
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false); // State to control Offcanvas visibility

  // Toggle Offcanvas open/close
  const handleToggle = () => setIsOffcanvasOpen(!isOffcanvasOpen);

  // Close Offcanvas when a NavButton or BrowseMenu item is clicked
  const closeOffcanvas = () => setIsOffcanvasOpen(false);
return (
  <Navbar expand="xxl" className="navbar" data-bs-theme="dark">
    <Navbar.Brand className="brand-container">
      <Link className="toHome" to="/">
        <img
          alt=""
          src="https://raw.githubusercontent.com/danakenneyl/mankon-dictionary/gh-pages/image/MACUDA.jpg"
          className="logo"
        />
      </Link>
      <div className="title">
        <div className="title-line1">The Mankon</div>
        <div className="title-line2">Dictionary</div>
      </div>
    </Navbar.Brand>
    <SearchBar data = {data} searchEng={searchEng} setSearchEng={setSearchEng}/>
    <Navbar.Toggle aria-controls="navbarScroll" onClick={handleToggle} />
    <Navbar.Offcanvas
            id="offcanvasNavbar-expand-md"
            aria-labelledby="offcanvasNavbarLabel-expand-xxl"
            placement="end"
            className="navbar-nav"
            show={isOffcanvasOpen} // Control Offcanvas visibility
        onHide={() => setIsOffcanvasOpen(false)} 
          >
            <Offcanvas.Header closeButton>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3 nav">
                <NavButton onClick={closeOffcanvas} pageName="About" to="/mankon-dictionary/about/" />
                <BrowseMenu onItemClick={closeOffcanvas}/>
                <NavButton onClick={closeOffcanvas} pageName="Language Help" to="/mankon-dictionary/language-help" />
                <NavButton onClick={closeOffcanvas} pageName="Contribute" to="/mankon-dictionary/contribute" />
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
  </Navbar>
);
}

export default Header
