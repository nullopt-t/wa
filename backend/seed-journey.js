const mongoose = require('mongoose');

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb+srv://hedrsag:test@cluster0.ysstcmo.mongodb.net/test';

mongoose.connect(DATABASE_URL).then(async () => {
  console.log('🔌 Connected to database');

  // Define schemas
  const JourneySchema = new mongoose.Schema({
    name: String,
    description: String,
    longDescription: String,
    levels: [{
      levelNumber: Number,
      name: String,
      description: String,
      order: Number,
      requiredCompletions: Number,
      resources: [{
        resourceType: String,
        resourceId: mongoose.Schema.Types.ObjectId,
        isMandatory: Boolean,
        order: Number,
      }],
      color: String,
      icon: String,
    }],
    isActive: Boolean,
    icon: String,
    color: String,
    estimatedDuration: Number,
  }, { timestamps: true, collection: 'journeys' });

  const Journey = mongoose.model('Journey', JourneySchema);

  // Check if journey already exists
  const existingJourney = await Journey.findOne({ isActive: true });
  if (existingJourney) {
    console.log('⚠️  Active journey already exists. Skipping seed.');
    console.log('Journey:', existingJourney.name);
    process.exit(0);
  }

  // NOTE: Replace these ObjectIds with actual resource IDs from your database
  // For now, using placeholder IDs - you'll need to update them with real resources
  const journey = await Journey.create({
    name: 'رحلة الوعي النفسي',
    description: 'رحلة تعليمية مكونة من 4 مستويات لاكتساب الوعي النفسي خطوة بخطوة',
    longDescription: 'هذه الرحلة مصممة لمساعدتك على فهم صحتك النفسية بشكل تدريجي. كل مستوى يركز على جوانب مختلفة من الوعي الذاتي والصحة النفسية. يجب إكمال جميع الموارد في كل مستوى قبل الانتقال إلى المستوى التالي.',
    isActive: true,
    icon: 'fa-solid fa-road',
    color: '#8B5CF6',
    estimatedDuration: 30,
    levels: [
      {
        levelNumber: 1,
        name: 'البداية: فهم الذات',
        description: 'تعرف على أساسيات الصحة النفسية والوعي الذاتي',
        order: 1,
        requiredCompletions: 3,
        color: '#F59E0B',
        icon: 'fa-solid fa-seedling',
        resources: [
          // Add real resource IDs here after seeding articles/videos/books
          {
            resourceType: 'article',
            resourceId: new mongoose.Types.ObjectId(), // Replace with actual article ID
            isMandatory: true,
            order: 1,
          },
          {
            resourceType: 'video',
            resourceId: new mongoose.Types.ObjectId(), // Replace with actual video ID
            isMandatory: true,
            order: 2,
          },
          {
            resourceType: 'book',
            resourceId: new mongoose.Types.ObjectId(), // Replace with actual book ID
            isMandatory: false,
            order: 3,
          },
        ],
      },
      {
        levelNumber: 2,
        name: 'التعمق: المشاعر والأفكار',
        description: 'تعلم كيف تتعرف على مشاعرك وأفكارك بوضوح أكبر',
        order: 2,
        requiredCompletions: 3,
        color: '#10B981',
        icon: 'fa-solid fa-heart',
        resources: [
          {
            resourceType: 'article',
            resourceId: new mongoose.Types.ObjectId(),
            isMandatory: true,
            order: 1,
          },
          {
            resourceType: 'video',
            resourceId: new mongoose.Types.ObjectId(),
            isMandatory: true,
            order: 2,
          },
          {
            resourceType: 'article',
            resourceId: new mongoose.Types.ObjectId(),
            isMandatory: false,
            order: 3,
          },
        ],
      },
      {
        levelNumber: 3,
        name: 'الممارسة: أدوات وتقنيات',
        description: 'اكتسب أدوات عملية للتعامل مع التحديات النفسية',
        order: 3,
        requiredCompletions: 3,
        color: '#3B82F6',
        icon: 'fa-solid fa-toolbox',
        resources: [
          {
            resourceType: 'video',
            resourceId: new mongoose.Types.ObjectId(),
            isMandatory: true,
            order: 1,
          },
          {
            resourceType: 'book',
            resourceId: new mongoose.Types.ObjectId(),
            isMandatory: true,
            order: 2,
          },
          {
            resourceType: 'article',
            resourceId: new mongoose.Types.ObjectId(),
            isMandatory: false,
            order: 3,
          },
        ],
      },
      {
        levelNumber: 4,
        name: 'الإتقان: النمو المستمر',
        description: 'حقق الوعي الكامل وتعلم كيف تحافظ على نموك النفسي',
        order: 4,
        requiredCompletions: 3,
        color: '#8B5CF6',
        icon: 'fa-solid fa-star',
        resources: [
          {
            resourceType: 'article',
            resourceId: new mongoose.Types.ObjectId(),
            isMandatory: true,
            order: 1,
          },
          {
            resourceType: 'video',
            resourceId: new mongoose.Types.ObjectId(),
            isMandatory: true,
            order: 2,
          },
          {
            resourceType: 'book',
            resourceId: new mongoose.Types.ObjectId(),
            isMandatory: true,
            order: 3,
          },
        ],
      },
    ],
  });

  console.log('✅ Journey seeded successfully!');
  console.log('Journey ID:', journey._id.toString());
  console.log('Name:', journey.name);
  console.log('Levels:', journey.levels.length);
  console.log('');
  console.log('⚠️  IMPORTANT: Update resource IDs with actual articles/videos/books from your database');
  console.log('You can do this manually in MongoDB or by running an update script.');

  process.exit(0);
}).catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
