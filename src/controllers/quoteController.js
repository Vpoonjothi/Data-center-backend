import { Quote } from '../models/index.js';
import { calculateSubscriptionPricing } from '../utils/pricingCalculator.js';

export const createQuote = async (req, res) => {
  try {
    const { 
      service_type, vcpu, ram, storage, os, bandwidth, backup, discount, monthly_price,
      duration_type, duration_value, duration_unit 
    } = req.body;
    
    if (!monthly_price) {
      return res.status(400).json({ success: false, message: 'Monthly price is required' });
    }

    // Recalculate everything on the backend to enforce the single source of truth
    const pricing = calculateSubscriptionPricing(monthly_price, duration_value, duration_unit);

    const quote = await Quote.create({
      user_id: req.user.id,
      service_type: service_type || 'Custom Server',
      vcpu,
      ram,
      storage,
      os,
      bandwidth,
      backup,
      discount,
      monthly_price: pricing.monthlySubscription,
      duration_type,
      duration_value,
      duration_unit,
      subtotal_price: pricing.contractValue,
      gst_amount: pricing.gstAmount,
      grand_total: pricing.totalPayable,
      renewal_type: req.body.renewal_type || 'manual'
    });

    res.status(201).json({
      success: true,
      message: 'Quote request submitted successfully',
      data: quote
    });
  } catch (error) {
    console.error('Create quote error:', error);
    res.status(500).json({ success: false, message: 'Failed to create quote request' });
  }
};

export const getMyQuotes = async (req, res) => {
  try {
    const quotes = await Quote.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: quotes
    });
  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quotes' });
  }
};

// @desc    Accept quote and trigger verification
// @route   PUT /api/quotes/:id/accept
// @access  Private
export const acceptQuote = async (req, res) => {
  try {
    const quote = await Quote.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    if (quote.status !== 'quoted') {
      return res.status(400).json({ success: false, message: 'Only quoted status can be accepted' });
    }

    quote.status = 'verification_pending';
    await quote.save();

    res.json({
      success: true,
      message: 'Quote accepted successfully',
      data: quote
    });
  } catch (error) {
    console.error('Accept quote error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reject quote
// @route   PUT /api/quotes/:id/reject
// @access  Private
export const rejectQuote = async (req, res) => {
  try {
    const { reject_reason } = req.body;
    const quote = await Quote.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    if (quote.status !== 'quoted') {
      return res.status(400).json({ success: false, message: 'Only quoted status can be rejected' });
    }

    quote.status = 'rejected';
    quote.reject_reason = reject_reason || null;
    await quote.save();

    res.json({
      success: true,
      message: 'Quote rejected successfully',
      data: quote
    });
  } catch (error) {
    console.error('Reject quote error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
