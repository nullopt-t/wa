const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect(process.env.DATABASE_URL || 'mongodb+srv://hedrsag:test@cluster0.ysstcmo.mongodb.net/test').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    role: String,
    isVerified: Boolean,
    isApproved: Boolean,
  }), 'users');
  
  // Hash password properly
  const hashedPassword = await bcrypt.hash('Test1234!', 10);
  
  // Create test therapist with proper data
  const user = await User.create({
    firstName: 'Test',
    lastName: 'Therapist',
    email: 'test.therapist.api@example.com',
    password: hashedPassword,
    role: 'therapist',
    isVerified: true,
    isApproved: true,
    isActive: true,
  });
  
  console.log('✅ Created test therapist:');
  console.log('Email:', user.email);
  console.log('ID:', user._id.toString());
  console.log('isApproved:', user.isApproved);
  console.log('');
  console.log('Test login with curl:');
  console.log('curl -X POST http://localhost:4001/api/auth/login -H "Content-Type: application/json" -d \'{"email":"' + user.email + '","password":"Test1234!"}\'');
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
