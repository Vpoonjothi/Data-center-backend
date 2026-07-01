import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import { generateAdminToken } from '../utils/generateAdminToken.js';

// @desc    Auth admin & get token
// @route   POST /api/admin/auth/login
// @access  Public
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.scope('withPassword').findOne({ where: { email } });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateAdminToken(admin.id),
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get admin profile (Verify token)
// @route   GET /api/admin/auth/me
// @access  Private (Admin)
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.admin.id);
    
    if (admin) {
      res.json({
        success: true,
        data: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'Admin not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update admin password
// @route   PUT /api/admin/auth/password
// @access  Private (Admin)
export const updateAdminPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Please provide both current and new passwords' });
  }

  try {
    const admin = await Admin.scope('withPassword').findByPk(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    admin.password = newPassword;
    await admin.save();
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
