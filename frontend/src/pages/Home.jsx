import React, { useEffect, useState } from 'react'
import './Home.css'
import axiosInstance from '../components/axiosconfig';
import {v4 as uuidv4} from 'uuid';
import {ethers} from "ethers";
import ABI from '../components/ABI.json';
import Modal from '../components/modal';
import Certificate from '../components/Certificate';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    const [courseId, setCoursId] = useState('');
    const [isVerify, setIsVerify] = useState(false);
    const [isgenerated, setIsGenerated] = useState(false);
    const [contract, setContract] = useState(null);
    const [connected, setConnected] = useState(false);
    const [address, setAddress] = useState();
    const [certificateData, setCertificateData] = useState({
        holderName: '',
        course: '',
        uuid: ''
    });

    const [modalOpen, setModalOpen] = useState(false);
    const [eventData, setEventData] = useState({
        requester: '',
        requestId: '',
        courseHash: ''
    });

    const [idToVerify, setIdToVerify] = useState('');
    const [verifyingData, setVerifyingData] = useState();

    // const openInNewWindow = (url) => {
    //     const newWindow = window.open(url, '_blank');
    //     if(newWindow) {
    //         window.focus();
    //     }
       
    // }

    const handleNavigate = () => {
        navigate('/certificate', { state: { courseId } });
      };

    const closeModal = () => {
        setModalOpen(false);
    }
    const getConnected = async() => {
        if(window.ethereum) {
            try{
                const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer =  provider.getSigner();
                setAddress(accounts[0]);
                const myContract = new ethers.Contract(contractAddress, ABI, signer);
                setContract(myContract);
                setConnected(true);
            }catch(error) {
                console.error(error);
            }
        }else{
            alert("Please install Metamask");
        }
    }

    const handleCertificateRegRequested = (requester, requestId, certificateHash) => {
        setEventData({
            requester: requester,
            requestId: requestId,
            courseHash: certificateHash
        });

        setModalOpen(true);

        console.log(eventData);
        console.log(`isOpenModal ${modalOpen}`);
    }
    useEffect(() => {
        getConnected();
    },[]);

    useEffect(() => {
       if(contract && address) {

        contract.on("certificateRegRequested", handleCertificateRegRequested);

        return() => {
            contract.off("certificateRegRequested", handleCertificateRegRequested);
           }
       }
       else{console.log("contract or addres not found");}
        
    },[contract, address,]);

   

    const handleSubmitCertificate =async (e) => {
        e.preventDefault();

        //generating unique certificateID
        const generateUuid = certificateData.uuid || uuidv4();
        setCoursId(generateUuid);
       try {
        const data = `${certificateData.holderName}${certificateData.course}${generateUuid}`;
        const hash = ethers.utils.sha256(ethers.utils.toUtf8Bytes(data));
        const tx = await contract.requestCertificateRegistration(hash);
        await contract.provider.waitForTransaction(tx.hash);
       }catch(error){
        console.error(error);
       }

        axiosInstance.post('/addcertificate', {...certificateData, uuid: generateUuid})
        .then((res) => {
            if(res.data[0] === 'success'){
                alert(`Certificate Generated Id is ${res.data[1]}`);
            }
        })
        .catch((error) => {
            alert(error);
        })
         setCertificateData({
                    holderName: '',
                    course: '',
                    uuid: ''
                })
    }

    // const getCertificateData = async (_certificateId) => {
    //    await axiosInstance.get('/getcertificate', {
    //         params: {
    //             id: _certificateId,
    //         }
    //     })
    //     .then((res) => {
    //         setVerifyingData(res.data);
    //     })
    //     .catch((error) => {
    //         console.error(error);
    //     })
        
    // }

    const getCertificateData = async (_certificateId) => {
        try {
            const response = await axiosInstance.get('/getcertificate', {
                params: {
                    id: _certificateId,
                }
            });
            setVerifyingData(response.data); // Update state
            return response.data;
        } catch (error) {
            console.error("Error fetching certificate data:", error);
            throw error; // Rethrow the error so it can be caught in the main function
        }
    }
    

    //cb2ef410-c9ad-42c4-a059-523c8617376e

    const verifyCertificate = async (e) => {
        e.preventDefault();
        let datafetched;
        try{
         datafetched =  await getCertificateData(idToVerify);
           
        }catch(error) {
            console.log(error);
        }
         
        if(datafetched && contract) {
            
            try {
                
                if(datafetched.length >0 ) {
                    const dataToVerify = `${datafetched[0].Name}${datafetched[0].Course}${datafetched[0].CertificateID}`;
                
                    const hashToVerify = ethers.utils.sha256(ethers.utils.toUtf8Bytes(dataToVerify));
                    
                    const tx = await contract.verifyCertificate(hashToVerify);

                    if(tx) {
                        alert(`The Certificate bearing bellow information is Authentic. Name: ${verifyingData[0].Name}, Course: ${datafetched[0].Course}, Certificate ID: ${datafetched[0].CertificateID}`)
                    }
                    else{
                        alert(`The Certificate Bearing Certificate ID: ${idToVerify} is NOT Authentic`);
                    }
                }else{
                    alert(`No Certificate in The Server`);
                }

            }catch(error) {
                console.log(error);
            }
        }
        setIdToVerify('');
    }

  return (
    <div className='container'>
        {
            (modalOpen && address) && (<Modal closeModal={closeModal} eventData={eventData} contract={contract} address={address} setIsGenerated={setIsGenerated} />)
        }
        <section className='header'>
            <h1>Secure Certificate Generation &amp; Verification System</h1>
        </section>
        <section className='mainsection'>
        <section>{connected ?<p>Account: {address}</p> : <button onClick={getConnected}>Connect</button>}</section>
            <section className="generate">
                <h2>Generate Certificate</h2>
                <p>{certificateData.uuid}</p>
                <form onSubmit={handleSubmitCertificate}>
                    <input type="text" placeholder='Certificate Holder Name' value={certificateData.holderName} onChange={(e) => setCertificateData({...certificateData, holderName: e.target.value})} /> <br/>
                    <input type='text' placeholder='Course Title' value={certificateData.course} onChange={(e) => setCertificateData({...certificateData, course: e.target.value})} /> <br/>
                    <button type='submit'>Generate Certificate</button>
                </form>
            </section>
           {
            isgenerated && (
                <section className='generate'>
                    {/* <h2>Certificate Generated</h2> */}
                    <p className='generated'>Congratulation! The Certificate is generated. Now you can<a onClick={()=>handleNavigate()}>Print Certificate</a></p>
                    {/* <button onClick={()=>openInNewWindow('/certificate')}>Print Certificate</button> */}
                </section>
            )
           }
            <section className="verify">
                <h2>Want to verify a certificate?</h2>
                <button onClick={(e) => {
                    e.preventDefault();
                    setIsVerify(true);
                }}>Click Here</button>
                {
                    isVerify && (
                       <div className="verify width100">
                             <h2>Verify Certificate</h2>
                            <form>
                                <input type="text" placeholder='Certificate ID' value={idToVerify} onChange={(e) => setIdToVerify(e.target.value)} />
                                <p>{idToVerify}</p>
                                <button onClick={verifyCertificate}>Verify Certificate</button>
                                <button onClick={(e) => {
                                    e.preventDefault();
                                    setIsVerify(false)
                                }}>X</button>
                            </form>
                       </div>
                    )
                }
            </section>
        </section>
    </div>
  )
}

export default Home