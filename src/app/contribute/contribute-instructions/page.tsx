'use client';
import "@/styles/contribute.css";
import Link from 'next/link';

export default function Contribute() {
  return (
    <div className="content-wrapper">
      <div className="content">

          <h1 className="intro-text">Get Started</h1>
          
          <div className="intro-decoration">
            <div className="decoration-line"></div>
            <div className="decoration-symbol"></div>
            <div className="decoration-line"></div>
          </div>
          
          <div className="contribution-content">
            <p>To contribute to the Mankon dictionary you must have an account. Once your account is set up
              you will be able to propose new words you believe should be added to the dictionary. The Mankon dictionary would 
              love to give you credit for contributing, although it is optional if you have any privacy concerns.
              If you would like your name associated with the words that you propose, fill out the <strong>Attribution form </strong> 
              in the second section below.
            </p>
            <h2>1. Create Account</h2>
            <p className="alert-text">WAIT: If you already have an account, then you DO NOT need to fill out this form again.</p>
            <div className="button-container">
              <Link href="/contribute/account-setup">
                <button className="primary-button">Create Account</button>
              </Link>
            </div>
            <h2>2. Attribution Form (Optional)</h2>
            <p>The Mankon Dictionary hopes to give credit to all of it&apos;s contributors.
              Visible attribution formally recognizes cultural expertise and signals to community members 
              and external audiences alike that the language is represented by its rightful stewards, Mankon speakers. 
              This recognition can protect the Mankon community&apos;s relationship with academic institutions and other outsiders by 
              demonstrating clear, community-led ownership of Mankon documentation. Naming the speaker 
              protects your moral rights also, ensuring that any future use of recordings credits you appropriately 
              and respects the cultural context in which you created them.</p>
            <p>
              We also collect information related to our contributor&#39;s experience with 
              Mankon speaking, reading, and writing, as well as diaspora identification to support the documentation of the Mankon literacy 
              rates of our contributors. Your participation in this project does not require an ability 
              to read or write in Mankon. Only your speaking abilities will be considered during the 
              Dictionary&#39;s entry approval process.
            </p>
            <p className="alert-text">WAIT: You can still contribute proposals without filling out this form. You can fill this form out at anytime, but you only need to fill it out once.</p>
            <div className="button-container">
              <Link href="/contribute/demographic-form">
                <button className="primary-button">Attribution Form</button>
              </Link>
            </div>

            <h2>3. Entry Proposal Form</h2>
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
              to the public, no identifying information will be associated with them unless you give the Mankon Dictionary 
              express permission by filling out the <strong>Attribution Form </strong> above. 
            </p>
            <h3>What if I cannot type in Mankon?</h3>
            <p>
              That is completely fine! If you are comfortable typing in any language, 
              the Mankon Dictionary is happy to accept proposals in any writing system. 
              If you are not comfortable typing at all, that is OK too!
              Head over to the Propose Word page and click on any requested word that interests you.
              You will be able to propose a new entry without any typing at all.
            </p>

            <p className="alert-text">Please read ALL of the instructions above before filling out this form.</p>
            <div className="button-container">
              <Link href="/contribute/proposal-form/0">
                <button className="primary-button">Entry Proposal Form</button>
              </Link>
            </div>
          </div>
      </div>
    </div>
  );
}