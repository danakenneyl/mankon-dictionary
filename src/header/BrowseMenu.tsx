import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Dropdown from 'react-bootstrap/Dropdown';

function BrowseMenu() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  // Drop down menu disappears and user is directed to new webpage
  const handleNavigate = (word: string) => {
    setShow(false); 
    navigate(`/mankon-dictionary/browse/${word}`);
  };
  return (
    <Dropdown
      onMouseEnter={() => setShow(true)} 
      onMouseLeave={() => setShow(false)} 
      show={show}
    >
      <Dropdown.Toggle className = "browse arrow"  id="dropdown-basic">
        Browse Dictionary
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item  onClick={() => handleNavigate("browse-english")}>Browse in English</Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item  onClick={() => handleNavigate("browse-mankon")}>Browse in Mankon</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default BrowseMenu;
