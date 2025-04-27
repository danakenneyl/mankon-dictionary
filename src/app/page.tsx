'use client';
import "@/styles/home.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className="content-wrapper">
      <div className="content-home">
        <section className="homepage-intro">
          <h1 className="intro-text">Welcome to the Mankon Dictionary!</h1>
          
          <div className="intro-decoration">
            <div className="decoration-line"></div>
            <div className="decoration-symbol"></div>
            <div className="decoration-line"></div>
          </div>
          
          <div className="homepage-welcome">
            <p>This dictionary is built through the creativity, wisdom, and dedication of native Mankon speakers. Contributors from the Mankon diaspora have stepped forward to lead and support this work, offering their time and knowledge to help strengthen and share the language across generations.</p>
            
            <p>With Mankon speakers connecting from across the globe, technology plays a vital role in bringing our community together. This project aims to leverage this digital space to allow speakers, learners, and supporters to collaborate, celebrate, and build a shared future for the language, wherever they may live.</p>
            
            <p>Our mission is to document and preserve the Mankon language to support its study, use, and celebration within the community and beyond.
             By using this dictionary, contributing your knowledge, or simply learning a new word, you are helping to carry Mankon forward. <strong>We are honored to welcome you here.</strong></p>
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