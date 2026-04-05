const mongoose = require('mongoose');

const cities = ['الرياض','جدة','الدمام','مكة','المدينة','الطائف','تبوك','أبها','القصيم','حائل','نجران','جازان'];
const districts = ['العليا','النخيل','الملقا','السليمانية','الورود','النرجس','الروضة','الزهراء','السلامة','الحمراء','الأندلس','النزهة','الفيصلية','المريكبات','شهار','الخالدية','العزيزية','المروج'];
const hospitalPrefixes = ['مستشفى الملك','مستشفى الأمل','مستشفى النور','مستشفى الشفاء','مستشفى الحياة','مستشفى الرعاية','مستشفى الإيمان','مستشفى السلام','مستشفى الوفاء','مستشفى الرازي','مستشفى ابن سينا','مستشفى الزهراء','مستشفى الحكمة','مستشفى العناية','مستشفى المستقبل'];
const clinicPrefixes = ['مركز الصحة النفسية','عيادة الهدوء','مركز التوازن','عيادة الأمل','مركز السكينة','عيادة الطمأنينة','مركز التعافي','عيادة الراحة','مركز السلام النفسي','عيادة السلوك الإيجابي','مركز الدعم النفسي','عيادة الإرشاد','مركز التأهيل النفسي','عيادة الصحة السلوكية','مركز العناية النفسية'];
const doctorFirstNames = ['أحمد','محمد','خالد','عمر','فاطمة','نورة','سارة','عبدالله','يوسف','منال','هند','ريم','سلطان','غادة','نايف','هالة','عبدالرحمن','لمى','طلال','أمل','فهد','دانة','ماجد','ريما','بندر','جواهر','تركي','لمياء','سعود','عبير','وليد','سميرة','إبراهيم','حنان','صالح','نجلاء','عادل','رانيا','حسن','ياسمين'];
const doctorLastNames = ['العتيبي','الشهري','القحطاني','المالكي','الحربي','الغامدي','الدوسري','الزهراني','السبيعي','الراشد','البلوي','المطيري','الثبيتي','الرشيدي','الجهني','الفهد','العنزي','الشمري','العمري','السالم','الناصر','الحميد','الفوزان','السهلي','الموسى','الوهيب','العبدالله','الصابر','المحمد','الخالدي','البقمي','السعيد','الحميدان','الدغيم','المحيميد','الجبر','المنصور','العكيمي','الشثري','المقبول'];
const specialties = ['استشاري طب نفسي','أخصائية علاج سلوكي','استشاري إدمان','أخصائي أطفال ومراهقين','أخصائي اكتئاب وقلق','استشاري علاج أسري','أخصائية نفسية','استشاري نفسي','أخصائي علاج معرفي','أخصائية اضطرابات النوم','استشاري طب نفسي للأطفال','أخصائي فرط الحركة','أخصائية تأهيل نفسي','استشاري علاج زوجي','أخصائية صحة نفسية'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function phone() { return '+966 ' + (10 + Math.floor(Math.random() * 90)) + ' ' + String(Math.floor(Math.random() * 10000000)).padStart(7, '0'); }

const contacts = [];

// 30 hospitals
for (let i = 0; i < 30; i++) {
  const city = cities[i % cities.length];
  const district = districts[Math.floor(Math.random() * districts.length)];
  const name = hospitalPrefixes[i % hospitalPrefixes.length] + (i >= hospitalPrefixes.length ? ' ' + (i + 1) : '') + ' - ' + city;
  contacts.push({ name, phone: phone(), email: `hospital${i}@med.sa`, address: `${city}، حي ${district}`, type: 'hospital', isActive: true, notes: '' });
}

// 30 clinics
for (let i = 0; i < 30; i++) {
  const city = cities[i % cities.length];
  const district = districts[Math.floor(Math.random() * districts.length)];
  const name = clinicPrefixes[i % clinicPrefixes.length] + (i >= clinicPrefixes.length ? ' ' + (i + 1) : '') + ' - ' + city;
  contacts.push({ name, phone: phone(), email: `clinic${i}@med.sa`, address: `${city}، حي ${district}`, type: 'clinic', isActive: true, notes: '' });
}

// 40 doctors
for (let i = 0; i < 40; i++) {
  const city = cities[i % cities.length];
  const district = districts[Math.floor(Math.random() * districts.length)];
  const fn = doctorFirstNames[i % doctorFirstNames.length];
  const ln = doctorLastNames[Math.floor(Math.random() * doctorLastNames.length)];
  const sp = specialties[Math.floor(Math.random() * specialties.length)];
  contacts.push({ name: `د. ${fn} ${ln}`, phone: phone(), email: `dr${i}@med.sa`, address: `${city}، حي ${district}`, type: 'doctor', isActive: true, notes: sp });
}

async function seed() {
  try {
    const MONGO_URI = process.env.DATABASE_URL || 'mongodb+srv://am3:1eIqrJjUcMnLf7Uf@cluster0.vxkphtj.mongodb.net/waey';
    console.log('Connecting...');
    await mongoose.connect(MONGO_URI);

    const schema = new mongoose.Schema({ name: String, phone: String, email: String, address: String, type: String, isActive: Boolean, notes: String }, { timestamps: true });
    const Model = mongoose.model('MedicalContact', schema);

    // Don't delete existing — just append
    await Model.insertMany(contacts);
    console.log(`✅ Added ${contacts.length} more contacts`);

    const total = await Model.countDocuments();
    const hospitals = await Model.countDocuments({ type: 'hospital' });
    const clinics = await Model.countDocuments({ type: 'clinic' });
    const doctors = await Model.countDocuments({ type: 'doctor' });
    console.log(`📊 Total in DB: ${total} (${hospitals} hospitals, ${clinics} clinics, ${doctors} doctors)`);

    await mongoose.disconnect();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seed();
