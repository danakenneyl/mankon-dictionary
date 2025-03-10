'use client';
import { useRouter } from 'next/navigation';

export default function Contribute() {
  const router = useRouter();

  const routeTo = (url: string) => {
    router.push(url);
  }

  return (
    <div className="flex justify-center">
      <div className="content-wrapper">
        <div className="content">
        <h2>Contribute Page</h2>
          <h3>Demographic Form</h3>
          <p>
            The Mankon Dictionary collects information related to contributor&#39;s experience with 
            Mankon speaking, reading, and writing to support the documentation of Mankon literacy rates. 
            However, your participation in this project does not require an ability to read or write 
            in Mankon. Nor will your answers to the following questions be considered in the Mankon 
            Dictionary&#39;s entry approval process.
          </p>
          <p> 
            At the beginning of this demographic form, you will receive a unique ID, which you should store 
            in your own records. This ID will be required whenever you propose a new entry and will 
            be used to anonymize your contributions to ensure your privacy. Please be aware that this project is 
            open source, meaning that anonymized data, including submitted entries, will be publicly accessible. 
            By participating, you acknowledge and consent to the collection and public sharing of your anonymized 
            answers.
          </p>
          <p>Please complete this form only once.</p>
          <button onClick={() => routeTo("/contribute/demographic-form")}>Demographic Form</button>
          
          <h3>Dictionary Entry Proposal Form</h3>
          <h4>The Entry</h4>
          <p>
            For each entry proposal the Mankon Dictionary asks that you include the word you would 
            like to see represented in this dictionary, its English translation, a recording of its pronunciation,
            and two sentences that caputure the word in context. It is prefered that proposals are written using 
            the Mankon Alphabet. However, if you do not have a Mankon compatible keyboard at your disposal, feel 
            free to type in any writing system known to you.
          </p> 
          <h4>Sentence Examples</h4>
          <p>
            Please take some time before beginning your proposal to compose two sentences that capture your Mankon 
            word in context. The Mankon Dictionary is interested in capturing a diversity of sentence examples to 
            ensure that we can represent Mankon as it lives and breathes. Consider including the word in the middle
            of a sentencein and at the end. When choosing a context, consider including the word in a direct 
            statement, in a question, an order, or a hypothetical situation. Consider represent the word in several 
            forms. For example, if you wish to propose a verb, consider including the word in a different tense 
            (past, present, future, etc). Most importantly, please ensure that your sentences reflect common contexts
            in which the word appears in Mankon conversations. 
          </p>
          <h4>Recordings</h4>
          <p>
            When creating recordings, keep in mind that natural speech and careful speech often differ. A sentence 
            pronounced slowly and carefully can be valuable in language revitalization efforts, however the Mankon dictionary 
            is currently primarily concerned with representing the Mankon Language as it is spoken in natural conversation.
            As such, the Mankon Dictionary asks that you utilize a natural tone and pace with little concern for precise 
            pronunciation when you are recording. Feel free to clear a recording if you are disatisfied and reattempt 
            until you are satisfied.
          </p>
          <h4>Public Use of Data</h4>
          <p>
            As part of the Mankon Dictionary project, we collect audio recordings from contributors to document 
            and preserve the Mankon language. By submitting a recording, you acknowledge and consent to your voice 
            being publicly available as part of this open-source project. While your audio recordings will be accessible 
            to the public, no identifying information will be associated with them. Your contributions will remain 
            anonymous, and no personal details will be linked to your recordings. If future versions of this project 
            seek to publish identifying information alongside recordings, the Mankon Dictionary will contact you to 
            obtain additional consent.
          </p>

          <p>You will need your unique ID to complete your proposal.</p>
          <button onClick={() => routeTo("/contribute/entry-proposal-form")}>Entry Proposal Form</button>
         </div>
      </div>
    </div>
  )
}