import { Enquiry, EnquiryResponse, Admin } from '../models/index.js';
import { dispatchNotification } from '../utils/notificationDispatcher.js';

// @desc    Submit a new contact/support enquiry
// @route   POST /api/enquiries
// @access  Public
export const submitEnquiry = async (req, res) => {
  try {
    const { name, email, company, message, type, request_action } = req.body;

    let enqName = name;
    let enqEmail = email;
    let enqCompany = company;
    let enqPhone = req.body.phone;

    if (req.user) {
      // Prioritize authenticated user details to prevent spoofing or double-entry
      enqName = req.user.name || name;
      enqEmail = req.user.email || email;
      enqCompany = req.user.company || company;
      enqPhone = req.user.phone || req.body.phone;
    }

    const newEnquiry = await Enquiry.create({
      name: enqName,
      email: enqEmail,
      company: enqCompany,
      phone: enqPhone,
      message,
      configuration_json: req.body.configuration_json || null,
      type: type || 'contact',
      request_action: request_action || 'GENERAL_ENQUIRY',
      user_id: req.user ? req.user.id : null, // If logged in, attach user
    });

    // Notify all admins via centralized dispatcher
    const admins = await Admin.findAll();
    for (const admin of admins) {
      await dispatchNotification({
        userId: admin.id,
        userType: 'admin',
        category: 'Sales Requests',
        priority: 'high',
        title: 'New Enquiry / Sales Request',
        message: `${enqCompany || enqName} submitted a new request for ${type.toUpperCase()}.`,
        relatedModule: 'Enquiry',
        relatedRecordId: newEnquiry.id,
        actionUrl: `/admin/enquiries/${newEnquiry.id}`,
        sendEmailFlag: true,
        actionText: 'View Request'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: newEnquiry
    });
  } catch (error) {
    console.error('Submit enquiry error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit enquiry' });
  }
};

// @desc    Get logged in user's enquiries
// @route   GET /api/enquiries/me
// @access  Private
export const getMyEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: EnquiryResponse,
          as: 'responses',
          include: [{ model: Admin, as: 'admin', attributes: ['id', 'name'] }]
        }
      ],
      order: [
        ['created_at', 'DESC'],
        [{ model: EnquiryResponse, as: 'responses' }, 'created_at', 'ASC']
      ]
    });

    res.json({
      success: true,
      data: enquiries
    });
  } catch (error) {
    console.error('Fetch user enquiries error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
