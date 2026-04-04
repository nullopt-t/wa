/**
 * Full Seed Database Script - ALL COLLECTIONS
 * Run: DATABASE_URL=... node seed-data.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

async function seed() {
  console.log('📡 Connecting...');
  await mongoose.connect(process.env.DATABASE_URL);
  console.log('✅ Connected\n');

  // ===== FLUSH ALL COLLECTIONS =====
  console.log('🗑️ Dropping existing collections...');
  const existingCollections = await mongoose.connection.db.listCollections().toArray();
  for (const c of existingCollections) {
    await mongoose.connection.db.dropCollection(c.name);
    console.log(`  🗑️ ${c.name}`);
  }
  console.log('✅ All collections dropped\n');

  // ===== 1. USERS =====
  console.log('👤 Users...');
  const User = mongoose.model('User', new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: String, lastName: String,
    role: { type: String, default: 'user' },
    isVerified: Boolean, isApproved: Boolean, isActive: Boolean,
    isProfilePublic: Boolean,
  }, { timestamps: true }), 'users');

  const hash = await bcrypt.hash('admin123', 10);
  const ensureUser = async (u) => {
    if (!(await User.findOne({ email: u.email }))) {
      await User.create(u);
      console.log(`  ✅ ${u.email}`);
      return await User.findOne({ email: u.email });
    }
    return await User.findOne({ email: u.email });
  };

  const admin = await ensureUser({ email: 'admin@waey.com', password: hash, firstName: 'Admin', lastName: 'User', role: 'admin', isVerified: true, isApproved: true, isActive: true });
  const testUser = await ensureUser({ email: 'user@waey.com', password: hash, firstName: 'Test', lastName: 'User', role: 'user', isVerified: true, isActive: true });
  let therapist = await ensureUser({ email: 'therapist@waey.com', password: hash, firstName: 'Ahmed', lastName: 'Therapist', role: 'therapist', isVerified: true, isApproved: true, isActive: true, specialty: 'CBT' });

  // ===== 2. THERAPIST PROFILES =====
  console.log('👨‍⚕️ TherapistProfiles...');
  const TherapistProfile = mongoose.model('TherapistProfile', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    bio: String, licenseNumber: String, specialty: String,
    experience: Number, languages: [String],
    country: String, city: String, clinicAddress: String,
    isVerified: Boolean, isTrusted: Boolean, isActive: Boolean,
  }, { timestamps: true }), 'therapistprofiles');

  if (!(await TherapistProfile.findOne({ userId: therapist._id }))) {
    await TherapistProfile.create({
      userId: therapist._id,
      bio: 'أخصائي نفسي متخصص في العلاج المعرفي السلوكي.',
      licenseNumber: 'TH-2024-001', specialty: 'العلاج المعرفي السلوكي',
      experience: 8, languages: ['العربية', 'الإنجليزية'],
      country: 'مصر', city: 'القاهرة',
      isVerified: true, isTrusted: true, isActive: true,
    });
    console.log('  ✅ Therapist profile');
  }

  // ===== 3. CATEGORIES (Content: Articles/Videos) =====
  console.log('📁 Categories...');
  const Category = mongoose.model('Category', new mongoose.Schema({
    name: String, icon: String, color: String,
    order: Number, isActive: Boolean,
    articlesCount: Number, videosCount: Number,
  }, { timestamps: true }), 'categories');

  for (const c of [
    { name: 'الصحة النفسية', icon: 'fa-brain', color: '#10b981', order: 1, isActive: true, articlesCount: 0, videosCount: 0 },
    { name: 'الاسترخاء', icon: 'fa-spa', color: '#3b82f6', order: 2, isActive: true, articlesCount: 0, videosCount: 0 },
  ]) {
    if (!(await Category.findOne({ name: c.name }))) {
      await Category.create(c);
      console.log(`  ✅ ${c.name}`);
    }
  }

  // ===== 3.5 COMMUNITY CATEGORIES =====
  console.log('📁 Community Categories...');
  const CommunityCategory = mongoose.model('CommunityCategory', new mongoose.Schema({
    name: String, icon: String, color: String, order: Number, isActive: Boolean,
  }, { timestamps: true }), 'communitycategories');

  for (const c of [
    { name: 'عام', icon: 'fa-users', color: '#10b981', order: 1, isActive: true },
    { name: 'دعم نفسي', icon: 'fa-heart', color: '#f59e0b', order: 2, isActive: true },
  ]) {
    if (!(await CommunityCategory.findOne({ name: c.name }))) {
      await CommunityCategory.create(c);
      console.log(`  ✅ ${c.name}`);
    }
  }
  const commCat = await CommunityCategory.findOne();

  // ===== 4. STORIES =====
  console.log('📖 Stories...');
  const Story = mongoose.model('Story', new mongoose.Schema({
    authorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: String, content: String, category: String,
    isAnonymous: Boolean, status: String,
    likes: [mongoose.Schema.Types.ObjectId], views: Number, readTime: Number,
  }, { timestamps: true }), 'stories');

  for (const s of [
    { title: 'رحلتي مع القلق', content: 'أنا كنت فاكر إن القلق جزء من شخصيتي... لكنني تعلمت إن القلق مش ضعف.', category: 'anxiety', status: 'approved', readTime: 3 },
    { title: 'كيف تغلبت على الاكتئاب', content: 'الاكتئاب مش دايماً دموع وحزن.. أحياناً بيكون فراغ وفقدان الشغف.', category: 'depression', status: 'approved', readTime: 4 },
  ]) {
    if (!(await Story.findOne({ title: s.title }))) {
      await Story.create({ ...s, authorId: admin._id, isAnonymous: false });
      console.log(`  ✅ ${s.title}`);
    }
  }

  // ===== 5. ARTICLES =====
  console.log('📰 Articles...');
  const Article = mongoose.model('Article', new mongoose.Schema({
    title: String, slug: { type: String, unique: true },
    excerpt: String, content: String,
    authorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    categoryId: mongoose.Schema.Types.ObjectId,
    tags: [String], views: Number, likes: [mongoose.Schema.Types.ObjectId],
    bookmarks: Number, status: String, publishedAt: Date,
    readTime: Number, isFeatured: Boolean, order: Number,
  }, { timestamps: true }), 'articles');

  const healthCat = await Category.findOne({ name: 'الصحة النفسية' });
  const relaxCat = await Category.findOne({ name: 'الاسترخاء' });

  for (const a of [
    { title: 'مقدمة في الصحة النفسية', slug: 'introduction-to-mental-health', excerpt: 'دليل شامل', content: 'الصحة النفسية هي جزء أساسي من صحتنا العامة.', categoryId: healthCat?._id, tags: ['صحة نفسية'], status: 'published', readTime: 5, isFeatured: true },
    { title: 'كيفية التعامل مع التوتر', slug: 'how-to-deal-with-stress', excerpt: 'نصائح عملية', content: 'التوتر هو استجابة طبيعية.', categoryId: relaxCat?._id, tags: ['توتر'], status: 'published', readTime: 4, isFeatured: true },
  ]) {
    if (!(await Article.findOne({ slug: a.slug }))) {
      await Article.create({ ...a, authorId: admin._id, publishedAt: new Date() });
      console.log(`  ✅ ${a.title}`);
    }
  }

  // ===== 6. VIDEOS =====
  console.log('🎥 Videos...');
  const Video = mongoose.model('Video', new mongoose.Schema({
    title: String, description: String, videoUrl: { type: String, required: true },
    thumbnailUrl: String, addedBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    categoryId: mongoose.Schema.Types.ObjectId,
    views: Number, duration: Number, isFeatured: Boolean, isActive: Boolean,
    category: String, tags: [String], order: Number,
  }, { timestamps: true }), 'videos');

  for (const v of [
    { title: 'تمارين التنفس للقلق', description: 'تمارين تنفس بسيطة', videoUrl: 'https://youtube.com/1', categoryId: relaxCat?._id, duration: 300, isFeatured: true, isActive: true },
    { title: 'كيف تبني عادات صحية', description: 'خطوات عملية', videoUrl: 'https://youtube.com/2', categoryId: healthCat?._id, duration: 600, isFeatured: true, isActive: true },
  ]) {
    if (!(await Video.findOne({ title: v.title }))) {
      await Video.create({ ...v, addedBy: admin._id });
      console.log(`  ✅ ${v.title}`);
    }
  }

  // ===== 8. POSTS =====
  console.log('📝 Posts...');
  const Post = mongoose.model('Post', new mongoose.Schema({
    authorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: String, content: String, categoryId: mongoose.Schema.Types.ObjectId,
    tags: [String], likes: [mongoose.Schema.Types.ObjectId], views: Number,
    status: String, isAnonymous: Boolean, isPinned: Boolean,
  }, { timestamps: true }), 'posts');

  for (const p of [
    { title: 'كيف تتعامل مع نوبات الهلع؟', content: 'أعاني من نوبات هلع متكررة وأبحث عن نصائح.' },
    { title: 'تجربتي مع العلاج النفسي', content: 'أردت مشاركة تجربتي الإيجابية.' },
  ]) {
    if (!(await Post.findOne({ title: p.title }))) {
      await Post.create({ ...p, authorId: testUser._id, categoryId: commCat?._id, status: 'approved', isAnonymous: false, isPinned: false, views: 0 });
      console.log(`  ✅ ${p.title}`);
    }
  }

  // ===== 11. COMMENTS (Community) =====
  console.log('💬 Comments...');
  const Comment = mongoose.model('Comment', new mongoose.Schema({
    content: String, authorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    articleId: mongoose.Schema.Types.ObjectId, postId: mongoose.Schema.Types.ObjectId,
    status: String, likes: Number, reports: Number,
    likedBy: [mongoose.Schema.Types.ObjectId], reportedBy: [mongoose.Schema.Types.ObjectId],
    parentCommentId: mongoose.Schema.Types.ObjectId, isEdited: Boolean,
  }, { timestamps: true }), 'comments');

  const firstPost = await Post.findOne();
  if (firstPost && !(await Comment.findOne({ content: 'شكراً لمشاركتك' }))) {
    await Comment.create({ postId: firstPost._id, authorId: admin._id, content: 'شكراً لمشاركتك، هذا مفيد جداً', status: 'active', likes: 0, reports: 0, isEdited: false });
    console.log('  ✅ Post comment');
  }
  if (await Article.findOne() && !(await Comment.findOne({ content: 'مقال مفيد' }))) {
    const article = await Article.findOne();
    await Comment.create({ articleId: article._id, authorId: testUser._id, content: 'مقال مفيد', status: 'active', likes: 0, reports: 0, isEdited: false });
    console.log('  ✅ Article comment');
  }

  // ===== 12. REPORTS =====
  console.log('🚩 Reports...');
  const Report = mongoose.model('Report', new mongoose.Schema({
    reporterId: { type: mongoose.Schema.Types.ObjectId, required: true },
    targetType: String, targetId: mongoose.Schema.Types.ObjectId,
    reason: String, description: String, status: String,
  }, { timestamps: true }), 'reports');

  if (firstPost && !(await Report.findOne({ targetId: firstPost._id }))) {
    await Report.create({ reporterId: testUser._id, targetType: 'post', targetId: firstPost._id, reason: 'spam', status: 'pending' });
    console.log('  ✅ Report');
  }

  // ===== 13. FEEDBACKS =====
  console.log('💬 Feedbacks...');
  const Feedback = mongoose.model('Feedback', new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId, name: String, email: String,
    message: { type: String, required: true }, category: String, rating: Number,
    status: String, isPublic: Boolean,
  }, { timestamps: true }), 'feedbacks');

  if (!(await Feedback.findOne({ message: 'المنصة ممتازة' }))) {
    await Feedback.create({ userId: testUser._id, message: 'المنصة ممتازة ومفيدة', status: 'approved', rating: 5, isPublic: true });
    console.log('  ✅ Feedback');
  }

  // ===== 14. FUTURE MESSAGES =====
  console.log('📨 FutureMessages...');
  const FutureMessage = mongoose.model('FutureMessage', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: String, message: String,
    deliverAt: Date, isDelivered: Boolean, isEmailNotification: Boolean,
  }, { timestamps: true }), 'futuremessages');

  const futureDate = new Date(); futureDate.setDate(futureDate.getDate() + 7);
  if (!(await FutureMessage.findOne({ message: 'لا تنسى' }))) {
    await FutureMessage.create({ userId: testUser._id, title: 'رسالة للمستقبل', message: 'لا تنسى أن تهتم بصحتك النفسية', deliverAt: futureDate, isDelivered: false, isEmailNotification: false });
    console.log('  ✅ Future message');
  }

  // ===== 15. NOTIFICATIONS =====
  console.log('🔔 Notifications...');
  const Notification = mongoose.model('Notification', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    type: String, title: String, message: String,
    isRead: Boolean, isDeleted: Boolean, priority: String,
  }, { timestamps: true }), 'notifications');

  if (!(await Notification.findOne({ message: 'مرحباً' }))) {
    await Notification.create({ userId: testUser._id, type: 'system', title: 'مرحباً', message: 'أهلاً بك في منصة وعي', isRead: false, isDeleted: false, priority: 'medium' });
    console.log('  ✅ Notification');
  }

  // ===== 16. CHAT SESSIONS =====
  console.log('💬 ChatSessions...');
  const ChatSession = mongoose.model('ChatSession', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: String, isActive: Boolean,
    messageCount: Number, assessmentState: Object,
  }, { timestamps: true }), 'chatsessions');

  if (!(await ChatSession.findOne({ title: 'محادثة تجريبية' }))) {
    await ChatSession.create({ userId: testUser._id, title: 'محادثة تجريبية', isActive: true, messageCount: 0 });
    console.log('  ✅ Chat session');
  }

  // ===== 17. CHAT MESSAGES =====
  console.log('📨 ChatMessages...');
  const ChatMessage = mongoose.model('ChatMessage', new mongoose.Schema({
    sessionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    role: String, content: String, messageType: String,
    emotions: [{ emotion: String, confidence: Number, intensity: Number }],
    suggestions: [String], relatedResources: [Object], reportData: Object,
  }, { timestamps: true }), 'chatmessages');

  const session = await ChatSession.findOne();
  if (session && !(await ChatMessage.findOne({ sessionId: session._id }))) {
    await ChatMessage.create({
      sessionId: session._id, userId: testUser._id,
      role: 'user', content: 'أشعر بالقلق lately', messageType: 'text',
    });
    await ChatMessage.create({
      sessionId: session._id, userId: testUser._id,
      role: 'assistant', content: 'أتفهم أن القلق يمكن أن يكون صعباً. هل يمكنك إخباري المزيد؟', messageType: 'text',
      emotions: [{ emotion: 'anxious', confidence: 0.8, intensity: 6 }],
    });
    console.log('  ✅ Chat messages');
  }

  // ===== 18. EMOTION LOGS =====
  console.log('📊 EmotionLogs...');
  const EmotionLog = mongoose.model('EmotionLog', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    date: Date, emotions: [{ emotion: String, confidence: Number, intensity: Number }],
    sessionCount: Number,
  }, { timestamps: true }), 'emotionlogs');

  const today = new Date(); today.setHours(0,0,0,0);
  if (!(await EmotionLog.findOne({ userId: testUser._id, date: today }))) {
    await EmotionLog.create({
      userId: testUser._id, date: today,
      emotions: [{ emotion: 'anxious', confidence: 0.8, intensity: 6 }],
      sessionCount: 1,
    });
    console.log('  ✅ Emotion log');
  }

  // ===== SUMMARY =====
  console.log('\n✅ Seeding complete!\n📋 Collections:');
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const c of collections.sort((a,b) => a.name.localeCompare(b.name))) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(`  ${c.name}: ${count}`);
  }
  console.log('\n🔐 Admin: admin@waey.com / admin123');
  console.log('🔐 User:  user@waey.com / admin123');
  console.log('🔐 Therapist: therapist@waey.com / admin123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error('❌', e); process.exit(1); });
