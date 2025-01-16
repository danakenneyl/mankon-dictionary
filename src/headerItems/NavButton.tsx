import "./headerItems.css";
import { useNavigate } from "react-router-dom";

interface ButtonProps {
    pageName: string;
    to: string;
}

function NavButton({pageName, to}: ButtonProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(to);
    };
    
    return <button className="nav-button" onClick={handleClick}>{pageName}</button>;
}

export default NavButton