import "./headerItems.css";
import { useNavigate } from "react-router-dom";

interface ButtonProps {
    to: string;
}

function Emblem({to}:ButtonProps) {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(to);
    };
    return <img 
                src="https://danakenneyl.github.io/mankon-dictionary/image/MACUDAMN.jpg"
                alt="Company Emblem" 
                className="emblem"
                onClick={handleClick}
            />
}

export default Emblem