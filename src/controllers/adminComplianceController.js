import { User, KycVerification, Payment, Quote, AuditLog } from '../models/index.js';

export const getComplianceLogs = async (req, res) => {
  try {
    const quotes = await Quote.findAll({
      attributes: ['id', 'quote_number', 'status', 'createdAt', 'updatedAt'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'terms_accepted', 'terms_accepted_at']
        },
        {
          model: KycVerification,
          attributes: ['id', 'kyc_consent', 'kyc_consent_at']
        },
        {
          model: Payment,
          as: 'payments',
          attributes: ['id', 'payment_terms_accepted', 'payment_terms_accepted_at']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: quotes });
  } catch (error) {
    console.error('Get compliance logs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      include: [
        { model: User, as: 'action_by', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'target_user', attributes: ['id', 'name', 'email'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
