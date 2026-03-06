/**
 * Seed Admin User Script
 * Run: node seed-admin-user.js
 * 
 * Creates an admin user for testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@mongo:27017/waey?authSource=admin';

// Admin user data
const adminData = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@waey.com',
  password: 'admin123', // Change this in production!
  role: 'admin',
  phone: '01000000000',
  countryCode: '+20',
  isVerified: true,
  isActive: true,
  isProfilePublic: false,
};

async function seedAdminUser() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create User model
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      password: String,
      firstName: String,
      lastName: String,
      role: String,
      phone: String,
      countryCode: String,
      isVerified: Boolean,
      isActive: Boolean,
      isProfilePublic: Boolean,
      avatar: String,
      bio: String,
    }, { timestamps: true }));

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${adminData.email}`);
      console.log(`   Password: admin123`);
      console.log('\nTo update the password, delete this user first or use a different email.');
      await mongoose.disconnect();
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);
    console.log('✅ Password hashed');

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      ...adminData,
      password: hashedPassword,
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

    await mongoose.disconnect();
    console.log('\n✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
}

// Run the seed function
seedAdminUser();
