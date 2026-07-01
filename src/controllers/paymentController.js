import { Payment, Quote, Service, User, KycVerification, CustomerAgreement } from '../models/index.js';
import { logAudit, logTimeline, sendNotification } from '../utils/auditService.js';

export const getPaymentDetails = async (req, res) => {
  try {
    const quote = await Quote.findOne({
      where: { id: req.params.quoteId, user_id: req.user.id }
    });

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    if (quote.status !== 'verified') {
      return res.status(400).json({ success: false, message: 'Quote must be verified before payment' });
    }

    const kyc = await KycVerification.findOne({
      where: { quote_id: quote.id, overall_status: 'verified' }
    });

    res.json({
      success: true,
      data: {
        quote_number: quote.quote_number,
        service_type: quote.service_type,
        amount: quote.monthly_price,
        status: quote.status,
        billing_identity: kyc ? {
          customer_type: kyc.customer_type,
          name: kyc.customer_type === 'company' ? kyc.company_name : kyc.full_name,
          address: kyc.customer_type === 'company' ? kyc.registered_address : kyc.residential_address,
          gst_number: kyc.gst_number || null,
          pan_number: kyc.pan_number || null
        } : null
      }
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const submitPaymentProof = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { 
      termsAccepted, 
      payment_method, 
      bank_name, 
      transaction_reference, 
      payment_date, 
      invoice_reference,
      msaAccepted,
      tncAccepted,
      aupAccepted,
      privacyAccepted
    } = req.body;

    if (!termsAccepted || !msaAccepted || !tncAccepted || !aupAccepted || !privacyAccepted) {
      return res.status(400).json({ success: false, message: 'You must accept all required agreements and policies before payment.' });
    }

    const quote = await Quote.findOne({
      where: { id: quoteId, user_id: req.user.id }
    });

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    if (quote.status !== 'verified') {
      return res.status(400).json({ success: false, message: 'Quote must be verified before payment' });
    }

    // Check if there is already a payment pending
    const existingPayment = await Payment.findOne({
      where: { quote_id: quote.id, status: 'Pending Verification' }
    });
    if (existingPayment) {
      return res.status(400).json({ success: false, message: 'A payment is already pending verification for this quote.' });
    }

    let paymentScreenshotPath = null;
    if (req.file) {
      paymentScreenshotPath = `/uploads/payments/${req.user.id}/${req.file.filename}`;
    }

    // 1. Create Payment Record (Pending Verification)
    const transactionRef = transaction_reference || `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const payment = await Payment.create({
      user_id: req.user.id,
      quote_id: quote.id,
      // We will set service_id to 0 for now or make it nullable in migration, but wait, `service_id` was `allowNull: false` in Payment.js.
      // Wait, is service created before payment or after? The prompt says "Only then allow Service Activation".
      // I need to update Payment model to allow `service_id` to be null. I'll do that shortly.
      service_id: null, // Temporary, will be handled via migration
      amount: quote.monthly_price,
      payment_date: payment_date || new Date(),
      transaction_reference: transactionRef,
      invoice_reference: invoice_reference || `INV-${quote.quote_number}`,
      payment_method: payment_method,
      bank_name: bank_name,
      payment_screenshot: paymentScreenshotPath,
      status: 'Pending Verification',
      payment_terms_accepted: true,
      payment_terms_accepted_at: new Date()
    });

    // 2. Save Customer Agreements
    const userIp = req.ip || req.headers['x-forwarded-for'];
    const userBrowser = req.headers['user-agent'];
    
    await CustomerAgreement.create({
      user_id: req.user.id,
      quote_id: quote.id,
      msa_accepted: msaAccepted,
      tnc_accepted: tncAccepted,
      aup_accepted: aupAccepted,
      privacy_accepted: privacyAccepted,
      ip_address: userIp,
      browser_info: userBrowser,
      accepted_at: new Date()
    });

    // 3. Update Quote Status
    quote.status = 'processing';
    await quote.save();

    await logAudit({
      action: 'PAYMENT_SUBMITTED',
      action_by_user_id: req.user.id,
      target_user_id: req.user.id,
      entity_type: 'Payment',
      entity_id: payment.id,
      req,
      details: { quote_id: quote.id, amount: quote.monthly_price }
    });

    await logTimeline({
      user_id: req.user.id,
      event_type: 'payment_submission',
      event_title: 'Payment Submitted',
      event_description: `Payment proof uploaded for Quote #${quote.quote_number}.`
    });

    res.status(200).json({
      success: true,
      message: 'Payment proof submitted successfully. Awaiting verification.',
      data: {
        payment
      }
    });
  } catch (error) {
    console.error('Submit payment proof error:', error);
    res.status(500).json({ success: false, message: 'Server error during payment submission' });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Service, as: 'service', attributes: ['service_name'] }
      ],
      order: [['payment_date', 'DESC']]
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Get my payments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getAdminPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        { model: Service, as: 'service', attributes: ['service_name'] },
        { model: Quote, as: 'quote', attributes: ['quote_number', 'service_type'] },
        { model: User, as: 'user', attributes: ['name', 'email'] }
      ],
      order: [['payment_date', 'DESC']]
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Get admin payments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body; // 'Verified' or 'Rejected'

    const payment = await Payment.findByPk(id, {
      include: [{ model: Quote, as: 'quote' }]
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    payment.status = status;
    payment.remarks = remarks;
    await payment.save();

    if (status === 'Verified') {
      const quote = payment.quote;
      // Enforce Service Activation Rule
      const kyc = await KycVerification.findOne({ where: { quote_id: quote.id, overall_status: 'verified' } });
      
      if (!kyc) {
        return res.status(403).json({ 
          success: false, 
          message: 'Service Activation Blocked: KYC Status must be Verified before Service Activation is allowed.' 
        });
      }

      const agreements = await CustomerAgreement.findOne({ where: { quote_id: quote.id } });
      if (!agreements || !agreements.msa_accepted) {
        return res.status(403).json({ 
          success: false, 
          message: 'Service Activation Blocked: Customer Agreements must be accepted.' 
        });
      }

      // Also update Quote
      quote.status = 'paid';
      await quote.save();

      // Service Provisioning (Dedicated Server, AI Server, Colocation, etc.)
      let service = await Service.findOne({ where: { quote_id: quote.id } });
      if (!service) {
        const serviceName = `${quote.service_type.replace(/\s+/g, '')}-${Math.floor(Math.random() * 10000)}`;
        const currentDate = new Date();
        const nextDueDate = new Date();
        nextDueDate.setDate(nextDueDate.getDate() + 30);

        service = await Service.create({
          user_id: payment.user_id,
          quote_id: quote.id,
          service_name: serviceName,
          service_type: quote.service_type,
          monthly_amount: quote.monthly_price,
          status: 'Active',
          purchase_date: currentDate,
          start_date: currentDate,
          next_due_date: nextDueDate
        });
      }

      // Link service to payment
      payment.service_id = service.id;
      await payment.save();

      await logAudit({
        action: 'PAYMENT_VERIFIED',
        action_by_user_id: req.user.id, // Admin
        target_user_id: payment.user_id,
        entity_type: 'Payment',
        entity_id: payment.id,
        req,
        details: { status: 'Verified' }
      });

      await logTimeline({
        user_id: payment.user_id,
        admin_id: req.user.id,
        event_type: 'payment_verified',
        event_title: 'Payment Verified',
        event_description: `Payment for Quote #${quote.quote_number} has been verified and service is activated.`
      });

      await sendNotification({
        user_id: payment.user_id,
        title: 'Payment Verified & Service Activated',
        message: `Your payment for Quote #${quote.quote_number} has been verified. Your service "${service.service_name}" is now active.`,
        type: 'success',
        channels: { dashboard: true, email: true } // Mock email
      });

    } else if (status === 'Rejected') {
      const quote = payment.quote;
      // Change quote status back to verified or payment_rejected
      quote.status = 'payment_rejected';
      await quote.save();
    }

    res.json({ success: true, message: `Payment marked as ${status}`, data: payment });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
