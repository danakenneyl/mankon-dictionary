import ToggleLang from "@/app/header/ToggleLang"
import NavButton from "@/app/header/NavButton"
import Link from "next/link"
import Image from "next/image"

export default function Guide() {
    return (
      <div className="flex justify-center">
        <div className="content-wrapper">
          <div className="content">
            
            <section className="max-w-3xl mx-auto p-6">
            <h1 className="text-4xl font-bold mb-6 text-center">Website Guide</h1>
            <div className="intro-decoration">
            <div className="decoration-line"></div>
            <div className="decoration-symbol"></div>
            <div className="decoration-line"></div>
            </div>

            <p className="mb-4 text-center">
             Here’s a quick guide to help you navigate the Mankon Dictionary.
            </p>

            <h2 className="text-2xl font-semibold mb-3">Navigation Basics</h2>
            <ul className="list-disc list-inside mb-6">
                <li><strong>Homepage:</strong> Click the Mankon Dictionary logo at any time to return to the homepage.</li>
                <Link className="toHome" href="/">
                    <Image
                    src="/images/logo.jpg"
                    alt=""
                    className="logo"
                    width={500}  // Replace with your actual desired width
                    height={300} // Replace with your actual desired height
                    />
                    </Link>
                <li><strong>Search Bar:</strong> Use the button in the search bar to switch between Mankon or English. Just press the button to select your preferred language for searching.</li>
                <div className="search-lang">
                    <ToggleLang/>
                </div>
            </ul>

            <h2 className="text-2xl font-semibold mb-3">Browsing the Dictionary</h2>
            <ul className="list-disc list-inside mb-6">
                <li><strong>Browse in Mankon:</strong> View the full dictionary organized according to Mankon alphabetical order.</li>
                <NavButton pageName="Browse in Mankon" href="/browse/browse-mankon" ></NavButton>
                <li><strong>Browse in English:</strong> View the full dictionary organized according to English alphabetical order.</li>
                <NavButton pageName="Browse in English" href="/browse/browse-english" ></NavButton>
                <li><strong>Browse Names:</strong> Peruse Mankon names, historical figures, and culturally significant place names.</li>
                <NavButton pageName="Browse Names" href="/browse/browse-english" ></NavButton>
            </ul>

            <h2 className="text-2xl font-semibold mb-3">Language Help</h2>
            <ul className="list-disc list-inside mb-6">
                <li><strong>Writing in Mankon:</strong> Learn about the two Mankon writing system currently in use.</li>
                <NavButton pageName="Write in Mankon" href="/language-help/writing-system"></NavButton>
                <li><strong>Typing in Mankon:</strong> Install a Mankon Alphabet compatible keyboard and find tips for typing Mankon.</li>
                <NavButton pageName="Type in Mankon" href="/language-help/typing"></NavButton>
            </ul>

            <h2 className="text-2xl font-semibold mb-3">Contributing to the Dictionary</h2>
            <ul className="list-disc list-inside mb-6">
                <li><strong>Propose a Word:</strong> Submit a new Mankon word along with its English translation, two sample sentences, and recordings of your contributions.</li>
                <NavButton pageName="Propose Word" href="/contribute/propose-dictionary-entry"></NavButton>
                <li><strong>Word Requests:</strong> Help by recording words and sentences from a list of suggested entries. Perfect for contributors who cannot type or prefer to start from a ready-made list!</li>
                <NavButton pageName="Word Requests" href="/contribute/mankon-word-requests"></NavButton>
            </ul>

            <p className="mt-6 conclusion">
                Every contribution strengthens our dictionary and helps share the beauty of the Mankon language with the world. Thank you for being part of this important project!
            </p>
            </section>

          </div>
        </div>
      </div>
    )
  }
