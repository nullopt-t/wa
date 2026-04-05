const mongoose = require('mongoose');

const hospitals = [
  { name: 'مستشفى الملك فهد', phone: '+966 11 234 5678', email: 'info@kfhd.edu.sa', address: 'الرياض، حي العليا', type: 'hospital', notes: 'مستشفى حكومي متخصص' },
  { name: 'مستشفى الملك خالد', phone: '+966 11 345 6789', email: 'contact@kkh.sa', address: 'الرياض، حي النخيل', type: 'hospital', notes: 'مستشفى جامعي' },
  { name: 'مستشفى سليمان الحبيب', phone: '+966 11 456 7890', email: 'info@solimanalhabib.com', address: 'الرياض، طريق الملك فهد', type: 'hospital', notes: 'مستشفى خاص' },
  { name: 'مستشفى الدكتور سليمان فقيه', phone: '+966 12 567 8901', email: 'info@sfh.sa', address: 'جدة، حي السلامة', type: 'hospital', notes: 'مستشفى متخصص' },
  { name: 'مستشفى الملك عبدالعزيز الجامعي', phone: '+966 12 678 9012', email: 'info@kauh.sa', address: 'جدة، حي الزهراء', type: 'hospital', notes: 'مستشفى جامعي' },
  { name: 'مستشفى قوى الأمن', phone: '+966 11 789 0123', email: 'info@moh.gov.sa', address: 'الرياض، حي الملز', type: 'hospital', notes: 'مستشفى حكومي' },
  { name: 'مستشفى الحبيب بالرياض', phone: '+966 11 890 1234', email: 'riyadh@alhabib.sa', address: 'الرياض، حي الورود', type: 'hospital', notes: 'مستشفى خاص' },
  { name: 'مستشفى المملكة', phone: '+966 11 901 2345', email: 'info@almamlaka.sa', address: 'الرياض، طريق خريص', type: 'hospital', notes: 'مستشفى خاص' },
  { name: 'مستشفى دله', phone: '+966 11 012 3456', email: 'info@dallah.sa', address: 'الرياض، حي النرجس', type: 'hospital', notes: 'مستشفى خاص' },
  { name: 'مستشفى السعودي الألماني', phone: '+966 12 123 4567', email: 'info@sghgroup.sa', address: 'جدة، حي الروضة', type: 'hospital', notes: 'مستشفى متخصص' },
];

const clinics = [
  { name: 'عيادة الصحة النفسية', phone: '+966 12 345 6789', email: 'clinic@health.sa', address: 'جدة، حي الحمراء', type: 'clinic' },
  { name: 'مركز الرياض للصحة النفسية', phone: '+966 11 111 2222', email: 'info@rphc.sa', address: 'الرياض، حي السليمانية', type: 'clinic' },
  { name: 'عيادة الدكتور محمد العتيبي', phone: '+966 11 222 3333', email: 'dr.otaibi@clinic.sa', address: 'الرياض، حي الملقا', type: 'clinic' },
  { name: 'مركز الوعي النفسي', phone: '+966 55 333 4444', email: 'info@waaey-clinic.sa', address: 'الدمام، حي الفيصلية', type: 'clinic' },
  { name: 'عيادة السلوك المعرفي', phone: '+966 12 444 5555', email: 'cbt@clinic.sa', address: 'جدة، حي الأندلس', type: 'clinic' },
  { name: 'مركز التميز النفسي', phone: '+966 11 555 6666', email: 'info@excel-psych.sa', address: 'الرياض، حي العليا', type: 'clinic' },
  { name: 'عيادة العائلة النفسية', phone: '+966 50 666 7777', email: 'family@clinic.sa', address: 'الطائف، حي شهار', type: 'clinic' },
  { name: 'مركز الهدوء النفسي', phone: '+966 11 777 8888', email: 'info@calm-psych.sa', address: 'الرياض، حي النخيل', type: 'clinic' },
  { name: 'عيادة الأمل النفسي', phone: '+966 55 888 9999', email: 'hope@clinic.sa', address: 'الدمام، حي المريكبات', type: 'clinic' },
  { name: 'مركز التوازن النفسي', phone: '+966 12 999 0000', email: 'info@balance.sa', address: 'جدة، حي النزهة', type: 'clinic' },
];

