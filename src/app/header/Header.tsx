'use client'; // Add this since we're using state

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import SearchBar from './SearchBar';
import AboutMenu from './AboutMenu';
import BrowseMenu from './BrowseMenu';
import { SearchParams } from '@/types/Datatypes';
import LanguageHelpMenu from './LanguageHelpMenu';
import '@/styles/header.css'
import '@/styles/navbutton.css'
import ContributeMenu from './ContributeMenu';

export default function Header(data: SearchParams) {
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const handleToggle = () => setIsOffcanvasOpen(!isOffcanvasOpen);
  const closeOffcanvas = () => setIsOffcanvasOpen(false);

  return (
    <Navbar expand="xxl" className="navbar" data-bs-theme="dark">
      <Navbar.Brand className="brand-container">
        <Link className="toHome" href="/">
        <Image
          src="/images/logo.jpg"
          alt=""
          className="logo"
          width={500}  // Replace with your actual desired width
          height={300} // Replace with your actual desired height
        />
        </Link>
        <div className="title">
          <div className="title-line1">The Mankon</div>
          <div className="title-line2">Dictionary</div>
        </div>
      </Navbar.Brand>
      <SearchBar data={data.data}/>
      <Navbar.Toggle aria-controls="navbarScroll" onClick={handleToggle} />
      <Navbar.Offcanvas
        id="offcanvasNavbar-expand-md"
        aria-labelledby="offcanvasNavbarLabel-expand-xxl"
        placement="end"
        className="navbarNav"
        show={isOffcanvasOpen}
        onHide={() => setIsOffcanvasOpen(false)}
      >
        <Offcanvas.Header closeButton />
        <Offcanvas.Body>
          <Nav className="nav">
            <AboutMenu onItemClick={closeOffcanvas}/>
            <BrowseMenu onItemClick={closeOffcanvas}/>
            <LanguageHelpMenu onItemClick={closeOffcanvas}/>
            <ContributeMenu onItemClick={closeOffcanvas}/>
          </Nav>
        </Offcanvas.Body>
      </Navbar.Offcanvas>
    </Navbar>
  );
}