import { Link } from 'react-router-dom';
function Browse() {
    return <center>
                <div className="content"> 
                    <ul className="list-group">
                        <li className="list-group-item">A</li>
                        <li className="list-group-item">
                            B
                            <div className="list-group">
                                <Link to="/mankon-dictionary/entry" className="list-group-item list-group-item-action">
                                    <div>
                                        <h5 className="mb-1">bɨŋə v.</h5>
                                    </div>
                                    <p className="mb-1">dance</p>
                                    {/* <small>And some small print.</small> */}
                                </Link>
                            </div>
                        </li>
                        <li className="list-group-item">Tʃ</li>
                        <li className="list-group-item">Ɣ</li>
                        <li className="list-group-item">Ɨ</li>
                    </ul>
                </div>
            </center>
}

export default Browse