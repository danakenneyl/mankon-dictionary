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
    router.push(`/language-help/${word}`);
  };

  return (
    <Dropdown
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      show={show}
      className="menu"
    >
      <Dropdown.Toggle className="browse arrow" id="dropdown-basic">
        Language Help
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handleNavigate("writing-system")}>
          Write in Mankon
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={() => handleNavigate("typing")}>
          Type in Mankon
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}