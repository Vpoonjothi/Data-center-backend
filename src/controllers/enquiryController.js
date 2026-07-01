import { Enquiry, EnquiryResponse, Admin } from '../models/index.js';

// @desc    Submit a new contact/support enquiry
// @route   POST /api/enquiries
// @access  Public
export const submitEnquiry = async (req, res) => {
  try {
    const { name, email, company, message, type } = req.body;

    const newEnquiry = await Enquiry.create({
      name,
      email,
      company,
      message,
      configuration_json: req.body.configuration_json || null,
      type: type || 'contact',
      user_id: req.user ? req.user.id : null, // If logged in, attach user
    });

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
