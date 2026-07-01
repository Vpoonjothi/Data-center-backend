import { KycVerification, Quote, Document } from '../models/index.js';
import crypto from 'crypto';
import { logAudit, logTimeline, sendNotification } from '../utils/auditService.js';

// @desc    Get KYC status for a quote
// @route   GET /api/kyc/status/:quoteId
// @access  Private
export const getKycStatus = async (req, res) => {
  try {
    const { quoteId } = req.params;

    let kyc = await KycVerification.findOne({
      where: { quote_id: quoteId, user_id: req.user.id },
      include: [
        { model: Quote, as: 'quote', attributes: ['id', 'quote_number', 'service_type', 'monthly_price', 'status'] }
      ]
    });

    if (!kyc) {
      // If none exists, create a pending one
      kyc = await KycVerification.create({
        user_id: req.user.id,
        quote_id: quoteId,
        aadhaar_status: 'pending',
        pan_status: 'pending',
        overall_status: 'pending'
      });
      // Refetch with include
      kyc = await KycVerification.findOne({
        where: { id: kyc.id },
        include: [
          { model: Quote, as: 'quote', attributes: ['id', 'quote_number', 'service_type', 'monthly_price', 'status'] }
        ]
      });
    }

    res.json({ success: true, data: kyc });
  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all KYC verifications for current user
// @route   GET /api/kyc/my-kyc
// @access  Private
export const getMyKyc = async (req, res) => {
  try {
    const kycs = await KycVerification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: kycs });
  } catch (error) {
    console.error('Get my KYC error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateOverallStatus = async (kyc) => {
  if (kyc.aadhaar_status === 'verified' && kyc.pan_status === 'verified') {
    kyc.overall_status = 'verified';
    kyc.verified_at = new Date();
    
    // Also update the quote status to verified
    const quote = await Quote.findByPk(kyc.quote_id);
    if (quote && quote.status === 'verification_pending' || quote.status === 'quoted') {
      quote.status = 'verified';
      await quote.save();
    }
  } else if (kyc.aadhaar_status === 'verified' || kyc.pan_status === 'verified') {
    kyc.overall_status = 'partially_verified';
  } else if (kyc.aadhaar_status === 'failed' || kyc.pan_status === 'failed') {
    kyc.overall_status = 'failed';
  } else {
    kyc.overall_status = 'pending';
  }
};

// @desc    Start Aadhaar Verification (Mock)
// @route   POST /api/kyc/aadhaar/start
// @access  Private
export const startAadhaarVerification = async (req, res) => {
  try {
    const { quoteId, kycConsent } = req.body;
    let kyc = await KycVerification.findOne({ where: { quote_id: quoteId, user_id: req.user.id } });

    if (!kyc) {
      return res.status(404).json({ success: false, message: 'KYC record not found' });
    }

    if (kycConsent) {
      kyc.kyc_consent = true;
      kyc.kyc_consent_at = new Date();
    }

    // Mock API Success
    kyc.aadhaar_status = 'verified';
    kyc.aadhaar_reference_id = `ADH-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    await updateOverallStatus(kyc);
    await kyc.save();

    res.json({ success: true, message: 'Aadhaar verified successfully', data: kyc });
  } catch (error) {
    console.error('Aadhaar verification error:', error);
    res.status(500).json({ success: false, message: 'Server error during Aadhaar verification' });
  }
};

// @desc    Start PAN Verification (Mock)
// @route   POST /api/kyc/pan/start
// @access  Private
export const startPanVerification = async (req, res) => {
  try {
    const { quoteId, kycConsent } = req.body;
    let kyc = await KycVerification.findOne({ where: { quote_id: quoteId, user_id: req.user.id } });

    if (!kyc) {
      return res.status(404).json({ success: false, message: 'KYC record not found' });
    }

    if (kycConsent) {
      kyc.kyc_consent = true;
      kyc.kyc_consent_at = new Date();
    }

    // Mock API Success
    kyc.pan_status = 'verified';
    kyc.pan_reference_id = `PAN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    await updateOverallStatus(kyc);
    await kyc.save();

    res.json({ success: true, message: 'PAN verified successfully', data: kyc });
  } catch (error) {
    console.error('PAN verification error:', error);
    res.status(500).json({ success: false, message: 'Server error during PAN verification' });
  }
};

// @desc    Submit KYC form with documents
// @route   POST /api/kyc/submit
// @access  Private
export const submitKyc = async (req, res) => {
  try {
    const { quoteId, customer_type, ...kycData } = req.body;
    let kyc = await KycVerification.findOne({ where: { quote_id: quoteId, user_id: req.user.id } });

    if (!kyc) {
      kyc = await KycVerification.create({
        user_id: req.user.id,
        quote_id: quoteId
      });
    }

    // Update text fields
    kyc.customer_type = customer_type;
    for (const key of Object.keys(kycData)) {
      kyc[key] = kycData[key] || null;
    }

    // Process uploaded files
    if (req.files) {
      if (req.files.aadhaar_front) kyc.aadhaar_front_path = req.files.aadhaar_front[0].filename;
      if (req.files.aadhaar_back) kyc.aadhaar_back_path = req.files.aadhaar_back[0].filename;
      if (req.files.gst_cert) kyc.gst_cert_path = req.files.gst_cert[0].filename;
      if (req.files.pan_card) kyc.pan_card_path = req.files.pan_card[0].filename;
      if (req.files.company_reg) kyc.company_reg_path = req.files.company_reg[0].filename;
      if (req.files.address_proof) kyc.address_proof_path = req.files.address_proof[0].filename;
    }

    kyc.overall_status = 'under_review';
    kyc.submitted_at = new Date();
    await kyc.save();

    await logAudit({
      action: 'KYC_SUBMITTED',
      action_by_user_id: req.user.id,
      target_user_id: req.user.id,
      entity_type: 'KycVerification',
      entity_id: kyc.id,
      req,
      details: { customer_type }
    });

    await logTimeline({
      user_id: req.user.id,
      event_type: 'kyc_submission',
      event_title: 'KYC Submitted',
      event_description: 'Customer submitted identity verification documents for review.'
    });

    res.json({ success: true, message: 'KYC submitted successfully', data: kyc });
  } catch (error) {
    console.error('KYC submission error:', error);
    res.status(500).json({ success: false, message: 'Server error during KYC submission' });
  }
};

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get KYC document securely
// @route   GET /api/kyc/document?path=...&userId=...
// @access  Private (Owner or Admin)
export const getKycDocument = async (req, res) => {
  try {
    const { path: filename, userId: queryUserId } = req.query;
    
    // Determine the target user's folder. 
    // If Admin, they can pass userId. If normal user, they can only access their own.
    const targetUserId = (req.user.role === 'admin' && queryUserId) ? queryUserId : req.user.id;
    
    if (!filename) {
      return res.status(400).json({ success: false, message: 'File path required' });
    }

    const baseUploadDir = path.join(__dirname, '../../uploads/kyc', targetUserId.toString());
    const filePath = path.join(baseUploadDir, filename);

    // Security check to prevent directory traversal
    if (!filePath.startsWith(baseUploadDir)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Get KYC document error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving document' });
  }
};

// @desc    Replace a rejected document
// @route   POST /api/kyc/replace-document
// @access  Private
export const replaceDocument = async (req, res) => {
  try {
    const { quoteId, documentType } = req.body;
    let kyc = await KycVerification.findOne({ where: { quote_id: quoteId, user_id: req.user.id } });

    if (!kyc) {
      return res.status(404).json({ success: false, message: 'KYC record not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const validDocs = [
      'aadhaar_front', 'aadhaar_back', 'gst_cert', 
      'pan_card', 'company_reg', 'address_proof'
    ];

    if (!validDocs.includes(documentType)) {
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }

    // Document Versioning using generic Document model
    await Document.create({
      user_id: req.user.id,
      entity_type: 'KycVerification',
      entity_id: kyc.id,
      document_type: documentType,
      file_path: kyc[`${documentType}_path`], // Store old path as archived
      status: 'archived',
      remarks: 'Replaced due to rejection'
    });

    // Update the path and set status to pending
    kyc[`${documentType}_path`] = req.file.filename;
    kyc[`${documentType}_status`] = 'pending';
    kyc[`${documentType}_reason`] = null;

    // Change overall status back to under_review if it was rejected
    if (kyc.overall_status === 'failed' || kyc.overall_status === 'rejected') {
      kyc.overall_status = 'under_review';
    }

    await kyc.save();

    await logAudit({
      action: 'KYC_DOCUMENT_REPLACED',
      action_by_user_id: req.user.id,
      target_user_id: req.user.id,
      entity_type: 'KycVerification',
      entity_id: kyc.id,
      req,
      details: { documentType }
    });

    res.json({ success: true, message: 'Document replaced successfully', data: kyc });
  } catch (error) {
    console.error('Replace document error:', error);
    res.status(500).json({ success: false, message: 'Server error replacing document' });
  }
};
