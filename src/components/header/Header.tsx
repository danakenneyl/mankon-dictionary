'use client'; // Add this since we're using state

import { useState } from 'react';
import Link from 'next/link';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import SearchBar from './SearchBar';
import NavButton from './NavButton';
import BrowseMenu from './BrowseMenu';
import { SearchParams } from '@/components/types/Datatypes';
import styles from './header.module.css';
import { useSearch } from '@/context/SearchContext';

export default function Header({data}: SearchParams) {
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const handleToggle = () => setIsOffcanvasOpen(!isOffcanvasOpen);
  const closeOffcanvas = () => setIsOffcanvasOpen(false);

  return (
    <Navbar expand="xxl" className={styles.navbar} data-bs-theme="dark">
      <Navbar.Brand className={styles.brandContainer}>
        <Link className={styles.toHome} href="/">
          <img
            alt=""
            src="/images/MACUDA.jpg" // Move to public directory
            className={styles.logo}
          />
        </Link>
        <div className={styles.title}>
          <div className={styles.titleLine1}>The Mankon</div>
          <div className={styles.titleLine2}>Dictionary</div>
        </div>
      </Navbar.Brand>
      <SearchBar data={data}/>
      <Navbar.Toggle aria-controls="navbarScroll" onClick={handleToggle} />
      <Navbar.Offcanvas
        id="offcanvasNavbar-expand-md"
        aria-labelledby="offcanvasNavbarLabel-expand-xxl"
        placement="end"
        className={styles.navbarNav}
        show={isOffcanvasOpen}
        onHide={() => setIsOffcanvasOpen(false)}
      >
        <Offcanvas.Header closeButton />
        <Offcanvas.Body>
          <Nav className={styles.nav}>
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