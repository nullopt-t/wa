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
    console.log('👤 Seeding Users...');
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

    // Create a test user
    const testUser = await User.create({
      email: 'user@waey.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      isVerified: true,
      isActive: true,
      isProfilePublic: true,
    });

    console.log('✅ Admin user created (admin@waey.com / admin123)');
    console.log('✅ Test user created (user@waey.com / admin123)');

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
      { name: 'General', nameAr: 'عام', description: 'General discussions', icon: 'fa-users', color: '#10b981', order: 1 },
      { name: 'Psychological Support', nameAr: 'دعم نفسي', description: 'Mental health support', icon: 'fa-heart', color: '#f59e0b', order: 2 },
      { name: 'Relationships', nameAr: 'علاقات', description: 'Relationship advice', icon: 'fa-users', color: '#8b5cf6', order: 3 },
      { name: 'Self Development', nameAr: 'تطوير الذات', description: 'Personal growth', icon: 'fa-star', color: '#3b82f6', order: 4 },
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

    // ==================== Seed Community Posts ====================
    console.log('\n📝 Seeding Community Posts...');
    const Post = mongoose.model('Post', new mongoose.Schema({
      authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      title: { type: String, required: true, maxlength: 200 },
      content: { type: String, required: true, maxlength: 5000 },
      categoryId: mongoose.Schema.Types.ObjectId,
      tags: [String],
      images: [String],
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      views: { type: Number, default: 0 },
      viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      commentsCount: { type: Number, default: 0 },
      savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'hidden'],
        default: 'approved'
      },
      reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
      isPinned: { type: Boolean, default: false },
      isClosed: { type: Boolean, default: false },
      isAnonymous: { type: Boolean, default: false },
      lastActivityAt: Date,
    }, { timestamps: true }));

    const posts = [
      {
        title: 'كيف تتعامل مع نوبات الهلع؟',
        content: 'أعاني من نوبات هلع متكررة وأبحث عن نصائح للتعامل معها...',
        tags: ['قلق', 'صحة نفسية'],
        status: 'approved',
        isPinned: true,
      },
      {
        title: 'تجربتي مع العلاج النفسي',
        content: 'أردت مشاركة تجربتي الإيجابية مع العلاج النفسي لتشجيع الآخرين...',
        tags: ['علاج', 'تجارب شخصية'],
        status: 'approved',
      },
      {
        title: 'نصائح للنوم الأفضل',
        content: 'بعد سنوات من الأرق، تعلمت هذه العادات التي ساعدتني...',
        tags: ['نوم', 'صحة'],
        status: 'approved',
      },
    ];

    for (const post of posts) {
      await Post.create({
        ...post,
        authorId: testUser._id,
      });
      console.log(`  ✅ Created post: ${post.title}`);
    }

    // ==================== Seed Community Comments ====================
    console.log('\n💬 Seeding Community Comments...');
    const CommunityComment = mongoose.model('CommunityComment', new mongoose.Schema({
      postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
      authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      parentId: mongoose.Schema.Types.ObjectId,
      content: { type: String, required: true, maxlength: 2000 },
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      status: {
        type: String,
        enum: ['pending', 'approved', 'hidden'],
        default: 'approved'
      },
      isAnonymous: { type: Boolean, default: false },
      repliesCount: { type: Number, default: 0 },
    }, { timestamps: true }));

    const allPosts = await Post.find();
    if (allPosts.length > 0) {
      const comments = [
        { postId: allPosts[0]._id, content: 'شكراً لمشاركتك، هذا مفيد جداً', authorId: adminUser._id },
        { postId: allPosts[0]._id, content: 'أنا أيضاً أعاني من نفس المشكلة', authorId: testUser._id },
        { postId: allPosts[1]._id, content: 'قصة ملهمة جداً!', authorId: adminUser._id },
      ];

      for (const comment of comments) {
        await CommunityComment.create(comment);
        console.log(`  ✅ Created comment on post`);
      }
    }

    // ==================== Seed Reports ====================
    console.log('\n🚩 Seeding Reports...');
    const Report = mongoose.model('Report', new mongoose.Schema({
      reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      targetType: { type: String, enum: ['post', 'comment'], required: true },
      targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
      reason: {
        type: String,
        enum: ['spam', 'harassment', 'hate_speech', 'misinformation', 'self_harm', 'violence', 'sexual_content', 'copyright', 'other'],
        required: true
      },
      description: { type: String, maxlength: 500 },
      status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
      },
      reviewedBy: mongoose.Schema.Types.ObjectId,
      reviewedAt: Date,
      adminNotes: { type: String, maxlength: 1000 },
      contentSnapshot: { type: String, maxlength: 5000 },
    }, { timestamps: true }));

    // Create one sample report
    if (allPosts.length > 0) {
      await Report.create({
        reporterId: testUser._id,
        targetType: 'post',
        targetId: allPosts[0]._id,
        reason: 'spam',
        description: 'يبدو كإعلان تجاري',
        status: 'pending',
      });
      console.log('  ✅ Created sample report');
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

    // ==================== Seed Article Comments ====================
    console.log('\n💬 Seeding Article Comments...');
    const ArticleComment = mongoose.model('ArticleComment', new mongoose.Schema({
      content: { type: String, required: true },
      authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
      postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
      status: { type: String, default: 'active' },
      likes: { type: Number, default: 0 },
      reports: { type: Number, default: 0 },
      likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      parentCommentId: mongoose.Schema.Types.ObjectId,
      isEdited: { type: Boolean, default: false },
    }, { timestamps: true }));

    const allArticles = await Article.find();
    if (allArticles.length > 0) {
      await ArticleComment.create({
        content: 'مقال مفيد جداً، شكراً للمشاركة!',
        authorId: testUser._id,
        articleId: allArticles[0]._id,
        status: 'active',
      });
      console.log('  ✅ Created article comment');
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
    console.log('  - 2 Users (admin + test)');
    console.log('  - 4 Community categories');
    console.log('  - 3 Categories');
    console.log('  - 3 Community posts');
    console.log('  - 3 Community comments');
    console.log('  - 1 Report');
    console.log('  - 5 Stories');
    console.log('  - 2 Articles');
    console.log('  - 1 Article comment');
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
