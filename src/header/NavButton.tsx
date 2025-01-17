import { useNavigate } from "react-router-dom";
import "./headerItems.css";

interface NavButtonParams {
  pageName: string;
  to: string;
}

function NavButton({pageName, to}: NavButtonParams) {
  const navigate = useNavigate();
  // Directs user to new webpage 
  const handleClick = () => {
    navigate(to);
  };
  
  return <button className="nav-button" onClick={handleClick}>{pageName}</button>;
}

export default NavButton
