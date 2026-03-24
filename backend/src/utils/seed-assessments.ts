/**
 * Seed assessments: PHQ-9, GAD-7, PSS-4
 * Run with: node dist/utils/seed-assessments.js
 */

import { NestFactory } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { Assessment, AssessmentSchema } from '../assessment/schemas/assessment.schema';
import { AssessmentQuestion, AssessmentQuestionSchema } from '../assessment/schemas/assessment-question.schema';
import { ConfigService } from '@nestjs/config';

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
      { minScore: 5, maxScore: 9, severity: 'Mild', severityAr: 'خفيف', color: 'yellow', description: 'Mild depression symptoms, may benefit from support', descriptionAr: 'أعراض اكتئاب خفيفة، قد تستفيد من الدعم' },
      { minScore: 10, maxScore: 14, severity: 'Moderate', severityAr: 'متوسط', color: 'orange', description: 'Moderate depression, professional help recommended', descriptionAr: 'اكتئاب متوسط، يُنصح بالمساعدة المهنية' },
      { minScore: 15, maxScore: 19, severity: 'Moderately Severe', severityAr: 'شديد', color: 'red', description: 'Severe depression, professional help strongly recommended', descriptionAr: 'اكتئاب شديد، المساعدة المهنية موصى بها بشدة' },
      { minScore: 20, maxScore: 27, severity: 'Severe', severityAr: 'شديد جداً', color: 'dark-red', description: 'Very severe depression, immediate professional help needed', descriptionAr: 'اكتئاب شديد جداً، مساعدة مهنية فورية مطلوبة' },
    ],
    questions: [
      {
        order: 1,
        text: 'Little interest or pleasure in doing things',
        textAr: 'قلة الاهتمام أو المتعة في فعل الأشياء',
        options: [
          { value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' },
          { value: 1, text: 'Several days', textAr: 'عدة أيام' },
          { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' },
          { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' },
        ],
      },
      {
        order: 2,
        text: 'Feeling down, depressed, or hopeless',
        textAr: 'الشعور بالحزن أو الاكتئاب أو اليأس',
        options: [
          { value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' },
          { value: 1, text: 'Several days', textAr: 'عدة أيام' },
          { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' },
          { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' },
        ],
      },
      {
        order: 3,
        text: 'Trouble falling or staying asleep, or sleeping too much',
        textAr: 'صعوبة في النوم أو البقاء نائماً، أو النوم كثيراً',
        options: [
          { value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' },
          { value: 1, text: 'Several days', textAr: 'عدة أيام' },
          { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' },
          { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' },
        ],
      },
      {
        order: 4,
        text: 'Feeling tired or having little energy',
        textAr: 'الشعور بالتعب أو قلة الطاقة',
        options: [
          { value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' },
          { value: 1, text: 'Several days', textAr: 'عدة أيام' },
          { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' },
          { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' },
        ],
      },
      {
        order: 5,
        text: 'Poor appetite or overeating',
        textAr: 'ضعف الشهية أو الإفراط في الأكل',
        options: [
          { value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' },
          { value: 1, text: 'Several days', textAr: 'عدة أيام' },
          { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' },
          { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' },
        ],
      },
      {
        order: 6,
        text: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
        textAr: 'الشعور بسوء تجاه نفسك - أو أنك فاشل أو خذلت نفسك أو عائلتك',
        options: [
          { value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' },
          { value: 1, text: 'Several days', textAr: 'عدة أيام' },
          { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' },
          { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' },
        ],
      },
      {
        order: 7,
        text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
        textAr: 'صعوبة في التركيز على الأشياء، مثل قراءة الصحيفة أو مشاهدة التلفزيون',
        options: [
          { value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' },
          { value: 1, text: 'Several days', textAr: 'عدة أيام' },
          { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' },
          { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' },
        ],
      },
      {
        order: 8,
        text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
        textAr: 'التحرك أو التحدث ببطء شديد لدرجة أن الآخرين لاحظوا ذلك. أو العكس - كونك متوتراً أو قلقاً لدرجة أنك تتحرك أكثر من المعتاد',
        options: [
          { value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' },
          { value: 1, text: 'Several days', textAr: 'عدة أيام' },
          { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' },
          { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' },
        ],
      },
      {
        order: 9,
        text: 'Thoughts that you would be better off dead or of hurting yourself in some way',
        textAr: 'أفكار بأنك ستكون أفضل ميتاً أو إيذاء نفسك بطريقة ما',
        options: [
          { value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' },
          { value: 1, text: 'Several days', textAr: 'عدة أيام' },
          { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' },
          { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' },
        ],
      },
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
      { minScore: 10, maxScore: 14, severity: 'Moderate', severityAr: 'متوسط', color: 'orange', description: 'Moderate anxiety, professional help recommended', descriptionAr: 'قلق متوسط، المساعدة المهنية موصى بها' },
      { minScore: 15, maxScore: 21, severity: 'Severe', severityAr: 'شديد', color: 'red', description: 'Severe anxiety, professional help strongly recommended', descriptionAr: 'قلق شديد، المساعدة المهنية موصى بها بشدة' },
    ],
    questions: [
      {
        order: 1,
        text: 'Feeling nervous, anxious, or on edge',
        textAr: 'الشعور بالتوتر أو القلق أو على حافة الانهيار',
        options: [
          { value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' },
          { value: 1, text: 'Several days', textAr: 'عدة أيام' },
          { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' },
          { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' },
        ],
      },
      {
        order: 2,
        text: 'Not being able to stop or control worrying',
        textAr: 'عدم القدرة على التوقف عن القلق أو التحكم فيه',
        options: [
          { value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' },
          { value: 1, text: 'Several days', textAr: 'عدة أيام' },
          { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' },
          { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' },
        ],
      },
      {
        order: 3,
        text: 'Worrying too much about different things',
        textAr: 'القلق المفرط بشأن أشياء مختلفة',
        options: [
          { value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' },
          { value: 1, text: 'Several days', textAr: 'عدة أيام' },
          { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' },
          { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' },
        ],
      },
      {
        order: 4,
        text: 'Trouble relaxing',
        textAr: 'صعوبة في الاسترخاء',
        options: [
          { value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' },
          { value: 1, text: 'Several days', textAr: 'عدة أيام' },
          { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' },
          { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' },
        ],
      },
      {
        order: 5,
        text: 'Being so restless that it is hard to sit still',
        textAr: 'القلق لدرجة أنه من الصعب الجلوس ساكناً',
        options: [
          { value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' },
          { value: 1, text: 'Several days', textAr: 'عدة أيام' },
          { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' },
          { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' },
        ],
      },
      {
        order: 6,
        text: 'Becoming easily annoyed or irritable',
        textAr: 'الانزعاج أو الغضب بسهولة',
        options: [
          { value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' },
          { value: 1, text: 'Several days', textAr: 'عدة أيام' },
          { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' },
          { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' },
        ],
      },
      {
        order: 7,
        text: 'Feeling afraid as if something awful might happen',
        textAr: 'الشعور بالخوف وكأن شيئاً فظيعاً قد يحدث',
        options: [
          { value: 0, text: 'Not at all', textAr: 'ليس على الإطلاق' },
          { value: 1, text: 'Several days', textAr: 'عدة أيام' },
          { value: 2, text: 'More than half the days', textAr: 'أكثر من نصف الأيام' },
          { value: 3, text: 'Nearly every day', textAr: 'تقريباً كل يوم' },
        ],
      },
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
      {
        order: 1,
        text: 'In the last month, how often have you felt that you were unable to control the important things in your life?',
        textAr: 'في الشهر الماضي، كم مرة شعرت أنك غير قادر على التحكم في الأشياء المهمة في حياتك؟',
        options: [
          { value: 0, text: 'Never', textAr: 'أبداً' },
          { value: 1, text: 'Sometimes', textAr: 'أحياناً' },
          { value: 2, text: 'Often', textAr: 'غالباً' },
          { value: 3, text: 'Very Often', textAr: 'غالباً جداً' },
        ],
      },
      {
        order: 2,
        text: 'In the last month, how often have you felt confident about your ability to handle your personal problems?',
        textAr: 'في الشهر الماضي، كم مرة شعرت بالثقة في قدرتك على التعامل مع مشاكلك الشخصية؟',
        options: [
          { value: 3, text: 'Never', textAr: 'أبداً' },
          { value: 2, text: 'Sometimes', textAr: 'أحياناً' },
          { value: 1, text: 'Often', textAr: 'غالباً' },
          { value: 0, text: 'Very Often', textAr: 'غالباً جداً' },
        ],
      },
      {
        order: 3,
        text: 'In the last month, how often have you felt that things were going your way?',
        textAr: 'في الشهر الماضي، كم مرة شعرت أن الأمور تسير في طريقك؟',
        options: [
          { value: 3, text: 'Never', textAr: 'أبداً' },
          { value: 2, text: 'Sometimes', textAr: 'أحياناً' },
          { value: 1, text: 'Often', textAr: 'غالباً' },
          { value: 0, text: 'Very Often', textAr: 'غالباً جداً' },
        ],
      },
      {
        order: 4,
        text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?',
        textAr: 'في الشهر الماضي، كم مرة شعرت أن الصعوبات تتراكم لدرجة أنك لا تستطيع التغلب عليها؟',
        options: [
          { value: 0, text: 'Never', textAr: 'أبداً' },
          { value: 1, text: 'Sometimes', textAr: 'أحياناً' },
          { value: 2, text: 'Often', textAr: 'غالباً' },
          { value: 3, text: 'Very Often', textAr: 'غالباً جداً' },
        ],
      },
    ],
  },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(class AppModule {});
  const configService = app.get(ConfigService);
  const mongooseModule = MongooseModule.forRoot(configService.get<string>('MONGODB_URI'));

  const appModule = await import('../app.module');
  
  console.log('🌱 Seeding assessments...');

  // Get models from Mongoose
  const mongoose = await import('mongoose');
  await mongoose.connect(configService.get<string>('MONGODB_URI'));

  const AssessmentModel = mongoose.model('Assessment', AssessmentSchema, 'assessments');
  const QuestionModel = mongoose.model('AssessmentQuestion', AssessmentQuestionSchema, 'assessmentquestions');

  try {
    for (const assessmentData of assessments) {
      const { questions, ...assessmentInfo } = assessmentData;

      // Create or update assessment
      const assessment = await AssessmentModel.findOneAndUpdate(
        { code: assessmentInfo.code },
        assessmentInfo,
        { upsert: true, new: true },
      );

      console.log(`✅ ${assessmentInfo.code}: ${assessmentInfo.nameAr}`);

      // Delete existing questions for this assessment
      await QuestionModel.deleteMany({ assessment: assessment._id });

      // Create questions
      for (const questionData of questions) {
        await QuestionModel.create({
          assessment: assessment._id,
          ...questionData,
        });
      }

      console.log(`   └─ ${questions.length} questions added`);
    }

    console.log('✅ Assessment seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding assessments:', error);
  } finally {
    await mongoose.disconnect();
    await app.close();
  }
}

bootstrap();
