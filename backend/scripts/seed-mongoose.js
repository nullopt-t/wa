// Seed script using Mongoose - Idempotent (safe to run multiple times)
// Run: cd backend && node scripts/seed-mongoose.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.DATABASE_URL || 'mongodb+srv://am3:1eIqrJjUcMnLf7Uf@cluster0.vxkphtj.mongodb.net/waey';

async function seed() {
  console.log('🌱 Seeding Waey Database...\n');

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // ─── Schemas ───
    const UserSchema = new mongoose.Schema({
      firstName: String, lastName: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true }, role: { type: String, default: 'user' },
      isVerified: Boolean, isActive: Boolean, isApproved: Boolean,
    }, { timestamps: true });
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    const TherapistProfileSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
      specialty: String, yearsOfExperience: Number, bio: String, isVerified: Boolean,
    }, { timestamps: true });
    const TherapistProfile = mongoose.models.TherapistProfile || mongoose.model('TherapistProfile', TherapistProfileSchema);

    const ArticleSchema = new mongoose.Schema({
      title: String, slug: String, excerpt: String, content: String,
      authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      tags: [String], status: { type: String, default: 'published' },
      readTime: Number, isFeatured: Boolean, views: Number, likes: [mongoose.Schema.Types.ObjectId],
    }, { timestamps: true });
    const Article = mongoose.models.Article || mongoose.model('Article', ArticleSchema);

    const PostSchema = new mongoose.Schema({
      authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      title: String, content: String, category: String,
      status: { type: String, default: 'approved' }, views: Number, likesCount: Number,
    }, { timestamps: true });
    const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

    const CommentSchema = new mongoose.Schema({
      authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
      content: String, likes: [mongoose.Schema.Types.ObjectId],
    }, { timestamps: true });
    const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);

    const StorySchema = new mongoose.Schema({
      authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      title: String, content: String, category: String,
      status: { type: String, default: 'approved' }, readTime: Number, views: Number,
    }, { timestamps: true });
    const Story = mongoose.models.Story || mongoose.model('Story', StorySchema);

    const BookSchema = new mongoose.Schema({
      title: String, slug: { type: String, unique: true },
      author: String, description: String, pages: Number, isFeatured: Boolean, isActive: Boolean,
    }, { timestamps: true });
    const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);

    const VideoSchema = new mongoose.Schema({
      title: String, description: String, videoUrl: String,
      addedBy: mongoose.Schema.Types.ObjectId, category: String,
      tags: [String], isFeatured: Boolean, duration: Number, isActive: Boolean, views: Number,
    }, { timestamps: true });
    const Video = mongoose.models.Video || mongoose.model('Video', VideoSchema);

    const CategorySchema = new mongoose.Schema({
      name: String, description: String, icon: String, color: String, order: Number, isActive: Boolean,
    }, { timestamps: true });
    const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

    const MedicalContactSchema = new mongoose.Schema({
      name: String, phone: String, email: String, address: String,
      type: String, notes: String, isActive: Boolean,
    }, { timestamps: true });
    const MedicalContact = mongoose.models.MedicalContact || mongoose.model('MedicalContact', MedicalContactSchema);

    const FeedbackSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      type: String, category: String, message: String, status: { type: String, default: 'new' },
    }, { timestamps: true });
    const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);

    const ReportSchema = new mongoose.Schema({
      reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      targetType: String, targetId: mongoose.Schema.Types.ObjectId,
      reason: String, status: { type: String, default: 'pending' },
    }, { timestamps: true });
    const Report = mongoose.models.Report || mongoose.model('Report', ReportSchema);

    const JourneyResourceSchema = new mongoose.Schema({
      resourceType: String, resourceId: mongoose.Schema.Types.ObjectId,
      isMandatory: Boolean, order: Number,
    }, { _id: false });

    const JourneyLevelSchema = new mongoose.Schema({
      levelNumber: Number, name: String, description: String,
      order: Number, resources: [JourneyResourceSchema], color: String, icon: String,
    }, { _id: false });

    const JourneySchema = new mongoose.Schema({
      name: String, description: String, longDescription: String,
      levels: [JourneyLevelSchema], isActive: Boolean, icon: String, color: String,
    }, { timestamps: true });
    const Journey = mongoose.models.Journey || mongoose.model('Journey', JourneySchema);

    const TestTemplateSchema = new mongoose.Schema({
      title: String, description: String, category: String,
      questions: mongoose.Schema.Types.Mixed, estimatedTime: Number,
      isActive: { type: Boolean, default: true },
    }, { timestamps: true });
    const TestTemplate = mongoose.models.TestTemplate || mongoose.model('TestTemplate', TestTemplateSchema);

    // ─── Helper ───
    const createIfNotExists = async (Model, query, data) => {
      const exists = await Model.findOne(query);
      if (!exists) { const doc = await Model.create(data); return { doc, created: true }; }
      return { doc: exists, created: false };
    };

    // ─── 1. Users ───
    console.log('👤 Creating Users...');
    const hashed = async (p) => await bcrypt.hash(p, 12);
    const { doc: admin } = await createIfNotExists(User, { email: 'admin@waey.com' }, {
      firstName: 'المدير', lastName: 'النظام', email: 'admin@waey.com',
      password: await hashed('admin123'), role: 'admin', isVerified: true, isApproved: true,
    });
    const { doc: user1 } = await createIfNotExists(User, { email: 'user@waey.com' }, {
      firstName: 'المستخدم', lastName: 'التجريبي', email: 'user@waey.com',
      password: await hashed('user123'), role: 'user', isVerified: true,
    });
    const { doc: therapist } = await createIfNotExists(User, { email: 'therapist@waey.com' }, {
      firstName: 'المعالج', lastName: 'النفسي', email: 'therapist@waey.com',
      password: await hashed('therapist123'), role: 'therapist', isVerified: true, isApproved: true,
    });
    console.log('  ✓ Users ready\n');

    // ─── 2. Therapist Profile ───
    console.log('🩺 Creating Therapist Profile...');
    const tp = await createIfNotExists(TherapistProfile, { userId: therapist._id }, {
      userId: therapist._id, specialty: 'العلاج المعرفي السلوكي', yearsOfExperience: 10,
      bio: 'متخصص في العلاج المعرفي السلوكي للقلق والاكتئاب', isVerified: true,
    });
    console.log(`  ✓ ${tp.created ? 'created' : 'exists'}\n`);

    // ─── 3. Categories ───
    console.log('📂 Creating Categories...');
    const cats = [
      { name: 'الصحة النفسية', icon: 'fas fa-brain', color: '#8B5CF6', order: 1 },
      { name: 'القلق والتوتر', icon: 'fas fa-cloud', color: '#F59E0B', order: 2 },
      { name: 'الاكتئاب', icon: 'fas fa-cloud-rain', color: '#3B82F6', order: 3 },
      { name: 'العلاقات', icon: 'fas fa-heart', color: '#EC4899', order: 4 },
      { name: 'التنمية الذاتية', icon: 'fas fa-seedling', color: '#10B981', order: 5 },
    ];
    let cCount = 0;
    for (const c of cats) { const r = await createIfNotExists(Category, { name: c.name }, c); if (r.created) cCount++; }
    console.log(`  ✓ ${cCount} new categories\n`);

    // ─── 4. Articles ───
    console.log('📰 Creating Articles...');
    const arts = [
      { title: 'فهم القلق: أسبابه وأعراضه', slug: 'understanding-anxiety', excerpt: 'تعرف على أنواع القلق', content: '# فهم القلق\n\nالقلق استجابة طبيعية للتوتر.', authorId: admin._id, tags: ['قلق'], status: 'published', readTime: 5, isFeatured: true, views: 150 },
      { title: '5 تقنيات استرخاء', slug: 'relaxation-techniques', excerpt: 'تعلم تقنيات التنفس', content: '# تقنيات الاسترخاء\n\n1. التنفس\n2. التأمل', authorId: therapist._id, tags: ['استرخاء'], status: 'published', readTime: 7, isFeatured: true, views: 200 },
      { title: 'الاكتئاب: ليس مجرد حزن', slug: 'depression-not-sadness', excerpt: 'فهم الاكتئاب', content: '# الاكتئاب\n\nحالة صحية حقيقية.', authorId: therapist._id, tags: ['اكتئاب'], status: 'published', readTime: 6, views: 120 },
      { title: 'علاقات صحية', slug: 'healthy-relationships', excerpt: 'نصائح للعلاقات', content: '# العلاقات\n\nالتواصل والاحترام.', authorId: admin._id, tags: ['علاقات'], status: 'published', readTime: 8, views: 80 },
    ];
    let aCount = 0; const createdArts = [];
    for (const a of arts) {
      const r = await createIfNotExists(Article, { slug: a.slug }, a);
      if (r.created) aCount++;
      createdArts.push(r.doc);
    }
    console.log(`  ✓ ${aCount} new articles\n`);

    // ─── 5. Posts (Community) ───
    console.log('💬 Creating Community Posts...');
    const posts = [
      { authorId: user1._id, title: 'كيف بدأت رحلة العلاج النفسي؟', content: 'أريد أن أشارك تجربتي مع العلاج النفسي...', category: 'support', status: 'approved', views: 45, likesCount: 12 },
      { authorId: user1._id, title: 'نصائح للتعامل مع القلق اليومي', content: 'بعد سنوات من التجربة، هذه أهم النصائح...', category: 'tips', status: 'approved', views: 78, likesCount: 25 },
    ];
    let pCount = 0; const createdPosts = [];
    for (const p of posts) { const r = await createIfNotExists(Post, { title: p.title, authorId: p.authorId }, p); if (r.created) pCount++; createdPosts.push(r.doc); }
    console.log(`  ✓ ${pCount} new posts\n`);

    // ─── 6. Comments ───
    console.log('💭 Creating Comments...');
    let comCount = 0;
    if (createdPosts[0]) {
      const r = await createIfNotExists(Comment, { content: 'شكراً على مشاركتك! تجربتي مشابهة.', postId: createdPosts[0]._id }, {
        authorId: therapist._id, postId: createdPosts[0]._id, content: 'شكراً على مشاركتك! تجربتي مشابهة.', likes: [],
      });
      if (r.created) comCount++;
    }
    console.log(`  ✓ ${comCount} new comments\n`);

    // ─── 7. Stories ───
    console.log('📖 Creating Stories...');
    const stors = [
      { authorId: user1._id, title: 'رحلتي مع القلق', content: 'عشت مع القلق 3 سنوات...', category: 'anxiety', status: 'approved', readTime: 3, views: 90 },
      { authorId: user1._id, title: 'تجاوزت الاكتئاب', content: 'كان الاكتئاب ظلاماً...', category: 'depression', status: 'approved', readTime: 4, views: 110 },
    ];
    let sCount = 0;
    for (const s of stors) { const r = await createIfNotExists(Story, { title: s.title, authorId: s.authorId }, s); if (r.created) sCount++; }
    console.log(`  ✓ ${sCount} new stories\n`);

    // ─── 8. Books ───
    console.log('📚 Creating Books...');
    const bks = [
      { title: 'فهم القلق', slug: 'anxiety-book', author: 'د. أحمد', description: 'كتاب شامل', pages: 120, isFeatured: true, isActive: true },
      { title: 'التأمل', slug: 'meditation', author: 'د. سارة', description: 'دليل عملي', pages: 85, isActive: true },
      { title: 'التفكير الإيجابي', slug: 'positive-thinking', author: 'د. محمد', description: 'حول أفكارك', pages: 150, isFeatured: true, isActive: true },
    ];
    let bCount = 0; const createdBks = [];
    for (const b of bks) { const r = await createIfNotExists(Book, { slug: b.slug }, b); if (r.created) bCount++; createdBks.push(r.doc); }
    console.log(`  ✓ ${bCount} new books\n`);

    // ─── 9. Videos ───
    console.log('🎬 Creating Videos...');
    const vids = [
      { title: 'تقنيات التنفس', description: '3 تقنيات فعالة', videoUrl: 'https://www.youtube.com/watch?v=inpFizGfPQw', addedBy: admin._id, category: 'تأمل', tags: ['تنفس'], isFeatured: true, duration: 300, isActive: true, views: 500 },
      { title: 'نوبة الهلع', description: 'خطوات عملية', videoUrl: 'https://www.youtube.com/watch?v=efdF9p8bEYE', addedBy: admin._id, category: 'قلق', tags: ['هلع'], duration: 420, isActive: true, views: 350 },
      { title: '5 عادات صحية', description: 'عادات يومية', videoUrl: 'https://www.youtube.com/watch?v=rkZl2gsLUp4', addedBy: admin._id, category: 'تنمية ذاتية', tags: ['عادات'], isFeatured: true, duration: 480, isActive: true, views: 280 },
    ];
    let vCount = 0; const createdVids = [];
    for (const v of vids) { const r = await createIfNotExists(Video, { title: v.title }, v); if (r.created) vCount++; createdVids.push(r.doc); }
    console.log(`  ✓ ${vCount} new videos\n`);

    // ─── 10. Medical Contacts ───
    console.log('🏥 Creating Medical Contacts...');
    const mcs = [
      { name: 'مستشفى الصحة النفسية', phone: '+20 2 12345678', email: 'info@hospital.eg', address: 'القاهرة', type: 'hospital', isActive: true },
      { name: 'عيادة الهدوء', phone: '+20 2 87654321', email: 'contact@clinic.eg', address: 'الإسكندرية', type: 'clinic', isActive: true },
      { name: 'د. خالد - طبيب', phone: '+20 100 1234567', email: 'doctor@example.com', address: 'الجيزة', type: 'doctor', isActive: true },
    ];
    let mCount = 0;
    for (const c of mcs) { const r = await createIfNotExists(MedicalContact, { name: c.name }, c); if (r.created) mCount++; }
    console.log(`  ✓ ${mCount} new contacts\n`);

    // ─── 11. Feedback ───
    console.log('📝 Creating Feedback...');
    const fb = [
      { userId: user1._id, type: 'bug', category: 'general', message: 'تطبيق رائع، شكراً لكم!', status: 'new' },
    ];
    let fbCount = 0;
    for (const f of fb) { const r = await createIfNotExists(Feedback, { message: f.message, userId: f.userId }, f); if (r.created) fbCount++; }
    console.log(`  ✓ ${fbCount} new feedback\n`);

    // ─── 12. Test Templates ───
    console.log('🧪 Creating Test Templates...');
    const tests = [
      { title: 'اختبار مستوى القلق (GAD-7)', description: 'مقياس القلق المعمم', category: 'anxiety',
        questions: [
          { text: 'الشعور بالتوتر أو القلق أو العصبية', options: ['أبداً', 'عدة أيام', 'أكثر من نصف الأيام', 'تقريباً كل يوم'] },
          { text: 'عدم القدرة على إيقاف القلق', options: ['أبداً', 'عدة أيام', 'أكثر من نصف الأيام', 'تقريباً كل يوم'] },
          { text: 'القلق الزائد عن أشياء كثيرة', options: ['أبداً', 'عدة أيام', 'أكثر من نصف الأيام', 'تقريباً كل يوم'] },
          { text: 'صعوبة الاسترخاء', options: ['أبداً', 'عدة أيام', 'أكثر من نصف الأيام', 'تقريباً كل يوم'] },
        ],
        estimatedTime: 3, isActive: true,
      },
    ];
    let tCount = 0;
    for (const t of tests) { const r = await createIfNotExists(TestTemplate, { title: t.title }, t); if (r.created) tCount++; }
    console.log(`  ✓ ${tCount} new tests\n`);

    // ─── 13. Journey ───
    console.log('🛤️  Creating Journey...');
    const jExists = await Journey.findOne({ name: 'رحلة التغلب على القلق' });
    if (!jExists) {
      await Journey.create({
        name: 'رحلة التغلب على القلق', description: 'رحلة متخصصة', longDescription: 'رحلة مصممة لمساعدتك.',
        icon: 'fa-brain', color: '#8B5CF6', isActive: true,
        levels: [
          { levelNumber: 1, name: 'فهم القلق', description: 'تعرف على القلق', order: 1, color: '#F59E0B', icon: 'fa-seedling', resources: [{ resourceType: 'article', resourceId: createdArts[0]._id, isMandatory: true, order: 1 }, { resourceType: 'video', resourceId: createdVids[0]._id, isMandatory: true, order: 2 }] },
          { levelNumber: 2, name: 'تقنيات الاسترخاء', description: 'تعلم التنفس', order: 2, color: '#10B981', icon: 'fa-heart', resources: [{ resourceType: 'article', resourceId: createdArts[1]._id, isMandatory: true, order: 1 }] },
          { levelNumber: 3, name: 'إعادة صياغة الأفكار', description: 'حول الأفكار السلبية', order: 3, color: '#3B82F6', icon: 'fa-toolbox', resources: [{ resourceType: 'book', resourceId: createdBks[0]._id, isMandatory: true, order: 1 }] },
          { levelNumber: 4, name: 'بناء حياة هادئة', description: 'بناء روتين', order: 4, color: '#8B5CF6', icon: 'fa-star', resources: [{ resourceType: 'article', resourceId: createdArts[3]._id, isMandatory: false, order: 1 }] },
        ],
      });
      console.log('  ✓ Journey created\n');
    } else { console.log('  ✓ Journey exists\n'); }

    // ─── Summary ───
    console.log('═══════════════════════════════════');
    console.log('✅ Seeding Complete!');
    console.log('═══════════════════════════════════\n');
    console.log('🔐 Login: admin@waey.com / admin123');

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Seed error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
