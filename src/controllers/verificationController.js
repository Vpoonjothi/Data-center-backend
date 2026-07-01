import { VerificationRequest, Quote } from '../models/index.js';

// @desc    Upload verification documents
// @route   POST /api/verifications/upload
// @access  Private
export const uploadVerificationDocs = async (req, res) => {
  try {
    const { quoteId, documentType, documentNumber } = req.body;

    if (!quoteId) {
      return res.status(400).json({ success: false, message: 'Quote ID is required' });
    }

    if (!documentNumber && (!req.files || !req.files['aadhaarFront'] || !req.files['aadhaarBack'])) {
      return res.status(400).json({ success: false, message: 'Please provide either a document number or upload the front and back images' });
    }

    const quote = await Quote.findOne({
      where: { id: quoteId, user_id: req.user.id }
    });

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    if (quote.status !== 'verification_pending') {
      return res.status(400).json({ success: false, message: 'Quote is not pending verification' });
    }

    let frontFile = req.files && req.files['aadhaarFront'] ? req.files['aadhaarFront'][0].filename : null;
    let backFile = req.files && req.files['aadhaarBack'] ? req.files['aadhaarBack'][0].filename : null;

    // Check if verification already exists
    let verification = await VerificationRequest.findOne({ where: { quote_id: quoteId } });

    if (verification) {
      if (frontFile) verification.aadhaar_front_path = frontFile;
      if (backFile) verification.aadhaar_back_path = backFile;
      if (documentNumber) verification.document_number = documentNumber;
      verification.status = 'verification_pending';
      if (documentType) verification.document_type = documentType;
      await verification.save();
    } else {
      verification = await VerificationRequest.create({
        user_id: req.user.id,
        quote_id: quoteId,
        document_type: documentType || 'Aadhaar',
        document_number: documentNumber || null,
        aadhaar_front_path: frontFile,
        aadhaar_back_path: backFile,
        status: 'verification_pending'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Verification documents uploaded successfully',
      data: verification
    });
  } catch (error) {
    console.error('Upload verification error:', error);
    res.status(500).json({ success: false, message: 'Server error during upload' });
  }
};

// @desc    Get verification status for a quote
// @route   GET /api/verifications/status/:quoteId
// @access  Private
export const getVerificationStatus = async (req, res) => {
  try {
    const { quoteId } = req.params;

    const verification = await VerificationRequest.findOne({
      where: { quote_id: quoteId, user_id: req.user.id }
    });

    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification not found' });
    }

    res.json({
      success: true,
      data: {
        status: verification.status,
        admin_notes: verification.admin_notes
      }
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
