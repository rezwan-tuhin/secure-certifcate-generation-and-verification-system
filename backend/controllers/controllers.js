import { db } from "../connect.js";
import crypto from 'crypto';
// import {v4 as uuidv4} from 'uuid';
// import { ethers } from "ethers";
// import contractABI from './contractABI.json';
// import dotenv from 'dotenv';

// dotenv.config();

// const rpcProvider = process.env.RPC_PROVIDER;
// const contractAddress = process.env.CONTRACT_ADDRESS;
// const privateKey = process.env.PRIVATE_KEY;

export const insertCertificateData = async (req, res) => {
    const values = [
        req.body.holderName,
        req.body.course,
        req.body.uuid,
    ]
    db.query("INSERT INTO certificatedata(`Name`, `Course`, `CertificateID`) VALUES(?)", [values], (error, result) => {
        if(error) {
            console.error(error);
        }
        res.send(['success', req.body.uuid]);
    })
}


export const getCertificateData = async (req, res) => {
    const certificateId = req.query.id;
    if (!certificateId) {
        return res.status(400).send({ message: "Certificate ID is required." });
    }
    console.log(certificateId);
    db.query("SELECT * FROM certificatedata WHERE CertificateID = ?", [certificateId], (error, result) => {
        if(error) {
            console.error(error);
        }
        res.send(result);
    })
}