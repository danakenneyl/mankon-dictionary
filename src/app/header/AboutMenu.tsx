'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

interface BrowseMenuProps {
  onItemClick: () => void;
}

export default function LanguageHelpMenu({ onItemClick }: BrowseMenuProps) {
  const router = useRouter();
  const [show, setShow] = useState(false);

  const handleNavigate = (word: string) => {
    setShow(false);
    onItemClick();
    router.push(`/about/${word}`);
  };

  return (
    <Dropdown
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      show={show}
      className="menu"
    >
      <Dropdown.Toggle className="browse arrow" id="dropdown-basic">
        About
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handleNavigate("website-guide")}>
          Website Guide
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={() => handleNavigate("voices")}>
          Founding Voices
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}