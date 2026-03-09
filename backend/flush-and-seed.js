/**
 * Flush and Seed Database Script
 * Run: node flush-and-seed.js
 * 
 * WARNING: This will DELETE ALL DATA from the database!
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function flushAndSeed() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // ==================== FLUSH ALL COLLECTIONS ====================
    console.log('\n⚠️  Dropping all collections...');
    
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.drop();
      console.log(`  🗑️  Dropped: ${collection.collectionName}`);
    }
    
    console.log('✅ All collections dropped\n');

    // ==================== Seed Admin User ====================
    console.log('👤 Seeding Admin User...');
    const User = mongoose.model('User', new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      role: { type: String, enum: ['user', 'admin', 'therapist'], default: 'user' },
      phone: String,
      countryCode: { type: String, default: '+20' },
      birthDate: Date,
      gender: String,
      licenseNumber: String,
      specialty: String,
      yearsOfExperience: Number,
      education: [String],
      certifications: [String],
      clinicAddress: String,
      avatar: String,
      isActive: { type: Boolean, default: true },
      isVerified: { type: Boolean, default: false },
      isApproved: { type: Boolean, default: false },
      isProfilePublic: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      shareDataForResearch: { type: Boolean, default: false },
    }, { timestamps: true }));

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      email: 'admin@waey.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isVerified: true,
      isActive: true,
      isApproved: true,
      isProfilePublic: true,
      countryCode: '+20',
    });
    console.log('✅ Admin user created (email: admin@waey.com, password: admin123)');

    // ==================== Seed Community Categories ====================
    console.log('\n📁 Seeding Community Categories...');
    const CommunityCategory = mongoose.model('CommunityCategory', new mongoose.Schema({
      name: { type: String, required: true, unique: true },
      nameAr: { type: String, required: true },
      description: String,
      icon: String,
      color: String,
      order: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true },
    }, { timestamps: true }));

    const communityCategories = [
      { name: 'General', nameAr: 'عام', icon: 'fa-users', color: '#10b981', order: 1 },
      { name: 'Psychological Support', nameAr: 'دعم نفسي', icon: 'fa-heart', color: '#f59e0b', order: 2 },
      { name: 'Relationships', nameAr: 'علاقات', icon: 'fa-users', color: '#8b5cf6', order: 3 },
      { name: 'Self Development', nameAr: 'تطوير الذات', icon: 'fa-star', color: '#3b82f6', order: 4 },
    ];

    for (const cat of communityCategories) {
      await CommunityCategory.create(cat);
      console.log(`  ✅ Created community category: ${cat.nameAr}`);
    }

    // ==================== Seed Categories (for articles/videos) ====================
    console.log('\n📁 Seeding Categories...');
    const Category = mongoose.model('Category', new mongoose.Schema({
      name: { type: String, required: true },
      nameAr: { type: String, required: true },
      icon: { type: String, required: true },
      color: { type: String, required: true },
      order: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true },
      articlesCount: { type: Number, default: 0 },
      videosCount: { type: Number, default: 0 },
    }, { timestamps: true }));

    const categories = [
      { name: 'Mental Health', nameAr: 'الصحة النفسية', icon: 'fa-brain', color: '#10b981', order: 1 },
      { name: 'Relaxation', nameAr: 'الاسترخاء', icon: 'fa-spa', color: '#3b82f6', order: 2 },
      { name: 'Self Care', nameAr: 'العناية بالذات', icon: 'fa-heart', color: '#f59e0b', order: 3 },
    ];

    for (const cat of categories) {
      await Category.create(cat);
      console.log(`  ✅ Created category: ${cat.nameAr}`);
    }

    // ==================== Seed Stories ====================
    console.log('\n📖 Seeding Stories...');
    const Story = mongoose.model('Story', new mongoose.Schema({
      authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      title: { type: String, required: true, maxlength: 200 },
      content: { type: String, required: true, maxlength: 5000 },
      category: {
        type: String,
        enum: ['recovery', 'relationships', 'depression', 'anxiety', 'addiction', 'other'],
        required: true,
        default: 'other'
      },
      isAnonymous: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'hidden'],
        default: 'pending'
      },
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      views: { type: Number, default: 0 },
      viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      commentsCount: { type: Number, default: 0 },
      savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      readTime: { type: Number, default: 0 },
      featuredImage: String,
    }, { timestamps: true }));

    const stories = [
      {
        title: 'رحلتي مع القلق',
        content: 'أنا كنت فاكر إن القلق جزء من شخصيتي ومش أقدر أتخلص منه... لكنني تعلمت إن القلق مش ضعف، وإن في طرق كتيرة للتعامل معه. بدأت بالعلاج المعرفي السلوكي وتعلمت تمارين التنفس والتأمل. دلوقتي بقدر أسيطر على نوبات القلق وعاشت حياتي بشكل طبيعي. الرسالة اللي عايز أوصلها: أنت أقوى مما تتخيل، ومفيش حاجة مستحيلة مع الإرادة والعزيمة.',
        category: 'anxiety',
        isAnonymous: false,
        status: 'approved',
        readTime: 3,
      },
      {
        title: 'كيف تغلبت على الاكتئاب',
        content: 'الاكتئاب مش دايماً دموع وحزن.. أحياناً بيكون فراغ وفقدان الشغف. أنا عشت في الحالة دي سنين قبل ما أقرر أطلب مساعدة. أول خطوة كانت أصعب خطوة، لكن بعد ما لقيت الدعم المناسب والعلاج، بدأت أشوف النور تاني. لو أنت أو حد من اللي حواليك يعاني من الاكتئاب، اعرف إن في أمل دايماً، وإن طلب المساعدة مش عيب.',
        category: 'depression',
        isAnonymous: false,
        status: 'approved',
        readTime: 4,
      },
      {
        title: 'تعافي من الإدمان',
        content: 'الإدمان مرض مش اختيار. أنا عشت في دوامة الإدمان سنين طويلة ودمرت حياتي وعلاقتي بأهلي. لكن يوم ما قررت أتغير ولقيت الدعم المناسب، قدرت أتغلب عليه. الطريق كان صعب جداً، لكن كل يوم في التعافي هو انتصار جديد. لو أنت بتعاني من الإدمان، اعرف إن في أمل وإن في ناس كتير مستعدة تساعدك.',
        category: 'addiction',
        isAnonymous: true,
        status: 'approved',
        readTime: 5,
      },
      {
        title: 'تعلمت أحب نفسي',
        content: 'سنوات طويلة عشت فيها وانا بكره نفسي وعايز أكون حد تاني... لحد ما فهمت إن الحب الحقيقي بيبدأ من حب الذات. تعلمت أتقبل عيوبي وأقدر مميزاتي، وإن الكمال مش هدف واقعي. دلوقتي بعيش حياتي براحة وسعادة أكتر. حب نفسك مش أنانية، إنه أساس الصحة النفسية.',
        category: 'recovery',
        isAnonymous: false,
        status: 'approved',
        readTime: 3,
      },
      {
        title: 'علاقتي السامة',
        content: 'كنت في علاقة سامة لسنوات وانا مقدر أخرج منها. كنت فاكر إن الحب الحقيقي هو التضحية بكل حاجة، لكنني تعلمت إن الحب الصحي مبني على الاحترام المتبادل والمساواة. لو أنت في علاقة بتخليك تحس إنك مش كفاية، أو إنك لازم تتغير عشان حد يحبك، فاعرف إن دي مش مشكلة منك، المشكلة في العلاقة نفسها.',
        category: 'relationships',
        isAnonymous: false,
        status: 'approved',
        readTime: 4,
      },
    ];

    for (const story of stories) {
      await Story.create({
        ...story,
        authorId: adminUser._id,
      });
      console.log(`  ✅ Created story: ${story.title}`);
    }

    // ==================== Seed Articles ====================
    console.log('\n📰 Seeding Articles...');
    const Article = mongoose.model('Article', new mongoose.Schema({
      title: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      excerpt: { type: String, required: true, maxlength: 500 },
      content: { type: String, required: true },
      authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      tags: { type: [String], default: [] },
      views: { type: Number, default: 0 },
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      bookmarks: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
      },
      publishedAt: Date,
      readTime: { type: Number, default: 0 },
      isFeatured: { type: Boolean, default: false },
      order: { type: Number, default: 0 },
    }, { timestamps: true }));

    const articles = [
      {
        title: 'مقدمة في الصحة النفسية',
        slug: 'introduction-to-mental-health',
        excerpt: 'دليل شامل لفهم أساسيات الصحة النفسية وأهميتها في حياتنا اليومية',
        content: 'الصحة النفسية هي جزء أساسي من صحتنا العامة. تشمل صحتنا النفسية رفاهيتنا العاطفية والنفسية والاجتماعية. إنها تؤثر على كيفية تفكيرنا وشعورنا وتصرفنا. تساعد الصحة النفسية في تحديد كيفية تعاملنا مع التوتر، والتواصل مع الآخرين، واتخاذ الخيارات. الصحة النفسية مهمة في كل مرحلة من مراحل الحياة، من الطفولة والمراهقة إلى البلوغ.',
        tags: ['صحة نفسية', 'توعية'],
        isFeatured: true,
        readTime: 5,
        status: 'published',
        publishedAt: new Date(),
      },
      {
        title: 'كيفية التعامل مع التوتر',
        slug: 'how-to-deal-with-stress',
        excerpt: 'نصائح عملية للتعامل مع التوتر والضغوط اليومية',
        content: 'التوتر هو استجابة طبيعية للتحديات والتغييرات في حياتنا. ومع ذلك، يمكن أن يكون للتوتر المزمن آثار سلبية على صحتنا النفسية والجسدية. إليك بعض النصائح العملية للتعامل مع التوتر: 1) ممارسة التمارين الرياضية بانتظام، 2) تقنيات الاسترخاء مثل التنفس العميق والتأمل، 3) الحفاظ على نظام غذائي صحي، 4) النوم الكافي، 5) التواصل مع الأصدقاء والعائلة، 6) طلب المساعدة المهنية عند الحاجة.',
        tags: ['توتر', 'إدارة الضغوط'],
        isFeatured: true,
        readTime: 4,
        status: 'published',
        publishedAt: new Date(),
      },
    ];

    for (const article of articles) {
      await Article.create({
        ...article,
        authorId: adminUser._id,
      });
      console.log(`  ✅ Created article: ${article.title}`);
    }

    // ==================== Seed Videos ====================
    console.log('\n🎥 Seeding Videos...');
    const Video = mongoose.model('Video', new mongoose.Schema({
      title: { type: String, required: true },
      description: String,
      videoUrl: { type: String, required: true },
      thumbnailUrl: String,
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      views: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
      isFeatured: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
      category: String,
      tags: [String],
      order: { type: Number, default: 0 },
    }, { timestamps: true }));

    const videos = [
      {
        title: 'تمارين التنفس للقلق',
        description: 'تمارين تنفس بسيطة للمساعدة في تخفيف القلق',
        videoUrl: 'https://www.youtube.com/watch?v=example1',
        thumbnailUrl: '/uploads/videos/thumbnail1.jpg',
        category: 'تقنيات الاسترخاء',
        duration: 300,
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'كيف تبني عادات صحية',
        description: 'خطوات عملية لبناء عادات صحية مستدامة',
        videoUrl: 'https://www.youtube.com/watch?v=example2',
        thumbnailUrl: '/uploads/videos/thumbnail2.jpg',
        category: 'تطوير الذات',
        duration: 600,
        isFeatured: true,
        isActive: true,
      },
    ];

    for (const video of videos) {
      await Video.create({
        ...video,
        addedBy: adminUser._id,
      });
      console.log(`  ✅ Created video: ${video.title}`);
    }

    console.log('\n✅ Database flushed and seeded successfully!');
    console.log('\n📋 Summary:');
    console.log('  - 1 Admin user (admin@waey.com / admin123)');
    console.log('  - 4 Community categories');
    console.log('  - 3 Categories');
    console.log('  - 5 Stories');
    console.log('  - 2 Articles');
    console.log('  - 2 Videos');
    
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error flushing and seeding database:', error);
    process.exit(1);
  }
}

// Run the seed
flushAndSeed();
