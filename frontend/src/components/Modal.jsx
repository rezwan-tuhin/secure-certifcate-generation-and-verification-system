import React, { useState } from 'react'
import './Modal.css';

function Modal({closeModal, eventData, contract, address, setIsGenerated}) {
    
    const [isApproved, setIsApproved] = useState();
    // const [isRequester, setIsRequster] = useState(false);

    const isRequester = () => {
        if(address.toLowerCase() === eventData.requester.toLowerCase()) {
            return true;
        }else{
            return false;
        }
    }
    const handleApprove = async (e) => {
        e.preventDefault();
            const tx = await contract.approveRequest(eventData.requestId);
            await contract.provider.waitForTransaction(tx.hash);
            // setIsGenerated(true);
            closeModal();
            alert(`Transaction Successfully Approved`);
    }
  return (
    <div className='modal'>
        <div className="modalcontainer">
            {
                isRequester() ?  <><h2>Approval Request Propagated</h2> <p>Your Request for generating new certificate is propagated.<br/> It is now waiting for approval from other admins</p></> : <><h2>New Approval Request!</h2>
            <p>Request to generate a new certificate needs your approval</p><p>{address}</p></>
            }
            <form onSubmit={handleApprove}>
                <span>Requst No </span>
                <input type='number' value={eventData.requestId} readOnly/>
                <span>Certificate Hash</span>
                <input type='text' value={eventData.courseHash} readOnly/>
                <div className={isRequester() ? 'aligncenter' : 'modalbtn'}>
                    <button className={isRequester() ?  'displaynone' : ''} type='submit'>Approve</button>
                    <button onClick={()=>{closeModal(); setIsGenerated(true)}}>Close</button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default Modal