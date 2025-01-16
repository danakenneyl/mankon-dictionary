import { useParams } from "react-router-dom";
import "./entryItems.css"
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { MankonWordInfo} from '../headerItems/Search';

interface EntryProps {
    data: MankonWordInfo[];
}

function Entry({data}:EntryProps) {
    const { id } = useParams<{ id: string }>();
    const value = data.find((item) => item.mankon === id || item.english === id);
    if (!value) {
        return <div>Word not found</div>;
    }
    
    return <center>
                <div className="content"> 
                    <div className="entry__word" id="wordEntry">
                    {/* <!-- Word will be inserted here --> */}
                        <strong>{value.mankon}</strong>
                        <span className="entry__pos" id="posEntry">{value.pos}</span>
                        <VolumeUpIcon className="pronunciation"/>
                    </div>
                    <p id="translationEntry" className="translationEntry">{value.english}</p>
                    <p id="definitionEntry" className="definitionEntry"> {value.definition}</p>
                    <div className="card">
                    
                        <div className="card-header">
                                Sentence Examples
                        </div>
                        <div className="card-body">
                            <ul className="list-group"> 
                            {value.sentencesMankon.map((example, index) => {
                                return (
                                    <li className="list-group-item" key={index}>
                                        <strong>{example}</strong>
                                        <VolumeUpIcon className="pronunciation" />
                                        <div className="emphasized-text">
                                            <em>{value.sentencesEnglish[index]}</em> 
                                        </div>
                                    </li>
                                );
                            })}
                            </ul>
                        </div>
                        
                    </div>   
                </div>
            </center>
}

export default Entry