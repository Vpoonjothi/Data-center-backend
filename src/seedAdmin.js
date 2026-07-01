import Admin from './models/Admin.js';
import sequelize from './config/database.js';

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    // Sync models just in case
    await sequelize.sync({ alter: true });

    const existingAdmin = await Admin.findOne({ where: { email: 'admin@greenleaf.com' } });

    if (!existingAdmin) {
      await Admin.create({
        name: 'System Administrator',
        email: 'admin@greenleaf.com',
        password: 'greenleaf@123!', // This will be hashed by the model hook
        role: 'superadmin'
      });
      console.log('✅ Default admin user created successfully!');
      console.log('Email: admin@greenleaf.com');
      console.log('Password: greenleaf@123!');
    } else {
      existingAdmin.password = 'greenleaf@123!';
      await existingAdmin.save();
      console.log('ℹ️ Admin user already exists. Password has been updated to greenleaf@123!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed admin:', error);
    process.exit(1);
  }
};

seedAdmin();
