'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

interface BrowseMenuProps {
  onItemClick: () => void;
}

export default function ContributeMenu({ onItemClick }: BrowseMenuProps) {
  const router = useRouter();
  const [show, setShow] = useState(false);

  const handleNavigate = (word: string) => {
    setShow(false);
    onItemClick();
    router.push(`/contribute/${word}`);
  };

  return (
    <Dropdown
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      show={show}
    >
      <Dropdown.Toggle className="browse arrow" id="dropdown-basic">
        Contribute
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handleNavigate("propose-dictionary-entry")}>
          Propose Word
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={() => handleNavigate("mankon-word-requests")}>
          Word Requests
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={() => handleNavigate("review-proposal")}>
          Admin Login
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}