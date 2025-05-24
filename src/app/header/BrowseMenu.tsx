'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

interface BrowseMenuProps {
  onItemClick: () => void;
}

export default function BrowseMenu({ onItemClick }: BrowseMenuProps) {
  const router = useRouter();
  const [show, setShow] = useState(false);

  const handleNavigate = (word: string) => {
    setShow(false);
    onItemClick();
    router.push(`/browse/${word}`);
  };

  return (
    <Dropdown
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      show={show}
      className="menu"
    >
      <Dropdown.Toggle className="browse arrow" id="dropdown-basic">
        Browse Dictionary
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handleNavigate("browse-mankon")}>
          Browse in Mankon
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={() => handleNavigate("browse-english")}>
          Browse in English
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={() => handleNavigate("browse-name")}>
          Browse Names
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}