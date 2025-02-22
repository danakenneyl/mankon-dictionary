'use client'; // Add this since we're using state

import { useState } from 'react';
import Link from 'next/link';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import SearchBar from './SearchBar';
import NavButton from './NavButton';
import BrowseMenu from './BrowseMenu';
import { SearchParams } from '@/types/Datatypes';

export default function Header({data, searchEng, setSearchEng}: SearchParams) {
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  const handleToggle = () => setIsOffcanvasOpen(!isOffcanvasOpen);
  const closeOffcanvas = () => setIsOffcanvasOpen(false);

  return (
    <Navbar expand="xxl" className="navbar" data-bs-theme="dark">
      <Navbar.Brand className="brand-container">
        <Link className="toHome" href="/">
          <img
            alt=""
            src="/images/MACUDA.jpg" // Move to public directory
            className="logo"
          />
        </Link>
        <div className="title">
          <div className="title-line1">The Mankon</div>
          <div className="title-line2">Dictionary</div>
        </div>
      </Navbar.Brand>
      <SearchBar data={data} searchEng={searchEng} setSearchEng={setSearchEng}/>
      <Navbar.Toggle aria-controls="navbarScroll" onClick={handleToggle} />
      <Navbar.Offcanvas
        id="offcanvasNavbar-expand-md"
        aria-labelledby="offcanvasNavbarLabel-expand-xxl"
        placement="end"
        className="navbar-nav"
        show={isOffcanvasOpen}
        onHide={() => setIsOffcanvasOpen(false)}
      >
        <Offcanvas.Header closeButton>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="justify-content-end flex-grow-1 pe-3 nav">
            <NavButton onClick={closeOffcanvas} pageName="About" href="/about" />
            <BrowseMenu onItemClick={closeOffcanvas}/>
            <NavButton onClick={closeOffcanvas} pageName="Language Help" href="/language-help" />
            <NavButton onClick={closeOffcanvas} pageName="Contribute" href="/contribute" />
          </Nav>
        </Offcanvas.Body>
      </Navbar.Offcanvas>
    </Navbar>
  );
}