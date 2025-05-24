'use client';
import Link from "next/link";

export default function Home() {
  return (
    <div className="content-wrapper">
      <div className="content">
        <section className="homepage-intro">
          <h1 className="intro-text">Welcome to the Mankon Dictionary!</h1>
          
          <div className="intro-decoration">
            <div className="decoration-line"></div>
            <div className="decoration-symbol"></div>
            <div className="decoration-line"></div>
          </div>
          
          <div className="homepage-welcome">
            <p>This Mankon-English dictionary is built through the creativity, wisdom, and dedication of native speakers. 
               With Mankon people connecting from across the globe, technology plays a vital role in bringing our community together. 
               This project aims to leverage the digital world to enable members of global Mankon communitites to step forward 
               to lead and support the use of our beautiful language.</p>
            
            <p>Our mission is to document and preserve the Mankon language to support its study, use, and celebration within our community and beyond.
             By using this dictionary, contributing your knowledge, or simply learning a new word, you are helping to carry Mankon forward. </p>
             <strong>We are honored to welcome you here.</strong>
          </div>
          
          <div className="action-buttons">
            <Link href="/about/website-guide">
            <button className="primary-button">Start Exploring</button>
            </Link>
            <Link href="/contribute/propose-dictionary-entry">
              <button className="secondary-button">Contribute</button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}