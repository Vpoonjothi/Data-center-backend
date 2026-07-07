import { Admin } from '../models/index.js';

export const isSuperAdmin = async (req, res, next) => {
  try {
    // req.admin should already be set by the isAdmin middleware (or protect middleware for admins)
    // But to be safe, let's ensure req.admin exists
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Not authorized as admin' });
    }

    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Superadmin privileges required' });
    }

    next();
  } catch (error) {
    console.error('isSuperAdmin middleware error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
