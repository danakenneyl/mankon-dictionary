import "./entryItems.css"
function Entry() {
    return <center>
                <div className="content"> 
                    <div className="entry__word" id="wordEntry">
                    {/* <!-- Word will be inserted here --> */}
                        <strong>bɨŋə</strong>
                        <span className="entry__pos" id="posEntry"> verb</span>
                        <img src="https://raw.githubusercontent.com/danakenneyl/MankonDictionary/main/speaker.png" alt="Speech Icon" width="30" className="word-audio-icon"/>
                    </div>
                    <p id="translationEntry" className="translationEntry">dance</p>
                    <p id="definitionEntry" className="definitionEntry"> (Definition would be in Mankon) to move one's body rhythmically usually to music</p>
                    <div className="card">
                    
                        <div className="card-header">
                                Sentence Examples
                        </div>
                        <div className="card-body">
                            <ul className="list-group">
                                <li className="list-group-item">
                                    <strong>a bɨ̂ŋ ʃìʔínɛ́</strong>
                                    <img src="https://raw.githubusercontent.com/danakenneyl/MankonDictionary/main/speaker.png" 
                                        alt="Speech Icon" 
                                        width="30" 
                                        className="word-audio-icon"
                                    />
                                    <div className="emphasized-text">
                                        <em>She dances well</em>
                                    </div>
                                </li>
                                <li className="list-group-item">
                                    <strong>a bɨ́ŋɛ́</strong>
                                    <img src="https://raw.githubusercontent.com/danakenneyl/MankonDictionary/main/speaker.png" 
                                        alt="Speech Icon" 
                                        width="30" 
                                        className="word-audio-icon"
                                    />
                                    <div className="emphasized-text">
                                        <em>She dances </em>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        
                    </div>   
                </div>
            </center>
}

export default Entry