import { useNavigate } from "react-router-dom";
import "./headerItems.css";

interface EmblemParam {
  to: string;
}

function Emblem({to}:EmblemParam) {
  const navigate = useNavigate();
  // Directs user to home page
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
