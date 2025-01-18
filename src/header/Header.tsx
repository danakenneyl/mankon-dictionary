import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import SearchBar from '../header/Search';
import NavButton from '../header/NavButton';
import BrowseMenu from '../header/BrowseMenu';
import { SearchParams } from '../Datatypes';
import { Link } from 'react-router-dom';

function Header({data, searchEng, setSearchEng}:SearchParams) {

return (
  <Navbar expand="xl" className="navbar">
    <Navbar.Brand className="brand-container">
      <Link className="toHome" to="/mankon-dictionary/">
        <img
          alt=""
          src="https://danakenneyl.github.io/mankon-dictionary/image/MACUDAMN.jpg"
          className="logo"
        />
      </Link>
      <div className="title">
        <div className="title-line1">Mankon People's</div>
        <div className="title-line2">Dictionary</div>
      </div>
    </Navbar.Brand>
    <SearchBar data = {data} searchEng={searchEng} setSearchEng={setSearchEng}/>
    <Navbar.Toggle aria-controls="navbarScroll" />
    <Navbar.Offcanvas
            id="offcanvasNavbar-expand-md"
            aria-labelledby="offcanvasNavbarLabel-expand-xl"
            placement="end"
            className="navbar-nav"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel-expand-xl">
                Mankon People's Dictionary
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3 nav">
                <NavButton pageName="About" to="/mankon-dictionary/about/" />
                <BrowseMenu/>
                <NavButton pageName="Language Help" to="/mankon-dictionary/language-help" />
                <NavButton pageName="Contribute" to="/mankon-dictionary/contribute" />
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
  </Navbar>
);
}

export default Header
