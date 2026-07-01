import { VerificationRequest, Quote, User } from '../models/index.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all verifications
// @route   GET /api/admin/verifications
// @access  Private/Admin
export const getVerifications = async (req, res) => {
  try {
    const verifications = await VerificationRequest.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'company'] },
        { model: Quote, as: 'quote', attributes: ['id', 'quote_number', 'service_type', 'monthly_price'] }
      ],
      order: [['submitted_at', 'DESC']]
    });

    res.json({ success: true, data: verifications });
  } catch (error) {
    console.error('Get verifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get verification by ID
// @route   GET /api/admin/verifications/:id
// @access  Private/Admin
export const getVerificationById = async (req, res) => {
  try {
    const verification = await VerificationRequest.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'company'] },
        { model: Quote, as: 'quote', attributes: ['id', 'quote_number', 'service_type', 'monthly_price'] }
      ]
    });

    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification request not found' });
    }

    res.json({ success: true, data: verification });
  } catch (error) {
    console.error('Get verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get secure document file
// @route   GET /api/admin/verifications/document/:filename
// @access  Private/Admin
export const getVerificationDocument = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../uploads/verifications', req.params.filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ success: false, message: 'Document not found' });
    }
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update verification status
// @route   PUT /api/admin/verifications/:id/status
// @access  Private/Admin
export const updateVerificationStatus = async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    
    const verification = await VerificationRequest.findByPk(req.params.id);

    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification request not found' });
    }

    verification.status = status;
    if (admin_notes !== undefined) {
      verification.admin_notes = admin_notes;
    }
    verification.reviewed_at = new Date();
    await verification.save();

    // If verified, update the quote status as well
    if (status === 'verified') {
      const quote = await Quote.findByPk(verification.quote_id);
      if (quote) {
        quote.status = 'verified';
        await quote.save();
      }
    }

    res.json({ success: true, message: 'Status updated successfully', data: verification });
  } catch (error) {
    console.error('Update verification status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
