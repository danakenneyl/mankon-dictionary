import "./headerItems.css";
import { useNavigate } from "react-router-dom";

interface NavButtonParams {
    pageName: string;
    to: string;
}

function NavButton({pageName, to}: NavButtonParams) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(to);
    };
    
    return <button className="nav-button" onClick={handleClick}>{pageName}</button>;
}

export default NavButton