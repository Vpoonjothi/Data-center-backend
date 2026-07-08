import User from '../models/User.js';
import { matchPassword } from '../utils/passwordHelper.js';
import { generateToken } from '../utils/generateToken.js';
import { dispatchNotification } from '../utils/notificationDispatcher.js';
import Admin from '../models/Admin.js';

export const registerUser = async (userData) => {
  const { name, email, phone, password, terms } = userData;

  if (!terms) {
    throw new Error('You must accept the Terms and Conditions');
  }

  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    throw new Error('Email already in use');
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    terms_accepted: true,
    terms_accepted_at: new Date(),
  });

  // 1. Notify Customer (Welcome) - Fire and forget to prevent delay
  dispatchNotification({
    userId: user.id,
    userType: 'customer',
    category: 'Account',
    priority: 'low',
    title: 'Welcome to GreenLeaf Data Center!',
    message: 'Thank you for creating an account with us. You can now request quotes and manage your services.',
    relatedModule: 'User',
    relatedRecordId: user.id,
    actionUrl: '/dashboard/profile',
    sendEmailFlag: true,
    actionText: 'Complete Your Profile'
  }).catch(console.error);

  // 2. Notify all Admins - Fire and forget to prevent delay
  const admins = await Admin.findAll();
  admins.forEach(admin => {
    dispatchNotification({
      userId: admin.id,
      userType: 'admin',
      category: 'Account',
      priority: 'medium',
      title: 'New Customer Registration',
      message: `${name} (${email}) has just registered a new account.`,
      relatedModule: 'User',
      relatedRecordId: user.id,
      actionUrl: `/admin/users/${user.id}`,
      sendEmailFlag: true,
      actionText: 'View Customer Profile'
    }).catch(console.error);
  });

  return {
    success: true,
    message: 'Account created successfully',
  };
};

export const loginUser = async (email, password) => {
  // Using the scope to include password for verification
  const user = await User.scope('withPassword').findOne({ where: { email } });

  if (user && (await matchPassword(password, user.password))) {
    // update last_login
    user.last_login = new Date();
    await user.save();

    const userObj = user.toJSON();
    delete userObj.password;

    // Notify all Admins that user logged in - Fire and forget
    const admins = await Admin.findAll();
    admins.forEach(admin => {
      dispatchNotification({
        userId: admin.id,
        userType: 'admin',
        category: 'System',
        priority: 'low',
        title: 'Customer Logged In',
        message: `${user.name} (${user.email}) has just logged into the portal.`,
        relatedModule: 'User',
        relatedRecordId: user.id,
        actionUrl: `/admin/users/${user.id}`,
        sendEmailFlag: false
      }).catch(console.error);
    });

    return {
      success: true,
      token: generateToken(user.id),
      user: userObj,
    };
  } else {
    throw new Error('Invalid email or password');
  }
};

export const getUserProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: [
      'name', 'email', 'phone', 'role', 'status', 'createdAt',
      'alternate_mobile', 'designation',
      'company', 'business_type', 'gst_number', 'website', 'industry',
      'address_line1', 'address_line2', 'city', 'state', 'country', 'pin_code',
      'service_requirement_type', 'expected_deployment_date', 'monthly_budget_range',
      'kyc_document_type', 'kyc_document_number', 'kyc_front_upload', 'kyc_back_upload', 'kyc_verification_status'
    ],
  });

  if (user) {
    return user;
  } else {
    throw new Error('User not found');
  }
};

export const updateUserProfile = async (userId, updateData) => {
  const user = await User.findByPk(userId);

  if (user) {
    const fieldsToUpdate = [
      'name', 'phone', 'alternate_mobile', 'designation',
      'company', 'business_type', 'gst_number', 'website', 'industry',
      'address_line1', 'address_line2', 'city', 'state', 'country', 'pin_code',
      'service_requirement_type', 'expected_deployment_date', 'monthly_budget_range',
      'kyc_document_type', 'kyc_document_number', 'kyc_front_upload', 'kyc_back_upload'
    ];

    fieldsToUpdate.forEach(field => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });

    const updatedUser = await user.save();
    
    // Refresh without password
    const userObj = updatedUser.toJSON();
    delete userObj.password;

    return {
      success: true,
      message: 'Profile updated successfully',
      user: userObj
    };
  } else {
    throw new Error('User not found');
  }
};
