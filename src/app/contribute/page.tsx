'use client';
import { useRouter } from 'next/navigation';

export default function Contribute() {
  const router = useRouter();

  const routeToDemog = () => {
    router.push('/contribute/demographic-form');
  }
  const routeToEntryProp = () => {
    router.push('/contribute/entry-proposal');
  }

  return (
    <div className="flex justify-center">
      <div className="content-wrapper">
        <div className="content">
        <h2>Contribute Page</h2>
          <p>Please fill out this Demographic Form to receive your unique identifying id number</p>
          <p>Please fill this form out only once.</p>
          <button onClick={routeToDemog}>Demographic Form</button>
          <p>You must have a unique id to fill out this entry proposal form</p>
          <p>Feel free to submit as many entry proposals as you would like! </p>
          <button onClick={routeToEntryProp}>Entry Proposal Form</button>
        </div>
      </div>
    </div>
  )
}