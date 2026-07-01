import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

export const generateAdminToken = (adminId) => {
  return jwt.sign({ id: adminId, role: 'admin' }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};
