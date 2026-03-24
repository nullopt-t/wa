/**
 * Simple seed script for assessments
 * Run with: node seed-assessments-standalone.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection - use DATABASE_URL from .env
const DATABASE_URL = process.env.DATABASE_URL;

const assessments = [
  {
    code: 'PHQ-9',
    name: 'Patient Health Questionnaire-9',
    nameAr: 'استبيان صحة المريض-9',
    description: 'A widely used screening tool for depression severity',
    descriptionAr: 'أداة فحص شائعة لشدة أعراض الاكتئاب',
    category: 'depression',
    minScore: 0,
    maxScore: 27,
    severityLevels: [
      { minScore: 0, maxScore: 4, severity: 'None/Minimal', severityAr: 'طبيعي', color: 'green', description: 'No significant depression symptoms', descriptionAr: 'لا توجد أعراض اكتئاب كبيرة' },
      { minScore: 5, maxScore: 9, severity: 'Mild', severityAr: 'خفيف', color: 'yellow', description: 'Mild depression symptoms', descriptionAr: 'أعراض اكتئاب خفيفة' },
      { minScore: 10, maxScore: 14, severity: 'Moderate', severityAr: 'متوسط', color: 'orange', description: 'Moderate depression', descriptionAr: 'اكتئاب متوسط' },
      { minScore: 15, maxScore: 19, severity: 'Moderately Severe', severityAr: 'شديد', color: 'red', description: 'Severe depression', descriptionAr: 'اكتئاب شديد' },
      { minScore: 20, maxScore: 27, severity: 'Severe', severityAr: 'شديد جداً', color: 'dark-red', description: 'Very severe depression', descriptionAr: 'اكتئاب شديد جداً' },
    ],
    questions: [
      { order: 1, text: 'Little interest or pleasure in doing things', textAr: 'قلة الاهتمام أو المتعة في فعل الأشياء', options: [{ value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' }, { value: 1, text: 'Several days', textAr: 'عدة أيام' }, { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' }, { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' }] },
      { order: 2, text: 'Feeling down, depressed, or hopeless', textAr: 'الشعور بالحزن أو الاكتئاب أو اليأس', options: [{ value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' }, { value: 1, text: 'Several days', textAr: 'عدة أيام' }, { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' }, { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' }] },
      { order: 3, text: 'Trouble falling or staying asleep, or sleeping too much', textAr: 'صعوبة في النوم أو البقاء نائماً، أو النوم كثيراً', options: [{ value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' }, { value: 1, text: 'Several days', textAr: 'عدة أيام' }, { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' }, { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' }] },
      { order: 4, text: 'Feeling tired or having little energy', textAr: 'الشعور بالتعب أو قلة الطاقة', options: [{ value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' }, { value: 1, text: 'Several days', textAr: 'عدة أيام' }, { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' }, { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' }] },
      { order: 5, text: 'Poor appetite or overeating', textAr: 'ضعف الشهية أو الإفراط في الأكل', options: [{ value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' }, { value: 1, text: 'Several days', textAr: 'عدة أيام' }, { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' }, { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' }] },
      { order: 6, text: 'Feeling bad about yourself', textAr: 'الشعور بسوء تجاه نفسك', options: [{ value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' }, { value: 1, text: 'Several days', textAr: 'عدة أيام' }, { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' }, { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' }] },
      { order: 7, text: 'Trouble concentrating on things', textAr: 'صعوبة في التركيز على الأشياء', options: [{ value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' }, { value: 1, text: 'Several days', textAr: 'عدة أيام' }, { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' }, { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' }] },
      { order: 8, text: 'Moving or speaking slowly or being fidgety/restless', textAr: 'التحرك أو التحدث ببطء أو كونك متوتراً', options: [{ value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' }, { value: 1, text: 'Several days', textAr: 'عدة أيام' }, { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' }, { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' }] },
      { order: 9, text: 'Thoughts that you would be better off dead or hurting yourself', textAr: 'أفكار بأنك ستكون أفضل ميتاً أو إيذاء نفسك', options: [{ value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' }, { value: 1, text: 'Several days', textAr: 'عدة أيام' }, { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' }, { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' }] },
    ],
  },
  {
    code: 'GAD-7',
    name: 'Generalized Anxiety Disorder-7',
    nameAr: 'اضطراب القلق العام-7',
    description: 'A screening tool for anxiety severity',
    descriptionAr: 'أداة فحص لشدة القلق',
    category: 'anxiety',
    minScore: 0,
    maxScore: 21,
    severityLevels: [
      { minScore: 0, maxScore: 4, severity: 'None/Minimal', severityAr: 'طبيعي', color: 'green', description: 'No significant anxiety symptoms', descriptionAr: 'لا توجد أعراض قلق كبيرة' },
      { minScore: 5, maxScore: 9, severity: 'Mild', severityAr: 'خفيف', color: 'yellow', description: 'Mild anxiety symptoms', descriptionAr: 'أعراض قلق خفيفة' },
      { minScore: 10, maxScore: 14, severity: 'Moderate', severityAr: 'متوسط', color: 'orange', description: 'Moderate anxiety', descriptionAr: 'قلق متوسط' },
      { minScore: 15, maxScore: 21, severity: 'Severe', severityAr: 'شديد', color: 'red', description: 'Severe anxiety', descriptionAr: 'قلق شديد' },
    ],
    questions: [
      { order: 1, text: 'Feeling nervous, anxious, or on edge', textAr: 'الشعور بالتوتر أو القلق', options: [{ value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' }, { value: 1, text: 'Several days', textAr: 'عدة أيام' }, { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' }, { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' }] },
      { order: 2, text: 'Not being able to stop or control worrying', textAr: 'عدم القدرة على التوقف عن القلق', options: [{ value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' }, { value: 1, text: 'Several days', textAr: 'عدة أيام' }, { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' }, { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' }] },
      { order: 3, text: 'Worrying too much about different things', textAr: 'القلق المفرط بشأن أشياء مختلفة', options: [{ value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' }, { value: 1, text: 'Several days', textAr: 'عدة أيام' }, { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' }, { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' }] },
      { order: 4, text: 'Trouble relaxing', textAr: 'صعوبة في الاسترخاء', options: [{ value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' }, { value: 1, text: 'Several days', textAr: 'عدة أيام' }, { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' }, { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' }] },
      { order: 5, text: 'Being so restless that it is hard to sit still', textAr: 'القلق لدرجة صعوبة الجلوس', options: [{ value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' }, { value: 1, text: 'Several days', textAr: 'عدة أيام' }, { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' }, { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' }] },
      { order: 6, text: 'Becoming easily annoyed or irritable', textAr: 'الانزعاج أو الغضب بسهولة', options: [{ value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' }, { value: 1, text: 'Several days', textAr: 'عدة أيام' }, { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' }, { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' }] },
      { order: 7, text: 'Feeling afraid as if something awful might happen', textAr: 'الشعور بالخوف من شيء فظيع', options: [{ value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' }, { value: 1, text: 'Several days', textAr: 'عدة أيام' }, { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' }, { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' }] },
    ],
  },
  {
    code: 'PSS-4',
    name: 'Perceived Stress Scale-4',
    nameAr: 'مقياس الإجهاد المدرك-4',
    description: 'A short screening tool for perceived stress',
    descriptionAr: 'أداة فحص قصيرة للإجهاد المدرك',
    category: 'stress',
    minScore: 0,
    maxScore: 16,
    severityLevels: [
      { minScore: 0, maxScore: 4, severity: 'Low', severityAr: 'منخفض', color: 'green', description: 'Low stress levels', descriptionAr: 'مستويات إجهاد منخفضة' },
      { minScore: 5, maxScore: 8, severity: 'Moderate', severityAr: 'متوسط', color: 'yellow', description: 'Moderate stress levels', descriptionAr: 'مستويات إجهاد متوسطة' },
      { minScore: 9, maxScore: 12, severity: 'High', severityAr: 'مرتفع', color: 'orange', description: 'High stress levels', descriptionAr: 'مستويات إجهاد مرتفعة' },
      { minScore: 13, maxScore: 16, severity: 'Very High', severityAr: 'مرتفع جداً', color: 'red', description: 'Very high stress levels', descriptionAr: 'مستويات إجهاد مرتفعة جداً' },
    ],
    questions: [
      { order: 1, text: 'Felt unable to control important things in your life', textAr: 'شعرت أنك غير قادر على التحكم في الأشياء المهمة', options: [{ value: 0, text: 'Never', textAr: 'أبداً' }, { value: 1, text: 'Sometimes', textAr: 'أحياناً' }, { value: 2, text: 'Often', textAr: 'غالباً' }, { value: 3, text: 'Very Often', textAr: 'غالباً جداً' }] },
      { order: 2, text: 'Felt confident about your ability to handle personal problems', textAr: 'شعرت بالثقة في قدرتك على التعامل مع مشاكلك', options: [{ value: 3, text: 'Never', textAr: 'أبداً' }, { value: 2, text: 'Sometimes', textAr: 'أحياناً' }, { value: 1, text: 'Often', textAr: 'غالباً' }, { value: 0, text: 'Very Often', textAr: 'غالباً جداً' }] },
      { order: 3, text: 'Felt that things were going your way', textAr: 'شعرت أن الأمور تسير في طريقك', options: [{ value: 3, text: 'Never', textAr: 'أبداً' }, { value: 2, text: 'Sometimes', textAr: 'أحياناً' }, { value: 1, text: 'Often', textAr: 'غالباً' }, { value: 0, text: 'Very Often', textAr: 'غالباً جداً' }] },
      { order: 4, text: 'Felt difficulties were piling up so high that you could not overcome them', textAr: 'شعرت أن الصعوبات تتراكم لدرجة لا يمكنك التغلب عليها', options: [{ value: 0, text: 'Never', textAr: 'أبداً' }, { value: 1, text: 'Sometimes', textAr: 'أحياناً' }, { value: 2, text: 'Often', textAr: 'غالباً' }, { value: 3, text: 'Very Often', textAr: 'غالباً جداً' }] },
    ],
  },
];

const assessmentSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: String,
  nameAr: String,
  description: String,
  descriptionAr: String,
  category: String,
  minScore: Number,
  maxScore: Number,
  severityLevels: [{ minScore: Number, maxScore: Number, severity: String, severityAr: String, color: String, description: String, descriptionAr: String }],
  timesTaken: { type: Number, default: 0 },
}, { timestamps: true });

const questionSchema = new mongoose.Schema({
  assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  order: Number,
  text: String,
  textAr: String,
  options: [{ value: Number, text: String, textAr: String }],
}, { timestamps: true });

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(DATABASE_URL);
  console.log('✅ Connected to MongoDB');

  const Assessment = mongoose.model('Assessment', assessmentSchema);
  const Question = mongoose.model('AssessmentQuestion', questionSchema);

  try {
    for (const data of assessments) {
      const { questions, ...info } = data;
      
      // Create/update assessment
      const assessment = await Assessment.findOneAndUpdate({ code: info.code }, info, { upsert: true, new: true });
      console.log(`✅ ${info.code}: ${info.nameAr}`);

      // Delete existing questions
      await Question.deleteMany({ assessment: assessment._id });

      // Create questions
      for (const q of questions) {
        await Question.create({ assessment: assessment._id, ...q });
      }
      console.log(`   └─ ${questions.length} questions added`);
    }

    console.log('✅ Assessment seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding assessments:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

seed().catch(console.error);
