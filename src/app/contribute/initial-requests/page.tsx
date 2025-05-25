'use client';
import InitialProposals  from "../initialProposals"
import "@/styles/contribute.css";

export default function Contribute() {

  return (
    <div className="flex justify-center">
      <div className="content-wrapper">
        <div className="content">
            <InitialProposals/>
         </div>     
      </div>
    </div>
  )
}