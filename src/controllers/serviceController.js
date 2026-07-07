import { Service, Payment, User, AuditLog } from '../models/index.js';
import { dispatchLifecycleNotification } from '../utils/notificationEngine.js';

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

export const updateAdminServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g., 'Suspended', 'Active', 'Cancelled'

    const service = await Service.findByPk(id, { include: [{ model: User, as: 'user' }] });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const oldStatus = service.status;
    service.status = status;
    await service.save();

    await AuditLog.create({
      action: 'Admin Manual Service Update',
      action_by_user_id: req.user.id,
      target_user_id: service.user.id,
      entity_type: 'Service',
      entity_id: service.id,
      req,
      details: { old_status: oldStatus, new_status: status, reason: 'Admin Override' }
    });

    if (status === 'Suspended') {
      await dispatchLifecycleNotification(service.user, service, 'suspended', 0);
    } else if (status === 'Active' && oldStatus === 'Suspended') {
      await dispatchLifecycleNotification(service.user, service, 'reactivated', 0);
    }

    res.json({ success: true, message: `Service successfully marked as ${status}`, data: service });
  } catch (error) {
    console.error('Update service status error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
