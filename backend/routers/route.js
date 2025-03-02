import express from 'express'
import { insertCertificateData, getCertificateData } from '../controllers/controllers.js'

const router = express.Router();

router.post('/addcertificate', insertCertificateData);
router.get('/getcertificate', getCertificateData);

export default router;