import React from 'react';
import { Link } from 'react-router-dom';

interface NavButtonParams {
  pageName: string;
  to: string;
  onClick?: () => void; // Optional onClick prop
}

const NavButton: React.FC<NavButtonParams> = ({ pageName, to, onClick }) => {
  return (
    <div>
      <Link to={to}>
        <button className="nav-button" onClick={onClick}>{pageName}</button> 
      </Link>
    </div>
  );
};

export default NavButton;

