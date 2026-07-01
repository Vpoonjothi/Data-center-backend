import Enquiry from '../models/Enquiry.js';
import EnquiryResponse from '../models/EnquiryResponse.js';
import EnquiryNote from '../models/EnquiryNote.js';
import EnquiryLog from '../models/EnquiryLog.js';
import Quote from '../models/Quote.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import sequelize from '../config/database.js';

// @desc    Get all enquiries
// @route   GET /api/admin/enquiries
// @access  Private (Admin)
export const getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: enquiries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get enquiry by ID including responses, notes, logs, quotes, and user stats
// @route   GET /api/admin/enquiries/:id
// @access  Private (Admin)
export const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id, {
      include: [
        {
          model: EnquiryResponse,
          as: 'responses',
          include: [{ model: Admin, as: 'admin', attributes: ['id', 'name'] }]
        },
        {
          model: EnquiryNote,
          as: 'notes',
          include: [{ model: Admin, as: 'admin', attributes: ['id', 'name'] }]
        },
        {
          model: EnquiryLog,
          as: 'logs'
        },
        {
          model: Quote,
          as: 'quotes'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'company', 'createdAt']
        }
      ],
      order: [
        [{ model: EnquiryLog, as: 'logs' }, 'created_at', 'DESC'],
        [{ model: EnquiryNote, as: 'notes' }, 'created_at', 'DESC'],
        [{ model: EnquiryResponse, as: 'responses' }, 'created_at', 'ASC']
      ]
    });
    
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    let userStats = null;
    if (enquiry.user_id) {
      const totalEnquiries = await Enquiry.count({ where: { user_id: enquiry.user_id } });
      const totalQuotes = await Quote.count({ where: { user_id: enquiry.user_id } });
      userStats = { totalEnquiries, totalQuotes };
    }
    
    // Add an access-log for admin viewing the enquiry
    await EnquiryLog.create({
      enquiry_id: enquiry.id,
      user_id: req.admin.id,
      action: 'Viewed Enquiry Details',
      details: `Admin ${req.admin.name} viewed the enquiry details page.`
    });

    // To prevent the access log from continuously mutating state and triggering refetches infinitely if poorly handled on frontend,
    // we only create the log but don't strictly need to append it to the returned object if it's just 'viewed'.

    res.json({ success: true, data: { ...enquiry.toJSON(), userStats } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update enquiry status
// @route   PUT /api/admin/enquiries/:id/status
// @access  Private (Admin)
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await Enquiry.findByPk(req.params.id);
    
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    
    const oldStatus = enquiry.status;
    enquiry.status = status;
    await enquiry.save();

    await EnquiryLog.create({
      enquiry_id: enquiry.id,
      user_id: req.admin.id,
      action: 'Status Changed',
      details: `Status changed from ${oldStatus} to ${status}`
    });
    
    res.json({ success: true, data: enquiry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add response to enquiry
// @route   POST /api/admin/enquiries/:id/responses
// @access  Private (Admin)
export const addEnquiryResponse = async (req, res) => {
  try {
    const { subject, response, markAsClosed } = req.body;
    const enquiryId = req.params.id;
    
    const enquiry = await Enquiry.findByPk(enquiryId);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    
    const newResponse = await EnquiryResponse.create({
      enquiry_id: enquiryId,
      admin_id: req.admin.id,
      subject,
      response,
    });

    await EnquiryLog.create({
      enquiry_id: enquiry.id,
      user_id: req.admin.id,
      action: 'Admin Responded',
      details: `Response added: ${subject}`
    });
    
    // Auto update status
    const oldStatus = enquiry.status;
    const newStatus = markAsClosed ? 'Closed' : 'Responded';
    if (oldStatus !== newStatus) {
      enquiry.status = newStatus;
      await enquiry.save();
      await EnquiryLog.create({
        enquiry_id: enquiry.id,
        user_id: req.admin.id,
        action: 'Status Changed',
        details: `Status changed from ${oldStatus} to ${newStatus}`
      });
    }
    
    res.status(201).json({ success: true, data: newResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add internal note to enquiry
// @route   POST /api/admin/enquiries/:id/notes
// @access  Private (Admin)
export const addEnquiryNote = async (req, res) => {
  try {
    const { note_text } = req.body;
    const enquiryId = req.params.id;
    
    const note = await EnquiryNote.create({
      enquiry_id: enquiryId,
      admin_id: req.admin.id,
      note_text
    });

    await EnquiryLog.create({
      enquiry_id: enquiryId,
      user_id: req.admin.id,
      action: 'Note Added',
      details: `Internal note added by ${req.admin.name}`
    });
    
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete internal note
// @route   DELETE /api/admin/enquiries/:id/notes/:noteId
// @access  Private (Admin)
export const deleteEnquiryNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    
    const note = await EnquiryNote.findOne({ where: { id: noteId, enquiry_id: id } });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    
    await note.destroy();

    await EnquiryLog.create({
      enquiry_id: id,
      user_id: req.admin.id,
      action: 'Note Deleted',
      details: `Internal note deleted by ${req.admin.name}`
    });
    
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Generate a Quote from an Enquiry
// @route   POST /api/admin/enquiries/:id/quote
// @access  Private (Admin)
export const generateQuoteFromEnquiry = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { amount, billingCycle, validityDays, adminNotes } = req.body;
    const enquiryId = req.params.id;

    const enquiry = await Enquiry.findByPk(enquiryId, { transaction });
    if (!enquiry) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    
    const { calculateSubscriptionPricing } = await import('../utils/pricingCalculator.js');
    const pricing = calculateSubscriptionPricing(amount, 1, 'Months');

    const newQuote = await Quote.create({
      user_id: enquiry.user_id || null,
      enquiry_id: enquiry.id,
      service_type: enquiry.type.replace('_', ' ').toUpperCase(),
      monthly_price: pricing.monthlySubscription,
      subtotal_price: pricing.contractValue,
      gst_amount: pricing.gstAmount,
      grand_total: pricing.totalPayable,
      duration_value: 1,
      duration_unit: 'Months',
      notes: adminNotes,
      status: 'quoted'
      // Store billingCycle and validityDays in JSON or extra fields if we had them.
    }, { transaction });

    enquiry.status = 'Quoted';
    await enquiry.save({ transaction });

    await EnquiryLog.create({
      enquiry_id: enquiry.id,
      user_id: req.admin.id,
      action: 'Quote Generated',
      details: `Quote created for $${amount} / ${billingCycle}. Validity: ${validityDays} days.`
    }, { transaction });

    await transaction.commit();

    res.status(201).json({ success: true, data: newQuote });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
