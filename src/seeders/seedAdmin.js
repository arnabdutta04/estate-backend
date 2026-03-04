// ============================================================
// ADMIN SEEDER — seedAdmin.js
// Place in: backend/src/seeders/seedAdmin.js
//
// PURPOSE: Creates the first admin account since admin cannot
// self-register through the public registration form.
//
// USAGE: node src/seeders/seedAdmin.js
// ============================================================

require('dotenv').config();
const { sequelize } = require('../config/database');
const { User, Broker } = require('../models');

const seedAdmin = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // ============================================================
    // CHANGE THESE VALUES before running the seeder
    // ============================================================
    const adminData = {
      name: 'Super Admin',
      email: 'admin@propify.com',        // ← change this
      phone: '9999999999',               // ← change this
      password: 'Admin@123456',          // ← change this (min 6 chars)
      role: 'admin',
      isActive: true,
      balance: 0.00
    };
    // ============================================================

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { email: adminData.email }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin already exists with this email:', adminData.email);
      console.log('   Role:', existingAdmin.role);
      console.log('   To create a new admin, change the email in the seeder.');
      process.exit(0);
    }

    // Create admin user
    // Password will be auto-hashed by the User model's beforeCreate hook
    const admin = await User.create(adminData);

    console.log('');
    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Name    :', admin.name);
    console.log('   Email   :', admin.email);
    console.log('   Phone   :', admin.phone);
    console.log('   Role    :', admin.role);
    console.log('   ID      :', admin.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📋 Login credentials:');
    console.log('   Email   :', adminData.email);
    console.log('   Password:', adminData.password);
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();