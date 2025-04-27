'use client';
import "@/styles/home.css";
import "@/styles/contribute.css";
import Link from 'next/link';

export default function Contribute() {
  return (
    <div className="content-wrapper">
      <div className="content-home">
        <section className="homepage-intro">
          <h1 className="intro-text">Propose a New Entry</h1>
          
          <div className="intro-decoration">
            <div className="decoration-line"></div>
            <div className="decoration-symbol"></div>
            <div className="decoration-line"></div>
          </div>
          
          <div className="contribution-content">
            <h2>Anonymous Demographic Form</h2>
            <p>
              The Mankon Dictionary collects information related to our contributor&#39;s experience with 
              Mankon speaking, reading, and writing to support the documentation of the Mankon literacy 
              rates of our contributors. Your participation in this project does not require an ability 
              to read or write in Mankon. Only your speaking abilities will be considered during the 
              Dictionary&#39;s entry approval process.
            </p>
            <p> 
              At the beginning of this first form, you will choose a username, which you should store 
              in your own records. Your username will be required whenever you propose a new entry and will 
              be used to anonymize your contributions to ensure your privacy. Please be aware that this project is 
              open source, meaning that anonymized data, including submitted entries, will be publicly accessible. 
              By participating, you acknowledge and consent to the collection and public sharing of your anonymized 
              answers.
            </p>
            <p className="alert-text">WAIT: If you already have a username, then you DO NOT need to fill out this form again.</p>
            <div className="button-container">
              <Link href="/contribute/demographic-form">
                <button className="primary-button">Demographic Form</button>
              </Link>
            </div>

            <h2>Dictionary Entry Proposal Form</h2>
            <h3>The Entry</h3>
            <p>
              For each entry proposal the Mankon Dictionary asks that you include the word you would 
              like to see represented in this dictionary, its English translation, a recording of its pronunciation,
              and two sentence recordings that caputure the word in context. Writing sentences is optional, although 
              it is prefered.
            </p> 
            <h3>Sentence Examples</h3>
            <p>
              Please take some time before beginning your proposal to compose two sentences that capture your Mankon 
              word in context. The Mankon Dictionary is interested in capturing a diversity of sentence examples to 
              ensure that we can represent Mankon as it lives and breathes. Consider including the word in the middle
              or at the end of a sentence. When choosing a context, consider including the word in a 
              statement, in a question, in a direct order, or in a hypothetical situation. Consider representing the word in 
              several forms. For example, if you wish to propose a verb, consider including the word in a different tense 
              (past, present, future, etc). Most importantly, please ensure that your sentences reflect common contexts
              in which the word appears in Mankon conversations. 
            </p>
            <h3>Recordings</h3>
            <p>
              When creating recordings, keep in mind that natural speech and careful speech often differ. A sentence 
              pronounced slowly and carefully can be valuable in language revitalization efforts, however the Mankon dictionary 
              is currently primarily concerned with representing the Mankon Language as it is spoken in natural conversation.
              As such, the Mankon Dictionary asks that you utilize a natural tone and pace with little concern for precise 
              pronunciation when you are recording. Feel free to clear a recording if you are disatisfied and reattempt 
              until you are satisfied.
            </p>
            <h3>Public Use of Data</h3>
            <p>
              As part of the Mankon Dictionary project, we collect audio recordings from contributors to document 
              and preserve the Mankon language. By submitting a recording, you acknowledge and consent to your voice 
              being publicly available as part of this open-source project. While your audio recordings will be accessible 
              to the public, no identifying information will be associated with them. Your contributions will remain 
              anonymous, and no personal details will be linked to your recordings. If future versions of this project 
              seek to publish identifying information alongside recordings, the Mankon Dictionary will contact its contributors
              to obtain additional consent.
            </p>
            <h3>What if I cannot type in Mankon?</h3>
            <p>
              That is completely fine! If you are comfortable typing in any language, 
              the Mankon Dictionary is happy to accept proposals in any writing system. 
              If you are not comfortable typing at all, that is OK too!
              Head over to the word requests page and click on any word that interests you.
              You will be able to propose a new entry without any typing at all.
            </p>

            <p className="alert-text">WAIT: Do you remember your username? You&#39;ll need your username to complete your proposal.</p>
            <div className="button-container">
              <Link href="/contribute/entry-proposal-form/0">
                <button className="primary-button">Entry Proposal Form</button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}