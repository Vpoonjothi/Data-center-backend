import { Service, Payment, User } from '../models/index.js';

export const getMyServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { user_id: req.user.id },
      order: [['start_date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Get my services error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] }
      ],
      order: [['start_date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
};
