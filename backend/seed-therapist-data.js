/**
 * Seed script to populate the database with sample therapist data
 * Run inside Docker: docker exec react-waey-backend-dev-1 node seed-therapist-data.js
 */

async function seedTherapistData() {
  console.log('🌱 Starting therapist data seeding...');

  const mongoose = require('mongoose');
  const bcrypt = require('bcryptjs');
  
  // Connect to MongoDB
  const DB_URL = process.env.DATABASE_URL || 'mongodb://admin:password@mongo:27017/waey?authSource=admin';
  await mongoose.connect(DB_URL);
  console.log('✅ Connected to MongoDB');

  // Define schemas
  const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: 'therapist' },
    phone: String,
    countryCode: String,
    birthDate: Date,
    gender: String,
    licenseNumber: String,
    specialty: String,
    yearsOfExperience: Number,
    education: [String],
    certifications: [String],
    clinicAddress: String,
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  }, { timestamps: true });

  const sessionSchema = new mongoose.Schema({
    therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateTime: Date,
    duration: Number,
    type: { type: String, enum: ['individual', 'couple', 'family', 'group', 'follow-up'] },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'] },
    notes: String,
    price: Number,
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'] },
  }, { timestamps: true });

  const User = mongoose.model('User', userSchema);
  const Session = mongoose.model('Session', sessionSchema);

  // Create sample therapist if not exists
  const hashedPassword = await bcrypt.hash('Therapist123!', 10);

  const therapist = await User.findOneAndUpdate(
    { email: 'therapist@example.com' },
    {
      firstName: 'سارة',
      lastName: 'أحمد',
      email: 'therapist@example.com',
      password: hashedPassword,
      role: 'therapist',
      phone: '0501234567',
      countryCode: '+966',
      birthDate: new Date('1985-05-15'),
      gender: 'female',
      licenseNumber: 'THER-2020-12345',
      specialty: 'العلاج السلوكي المعرفي',
      yearsOfExperience: 8,
      education: ['دكتوراه في علم النفس السريري - جامعة الملك سعود'],
      certifications: ['شهادة العلاج المعرفي السلوكي', 'شهادة العلاج بالقبول والالتزام'],
      clinicAddress: 'الرياض، شارع التخصصي',
      isVerified: true,
      isApproved: true,
      isActive: true,
    },
    { upsert: true, new: true }
  );
  console.log(`✅ Created/Updated therapist: ${therapist.firstName} ${therapist.lastName} (${therapist.email})`);
  console.log(`   Password: Therapist123!`);

  // Create sample clients
  const clientsData = [
    { firstName: 'أحمد', lastName: 'محمد', email: 'ahmed@example.com', phone: '0501111111' },
    { firstName: 'نور', lastName: 'إبراهيم', email: 'nour@example.com', phone: '0502222222' },
    { firstName: 'محمد', lastName: 'علي', email: 'mohammed@example.com', phone: '0503333333' },
    { firstName: 'فاطمة', lastName: 'الحسن', email: 'fatima@example.com', phone: '0504444444' },
    { firstName: 'خالد', lastName: 'عبدالله', email: 'khaled@example.com', phone: '0505555555' },
  ];

  const clients = [];
  for (const clientData of clientsData) {
    const client = await User.findOneAndUpdate(
      { email: clientData.email },
      {
        ...clientData,
        password: await bcrypt.hash('Client123!', 10),
        role: 'user',
        birthDate: new Date(1990 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        gender: Math.random() > 0.5 ? 'male' : 'female',
        isVerified: true,
        isActive: true,
      },
      { upsert: true, new: true }
    );
    clients.push(client);
    console.log(`✅ Created client: ${client.firstName} ${client.lastName}`);
  }

  // Create sample sessions
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sessionsData = [
    // Today's sessions
    {
      clientId: clients[0]._id,
      dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      duration: 60,
      type: 'individual',
      status: 'confirmed',
      price: 300,
      paymentStatus: 'paid',
      notes: 'جلسة متابعة أسبوعية',
    },
    {
      clientId: clients[1]._id,
      dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
      duration: 45,
      type: 'couple',
      status: 'pending',
      price: 450,
      paymentStatus: 'pending',
    },
    {
      clientId: clients[2]._id,
      dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      duration: 60,
      type: 'follow-up',
      status: 'confirmed',
      price: 250,
      paymentStatus: 'paid',
    },
    // Tomorrow's sessions
    {
      clientId: clients[0]._id,
      dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0),
      duration: 60,
      type: 'individual',
      status: 'confirmed',
      price: 300,
      paymentStatus: 'pending',
    },
    {
      clientId: clients[3]._id,
      dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 16, 0),
      duration: 90,
      type: 'family',
      status: 'pending',
      price: 600,
      paymentStatus: 'pending',
    },
    // Past sessions (completed)
    {
      clientId: clients[0]._id,
      dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7, 10, 0),
      duration: 60,
      type: 'individual',
      status: 'completed',
      price: 300,
      paymentStatus: 'paid',
      notes: 'تحسن ملحوظ في أعراض القلق',
    },
    {
      clientId: clients[1]._id,
      dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5, 11, 30),
      duration: 45,
      type: 'couple',
      status: 'completed',
      price: 450,
      paymentStatus: 'paid',
      notes: 'جلسة علاج زواجي - تحسن في التواصل',
    },
    {
      clientId: clients[2]._id,
      dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 14, 0),
      duration: 60,
      type: 'individual',
      status: 'completed',
      price: 300,
      paymentStatus: 'paid',
    },
    {
      clientId: clients[3]._id,
      dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10, 16, 0),
      duration: 60,
      type: 'individual',
      status: 'completed',
      price: 300,
      paymentStatus: 'paid',
    },
    {
      clientId: clients[4]._id,
      dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14, 9, 0),
      duration: 60,
      type: 'follow-up',
      status: 'completed',
      price: 250,
      paymentStatus: 'paid',
    },
  ];

  for (const sessionData of sessionsData) {
    const session = new Session({
      therapistId: therapist._id,
      ...sessionData,
    });
    await session.save();
    console.log(`✅ Created session: ${session.dateTime.toISOString()} - ${session.type} (${session.status})`);
  }

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - 1 Therapist account`);
  console.log(`   - ${clients.length} Client accounts`);
  console.log(`   - ${sessionsData.length} Sessions (${sessionsData.filter(s => s.dateTime.toDateString() === today.toDateString()).length} today)`);
  console.log('\n🔐 Login credentials:');
  console.log(`   Therapist: therapist@example.com / Therapist123!`);
  console.log(`   Clients: [client email] / Client123!`);

  await mongoose.connection.close();
  console.log('\n👋 Database connection closed');
}

// Run the seed script
seedTherapistData().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
