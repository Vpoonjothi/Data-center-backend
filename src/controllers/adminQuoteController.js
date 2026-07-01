import Quote from '../models/Quote.js';
import User from '../models/User.js';
import Service from '../models/Service.js';
import { calculateSubscriptionPricing } from '../utils/pricingCalculator.js';

// @desc    Get all quotes
// @route   GET /api/admin/quotes
// @access  Private (Admin)
export const getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'company'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: quotes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get quote by ID
// @route   GET /api/admin/quotes/:id
// @access  Private (Admin)
export const getQuoteById = async (req, res) => {
  try {
    const quote = await Quote.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'company'] }]
    });
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }
    res.json({ success: true, data: quote });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update quote status
// @route   PUT /api/admin/quotes/:id/status
// @access  Private (Admin)
export const updateQuoteStatus = async (req, res) => {
  try {
    const { status, monthly_price, notes, renewal_type } = req.body;
    const quote = await Quote.findByPk(req.params.id);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }
    
    quote.status = status;
    if (monthly_price !== undefined) {
      const pricing = calculateSubscriptionPricing(monthly_price, quote.duration_value, quote.duration_unit);
      quote.monthly_price = pricing.monthlySubscription;
      quote.subtotal_price = pricing.contractValue;
      quote.gst_amount = pricing.gstAmount;
      quote.grand_total = pricing.totalPayable;
    }
    if (notes !== undefined) {
      quote.notes = notes;
    }
    if (renewal_type !== undefined) {
      quote.renewal_type = renewal_type;
    }

    await quote.save();

    // If admin bypasses normal flow and marks as active directly,
    // ensure a Service record is created so the user can see it.
    if (status === 'active') {
      let service = await Service.findOne({ where: { quote_id: quote.id } });
      if (!service) {
        const serviceName = `${quote.service_type.replace(/\s+/g, '')}-${Math.floor(Math.random() * 10000)}`;
        const currentDate = new Date();
        const nextDueDate = new Date();
        
        // Calculate duration based on quote
        let months = 1;
        if (quote.duration_value) {
            if (quote.duration_unit === 'Months' || quote.duration_unit === 'months') {
                months = quote.duration_value;
            } else if (quote.duration_unit === 'Years' || quote.duration_unit === 'years') {
                months = quote.duration_value * 12;
            }
        }
        nextDueDate.setMonth(nextDueDate.getMonth() + months);

        await Service.create({
          user_id: quote.user_id,
          quote_id: quote.id,
          service_name: serviceName,
          service_type: quote.service_type,
          monthly_amount: quote.monthly_price,
          status: 'Active',
          purchase_date: currentDate,
          start_date: currentDate,
          next_due_date: nextDueDate,
          renewal_date: nextDueDate,
          renewal_type: quote.renewal_type || 'manual'
        });
      } else if (service.status !== 'Active') {
        service.status = 'Active';
        await service.save();
      }
    }
    
    res.json({ success: true, data: quote });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
