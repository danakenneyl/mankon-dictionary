import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Dropdown from 'react-bootstrap/Dropdown';

interface BrowseMenuProps {
  onItemClick: () => void;  // Prop to close the menu when an item is clicked
}

function BrowseMenu({ onItemClick }: BrowseMenuProps) {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  // Drop down menu disappears and user is directed to new webpage
  const handleNavigate = (word: string) => {
    setShow(false); 
    onItemClick();  // Close the menu
    navigate(`/mankon-dictionary/browse/${word}`);
  };

  return (
    <Dropdown
      onMouseEnter={() => setShow(true)} 
      onMouseLeave={() => setShow(false)} 
      show={show}
    >
      <Dropdown.Toggle className="browse arrow" id="dropdown-basic">
        Browse Dictionary
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => handleNavigate("browse-english")}>
          Browse in English
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={() => handleNavigate("browse-mankon")}>
          Browse in Mankon
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default BrowseMenu;
