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
      className="menu"
    >
      <Dropdown.Toggle className="browse arrow" id="dropdown-basic">
        Contribute
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handleNavigate("contribute-instructions")}>
          Get Started
        </Dropdown.Item>

        <Dropdown.Divider />
        <Dropdown.Item onClick={() => handleNavigate("initial-requests")}>
          Propose Word
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={() => handleNavigate("db-interfaces")}>
          Admin Login
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}