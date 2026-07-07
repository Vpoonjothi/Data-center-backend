import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import Admin from '../models/Admin.js';

export const isRegularAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, jwtConfig.secret);

      const admin = await Admin.findByPk(decoded.id);

      if (!admin) {
        return res.status(401).json({ success: false, message: 'Admin not found' });
      }

      if (admin.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only regular admins can access this route' });
      }

      req.admin = admin;

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};