const doctors = [
  { name: 'د. أحمد محمد', phone: '+966 55 123 4567', email: 'dr.ahmed@clinic.sa', address: 'الدمام، شارع المستشفيات', type: 'doctor', notes: 'استشاري طب نفسي' },
  { name: 'د. فاطمة الزهراني', phone: '+966 50 234 5678', email: 'dr.fatima@clinic.sa', address: 'الرياض، حي العليا', type: 'doctor', notes: 'أخصائية نفسية' },
  { name: 'د. خالد العنزي', phone: '+966 55 345 6789', email: 'dr.khalid@clinic.sa', address: 'جدة، حي الحمراء', type: 'doctor', notes: 'استشاري علاج نفسي' },
  { name: 'د. نورة الشمري', phone: '+966 50 456 7890', email: 'dr.noura@clinic.sa', address: 'الرياض، حي السليمانية', type: 'doctor', notes: 'أخصائية أطفال' },
  { name: 'د. عمر الدوسري', phone: '+966 55 567 8901', email: 'dr.omar@clinic.sa', address: 'الدمام، حي الفيصلية', type: 'doctor', notes: 'استشاري إدمان' },
  { name: 'د. سارة القحطاني', phone: '+966 50 678 9012', email: 'dr.sara@clinic.sa', address: 'جدة، حي السلامة', type: 'doctor', notes: 'أخصائية علاج سلوكي' },
  { name: 'د. عبدالله المالكي', phone: '+966 55 789 0123', email: 'dr.abdullah@clinic.sa', address: 'الرياض، حي الملقا', type: 'doctor', notes: 'استشاري نفسي' },
  { name: 'د. منال الحربي', phone: '+966 50 890 1234', email: 'dr.manal@clinic.sa', address: 'الطائف، حي شهار', type: 'doctor', notes: 'أخصائية اكتئاب وقلق' },
  { name: 'د. يوسف الغامدي', phone: '+966 55 901 2345', email: 'dr.yousef@clinic.sa', address: 'الدمام، حي المريكبات', type: 'doctor', notes: 'استشاري طب نفسي للأطفال' },
  { name: 'د. هند السبيعي', phone: '+966 50 012 3456', email: 'dr.hind@clinic.sa', address: 'جدة، حي الروضة', type: 'doctor', notes: 'أخصائية علاج أسري' },
  { name: 'د. محمد الراشد', phone: '+966 55 111 2222', email: 'dr.rashed@clinic.sa', address: 'الرياض، حي النخيل', type: 'doctor', notes: 'استشاري نفسي' },
  { name: 'د. ريم العلي', phone: '+966 50 222 3333', email: 'dr.reem@clinic.sa', address: 'جدة، حي الأندلس', type: 'doctor', notes: 'أخصائية علاج نفسي' },
  { name: 'د. عبدالرحمن الفهد', phone: '+966 55 333 4444', email: 'dr.fahd@clinic.sa', address: 'الرياض، حي العليا', type: 'doctor', notes: 'استشاري إدمان' },
  { name: 'د. لمى الشهري', phone: '+966 50 444 5555', email: 'dr.lama@clinic.sa', address: 'الدمام، حي الفيصلية', type: 'doctor', notes: 'أخصائية أطفال ومراهقين' },
  { name: 'د. طلال البلوي', phone: '+966 55 555 6666', email: 'dr.talal@clinic.sa', address: 'جدة، حي النزهة', type: 'doctor', notes: 'استشاري نفسي' },
  { name: 'د. أمل الجهني', phone: '+966 50 666 7777', email: 'dr.amal@clinic.sa', address: 'الرياض، حي الورود', type: 'doctor', notes: 'أخصائية اكتئاب' },
  { name: 'د. سلطان المطيري', phone: '+966 55 777 8888', email: 'dr.sultan@clinic.sa', address: 'الطائف، حي شهار', type: 'doctor', notes: 'استشاري طب نفسي' },
  { name: 'د. غادة الثبيتي', phone: '+966 50 888 9999', email: 'dr.ghada@clinic.sa', address: 'جدة، حي الزهراء', type: 'doctor', notes: 'أخصائية علاج زوجي' },
  { name: 'د. نايف الرشيدي', phone: '+966 55 999 0000', email: 'dr.naif@clinic.sa', address: 'الرياض، حي النرجس', type: 'doctor', notes: 'استشاري نفسي' },
  { name: 'د. هالة العتيبي', phone: '+966 50 101 0101', email: 'dr.hala@clinic.sa', address: 'الدمام، حي المريكبات', type: 'doctor', notes: 'أخصائية سلوك معرفي' },
];

async function seed() {
  try {
    const MONGO_URI = process.env.DATABASE_URL || 'mongodb+srv://am3:1eIqrJjUcMnLf7Uf@cluster0.vxkphtj.mongodb.net/waey';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully');

    const allContacts = [
      ...hospitals.map(h => ({ ...h, isActive: true, notes: h.notes || '' })),
      ...clinics.map(c => ({ ...c, isActive: true, notes: c.notes || '' })),
      ...doctors.map(d => ({ ...d, isActive: true, notes: d.notes || '' })),
    ];

    const MedicalContact = mongoose.model('MedicalContact', new mongoose.Schema({
      name: String,
      phone: String,
      email: String,
      address: String,
      type: String,
      isActive: Boolean,
      notes: String,
    }, { timestamps: true }));

    // Clear existing
    await MedicalContact.deleteMany({});
    console.log('Cleared existing contacts');

    // Insert all
    await MedicalContact.insertMany(allContacts);
    console.log(`✅ Seeded ${allContacts.length} medical contacts:`);
    console.log(`   - ${hospitals.length} hospitals`);
    console.log(`   - ${clinics.length} clinics`);
    console.log(`   - ${doctors.length} doctors`);

    await mongoose.disconnect();
    console.log('Disconnected successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seed();
