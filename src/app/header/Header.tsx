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
import LanguageHelpMenu from './LanguageHelpMenu';
import { db } from '@/utils/firebase';
import ContributeMenu from './ContributeMenu';

export default function Header() {
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const handleToggle = () => setIsOffcanvasOpen(!isOffcanvasOpen);
  const closeOffcanvas = () => setIsOffcanvasOpen(false);

  return (
    <Navbar expand="lg" className="navbar" data-bs-theme="dark">
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
      <SearchBar db={db}/>
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