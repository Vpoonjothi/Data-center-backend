import { KycVerification, User, Quote, Document } from '../models/index.js';

// @desc    Get all KYC verifications
// @route   GET /api/admin/kyc
// @access  Private/Admin
export const getAdminKycVerifications = async (req, res) => {
  try {
    const verifications = await KycVerification.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'company'] },
        { model: Quote, as: 'quote', attributes: ['id', 'quote_number', 'service_type', 'monthly_price'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: verifications });
  } catch (error) {
    console.error('Get admin KYC verifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get KYC verification by ID
// @route   GET /api/admin/kyc/:id
// @access  Private/Admin
export const getAdminKycVerificationById = async (req, res) => {
  try {
    const verification = await KycVerification.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'company'] },
        { model: Quote, as: 'quote', attributes: ['id', 'quote_number', 'service_type', 'monthly_price'] }
      ]
    });

    if (!verification) {
      return res.status(404).json({ success: false, message: 'KYC Verification not found' });
    }

    const documents = await Document.findAll({
      where: {
        entity_type: 'KycVerification',
        entity_id: verification.id
      },
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: { ...verification.toJSON(), documents } });
  } catch (error) {
    console.error('Get admin KYC verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update KYC verification status
// @route   PUT /api/admin/kyc/:id/status
// @access  Private/Admin
export const updateAdminKycVerificationStatus = async (req, res) => {
  try {
    const { status, reject_reason, admin_notes } = req.body;
    
    const verification = await KycVerification.findByPk(req.params.id);
    if (!verification) {
      return res.status(404).json({ success: false, message: 'KYC Verification not found' });
    }

    verification.overall_status = status;
    if (reject_reason !== undefined) verification.reject_reason = reject_reason;
    if (admin_notes !== undefined) verification.admin_notes = admin_notes;
    
    await verification.save();

    // If verified or rejected, update the Quote status as well
    if (status === 'verified') {
      const quote = await Quote.findByPk(verification.quote_id);
      if (quote) {
        quote.status = 'verified';
        await quote.save();
      }
    } else if (status === 'rejected') {
      // Keep quote in verification_pending so user can retry, or mark it pending
    }

    res.json({ success: true, data: verification });
  } catch (error) {
    console.error('Update admin KYC verification status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update KYC document specific status
// @route   PUT /api/admin/kyc/:id/document-status
// @access  Private/Admin
export const updateAdminKycDocumentStatus = async (req, res) => {
  try {
    const { documentType, status, reason } = req.body;
    
    const verification = await KycVerification.findByPk(req.params.id);
    if (!verification) {
      return res.status(404).json({ success: false, message: 'KYC Verification not found' });
    }

    const validDocs = [
      'aadhaar_front', 'aadhaar_back', 'gst_cert', 
      'pan_card', 'company_reg', 'address_proof'
    ];

    if (!validDocs.includes(documentType)) {
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }

    // Update document status
    verification[`${documentType}_status`] = status;
    verification[`${documentType}_reason`] = status === 'rejected' ? reason : null;

    // Determine overall status based on all document statuses
    const requiredDocs = verification.customer_type === 'company' 
      ? ['gst_cert', 'pan_card', 'aadhaar_front', 'aadhaar_back']
      : ['aadhaar_front', 'aadhaar_back'];
    
    let allApproved = true;
    let anyRejected = false;
    let anyPending = false;

    for (const doc of requiredDocs) {
      if (verification[`${doc}_path`]) {
        const docStatus = verification[`${doc}_status`];
        if (docStatus === 'rejected') anyRejected = true;
        if (docStatus === 'pending' || docStatus === 'replaced') anyPending = true;
        if (docStatus !== 'approved') allApproved = false;
      } else {
        // Missing required doc implies not all approved
        allApproved = false;
      }
    }

    if (anyRejected) {
      verification.overall_status = 'rejected';
    } else if (allApproved) {
      verification.overall_status = 'verified';
      verification.verified_at = new Date();
      // Update Quote to verified
      const quote = await Quote.findByPk(verification.quote_id);
      if (quote) {
        quote.status = 'verified';
        await quote.save();
      }
    } else {
      verification.overall_status = 'under_review';
    }

    await verification.save();

    res.json({ success: true, data: verification });
  } catch (error) {
    console.error('Update admin KYC document status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get KYC document securely for admin
// @route   GET /api/admin/kyc/document
// @access  Private/Admin
export const getAdminKycDocument = async (req, res) => {
  try {
    const { path: filename, userId } = req.query;
    
    if (!filename || !userId) {
      return res.status(400).json({ success: false, message: 'File path and userId required' });
    }

    const baseUploadDir = path.join(__dirname, '../../uploads/kyc', userId.toString());
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
    console.error('Get admin KYC document error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving document' });
  }
};
