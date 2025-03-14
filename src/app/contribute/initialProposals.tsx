'use client';
// pages/dictionary.tsx
import { useState, useEffect } from 'react';
import { db } from "@/utils/firebase";
import Link from 'next/link';
import { ref, onValue } from "firebase/database";

// TypeScript interface for a word proposal
interface WordProposal {
  mankonWord: string;
  translatedWord: string[];
  pairWord: string[];
  status: string;
  createdAt: string;
  lastUpdated: string;
  audioWord: string;
  contributorUUID: string;
  // Optional fields
  audioSentence?: string[];
  mankonSentence?: string[];
  translatedSentence?: string[];
}

// TypeScript interface for the proposals collection
interface ProposalsCollection {
  [key: string]: WordProposal;
}

export default function InitialProposals() {
  const [proposals, setProposals] = useState<ProposalsCollection>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(50);

  useEffect(() => {
    const proposalsRef = ref(db, 'proposals');
    
    // Listen for changes to the proposals in Firebase
    const unsubscribe = onValue(proposalsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as ProposalsCollection;
        setProposals(data);
      } else {
        setProposals({});
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching data:', error);
      setError('Failed to load dictionary data. Please try again later.');
      setLoading(false);
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);

  // Get all proposals as an array
  const proposalsArray = Object.entries(proposals);
  
  // Sort proposals alphabetically by Mankon word
  const sortedProposals = proposalsArray.sort(([, a], [, b]) => {
    return a.mankonWord.localeCompare(b.mankonWord);
  });

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProposals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProposals.length / itemsPerPage);

  // Function to change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Function to go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Function to go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Dictionary...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
          <div>
            <h3 className="text-3xl font-bold mb-6">Requested Words</h3>
            <p>
              The Mankon Dictionary aims to collect audio and context sentences for the below words. 
              However, the list below is incomplete. Feel free to submit entry proposals for Mankon words
              that you cannot find here.
            </p>
            {/* Pagination Controls */}
            {sortedProposals.length > 0 && (
              <div className="flex justify-center items-center mt-8">
                <button 
                  onClick={() => setCurrentPage(1)} 
                  disabled={currentPage === 1}
                  className={`mx-1 px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  &laquo;
                </button>
                <button 
                  onClick={prevPage} 
                  disabled={currentPage === 1}
                  className={`mx-1 px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  &lt;
                </button>
                
                {/* Page Numbers */}
                {[...Array(totalPages)].map((_, i) => {
                  // Show 5 page numbers at a time with current page in the middle when possible
                  const pageNum = i + 1;
                  const showPageNumbers = 5; // How many page numbers to show at once
                  const halfShow = Math.floor(showPageNumbers / 2);
                  
                  let startPage = Math.max(1, currentPage - halfShow);
                  const endPage = Math.min(totalPages, startPage + showPageNumbers - 1);
                  
                  if (endPage - startPage + 1 < showPageNumbers) {
                    startPage = Math.max(1, endPage - showPageNumbers + 1);
                  }
                  
                  if (pageNum >= startPage && pageNum <= endPage) {
                    return (
                      <button
                        key={i}
                        onClick={() => paginate(pageNum)}
                        className={`mx-1 px-3 py-1 rounded ${
                          currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
                
                <button 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages}
                  className={`mx-1 px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  &gt;
                </button>
                <button 
                  onClick={() => setCurrentPage(totalPages)} 
                  disabled={currentPage === totalPages}
                  className={`mx-1 px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  &raquo;
                </button>
              </div>
            )}
            {/* Word count with pagination info */}
            <p className="mb-4 text-gray-600">
              {sortedProposals.length} word{sortedProposals.length !== 1 ? 's' : ''} found
              {sortedProposals.length > 0 && (
                <span> (showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedProposals.length)} of {sortedProposals.length})</span>
              )}
            </p>

            {/* Dictionary Listing */}
            <div className="grid grid-cols-1 gap-4">
              <ul className="list-group">
                  <li key="A" className="list-group-item">
                    A
                    <div className="list-group">
                      {currentItems.map(([id, proposal]) => (
                        <Link 
                          key={id} 
                          href={`/contribute/entry-proposal-form/${id}`}
                          className="list-group-item list-group-item-action"
                        >
                          <div>
                            <h5 className="mb-1">{proposal.mankonWord}</h5>
                            <p className="mb-1"> {proposal.translatedWord.join(", ")}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </li>
              </ul>
            </div>
          </div>
  );
}