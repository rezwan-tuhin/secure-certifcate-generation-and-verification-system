import React, { useState, useEffect } from 'react';
import './Certificate.css';
import axiosInstance from './axiosconfig';
import { useLocation } from 'react-router-dom';

const Certificate = () => {
  // const location = useLocation();
  // const {courseId} = location.state || {};
  const courseId = '775d3579-c33f-41bf-82e5-ce26e7388042';
  console.log(`course id in certificate: ${courseId}`);
  const [printCertificateData, setPrintCertificateData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  console.log(printCertificateData);
  
  const getCertificateData = async (_certificateId) => {
    setIsLoading(true);
    axiosInstance.get('/getcertificate', {
        params: {
            id: _certificateId,
        }
    })
    .then((res) => {
        setPrintCertificateData(res.data);
        setIsLoading(false);
    })
    .catch((error) => {
        console.error(error);
        setIsLoading(false);
    });
  };
  
  useEffect(() => {
    getCertificateData(courseId);
  }, []);
  
  // Print certificate function
  const printCertificate = () => {
    window.print();
  };
  
  return (
    <>
      <div className="certificate-container">
        {isLoading ? (
          <div>Loading certificate...</div>
        ) : printCertificateData.length > 0 ? (
          <>
            <div className="certificate">
              <div className="certificate-header">
                <h1>Certificate of Completion</h1>
              </div>
              <div className="certificate-body">
                <p className="certificate-text">
                  This is to certify that <strong>{printCertificateData[0].Name}</strong> has successfully completed the course <strong>{printCertificateData[0].Course}</strong>.
                </p>
              </div>
              <div className="certificate-auto">
                <p>This certificate is auto-generate. It does not need signature</p>
                <p>Verification Code: <span>{printCertificateData[0].CertificateID}</span></p>
              </div>
            </div>
            <div className="certificate-footer">
              <button className='print-button' onClick={printCertificate}>
                Print Certificate
              </button>
            </div>
          </>
        ) : (
          <div>No certificate data found</div>
        )}
      </div>
    </>
  );
};

export default Certificate;