import "./headerItems.css";
import { useNavigate } from "react-router-dom";

interface ButtonProps {
    pageName: string;
    to: string;
}

function Button({pageName, to}: ButtonProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(to);
    };
    
    return <button className="nav-button" onClick={handleClick}>{pageName}</button>;
}

export default Button