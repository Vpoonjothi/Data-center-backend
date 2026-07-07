import { Admin } from '../models/index.js';
import bcrypt from 'bcryptjs';

// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Private (SuperAdmin only)
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: ['id', 'name', 'email', 'role', 'created_at']
    });
    res.json({ success: true, data: admins });
  } catch (error) {
    console.error('Fetch admins error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a new admin
// @route   POST /api/admin/admins
// @access  Private (SuperAdmin only)
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const adminExists = await Admin.findOne({ where: { email } });
    if (adminExists) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    const admin = await Admin.create({
      name,
      email,
      password: password,
      role: role || 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ success: false, message: 'Failed to create admin' });
  }
};

// @desc    Delete an admin
// @route   DELETE /api/admin/admins/:id
// @access  Private (SuperAdmin only)
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Prevent deleting oneself
    if (admin.id === req.admin.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
    }

    // Prevent deleting the default superadmin if needed, but checking ID or email is safer
    if (admin.email === 'admin@greenleaf.com') {
      return res.status(400).json({ success: false, message: 'Cannot delete the default superadmin' });
    }

    await admin.destroy();

    res.json({ success: true, message: 'Admin removed successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete admin' });
  }
};

// @desc    Update an admin
// @route   PUT /api/admin/admins/:id
// @access  Private (SuperAdmin only)
export const updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const { name, email, role, password } = req.body;

    if (name) admin.name = name;
    if (email) {
      // Check if email is already taken by another admin
      const emailExists = await Admin.findOne({ where: { email } });
      if (emailExists && emailExists.id !== admin.id) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      admin.email = email;
    }
    if (role) admin.role = role;
    if (password) {
      admin.password = password;
    }

    await admin.save();

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ success: false, message: 'Failed to update admin' });
  }
};
