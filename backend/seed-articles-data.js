/**
 * Seed script to populate articles collection with sample data
 * Run with: node seed-articles-data.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Article = mongoose.model('Article', new mongoose.Schema({
  title: String,
  slug: String,
  excerpt: String,
  content: String,
  coverImage: String,
  authorId: mongoose.Schema.Types.ObjectId,
  tags: [String],
  categoryId: mongoose.Schema.Types.ObjectId,
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  bookmarks: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'published' 
  },
  publishedAt: Date,
  readTime: { type: Number, default: 5 },
  isFeatured: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true }));

const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  avatar: String,
  role: String
}));

const Category = mongoose.model('Category', new mongoose.Schema({
  name: String,
  nameAr: String,
  description: String
}));

const articles = [
  {
    title: 'كيف تتعامل مع القلق والتوتر؟',
    slug: 'how-to-deal-with-anxiety-and-stress',
    excerpt: 'تعلم استراتيجيات عملية للتعامل مع القلق والتوتر في حياتك اليومية',
    content: `
      <h2>مقدمة</h2>
      <p>القلق والتوتر جزء طبيعي من الحياة، لكن عندما يصبحان مفرطين، يمكن أن يؤثرا سلباً على صحتنا النفسية والجسدية. في هذا المقال، سنتعلم استراتيجيات عملية للتعامل معهما.</p>

      <h2>1. تمارين التنفس العميق</h2>
      <p>التنفس العميق يساعد على تهدئة الجهاز العصبي. جرب هذه التقنية:</p>
      <ul>
        <li>استنشق ببطء من أنفك لمدة 4 ثوانٍ</li>
        <li>احبس النفس لمدة 4 ثوانٍ</li>
        <li>ازفر ببطء من فمك لمدة 6 ثوانٍ</li>
        <li>كرر 5-10 مرات</li>
      </ul>

      <h2>2. ممارسة الرياضة بانتظام</h2>
      <p>الرياضة تفرز الإندورفين الذي يحسن المزاج ويقلل التوتر. حتى المشي لمدة 30 دقيقة يومياً يمكن أن يحدث فرقاً كبيراً.</p>

      <h2>3. النوم الكافي</h2>
      <p>قلة النوم تزيد من القلق. حاول النوم 7-9 ساعات يومياً في بيئة هادئة ومظلمة.</p>

      <h2>4. التحدث مع شخص تثق به</h2>
      <p>مشاركة مشاعرك مع صديق أو فرد من العائلة يمكن أن يخفف من العبء النفسي.</p>

      <h2>5. طلب المساعدة المهنية</h2>
      <p>إذا كان القلق يؤثر على حياتك اليومية، لا تتردد في طلب المساعدة من مختص نفسي.</p>

      <h2>خاتمة</h2>
      <p>تذكر أن التعامل مع القلق عملية مستمرة. كن صبوراً مع نفسك واطلب الدعم عندما تحتاجه.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    tags: ['قلق', 'توتر', 'صحة نفسية', 'تقنيات استرخاء'],
    readTime: 5,
    isFeatured: true,
    order: 1
  },
  {
    title: 'أهمية الصحة النفسية في مكان العمل',
    slug: 'importance-of-mental-health-in-workplace',
    excerpt: 'اكتشف كيف تؤثر الصحة النفسية على إنتاجيتك وسعادتك في العمل',
    content: `
      <h2>مقدمة</h2>
      <p>الصحة النفسية في مكان العمل ليست رفاهية، بل ضرورة. في هذا المقال، نستكشف أهمية العناية بالصحة النفسية وكيفية تحسينها.</p>

      <h2>تأثير الصحة النفسية على الإنتاجية</h2>
      <p>الموظفون الذين يتمتعون بصحة نفسية جيدة يكونون:</p>
      <ul>
        <li>أكثر إنتاجية وإبداعاً</li>
        <li>أقل تغيباً عن العمل</li>
        <li>أكثر رضا عن وظائفهم</li>
        <li>أفضل في التعامل مع الضغوط</li>
      </ul>

      <h2>علامات التوتر في العمل</h2>
      <p>انتبه لهذه العلامات:</p>
      <ul>
        <li>التعب المستمر</li>
        <li>صعوبة التركيز</li>
        <li>التهيج والغضب السريع</li>
        <li>انسحاب اجتماعي</li>
      </ul>

      <h2>نصائح لتحسين الصحة النفسية في العمل</h2>
      <ol>
        <li>خذ استراحات منتظمة</li>
        <li>حدد أولوياتك بوضوح</li>
        <li>تواصل بفعالية مع زملائك</li>
        <li>حافظ على توازن العمل والحياة</li>
        <li>اطلب الدعم عند الحاجة</li>
      </ol>

      <h2>خاتمة</h2>
      <p>العناية بصحتك النفسية في العمل ليست أنانية، بل استثمار في نجاحك وسعادتك.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    tags: ['عمل', 'إنتاجية', 'توازن', 'صحة نفسية'],
    readTime: 6,
    isFeatured: true,
    order: 2
  },
  {
    title: 'الاكتئاب: فهمه والتعامل معه',
    slug: 'depression-understanding-and-coping',
    excerpt: 'دليل شامل لفهم الاكتئاب وطرق التعامل معه بفعالية',
    content: `
      <h2>ما هو الاكتئاب؟</h2>
      <p>الاكتئاب ليس مجرد شعور بالحزن، بل هو اضطراب نفسي يؤثر على المشاعر والأفكار والسلوكيات اليومية.</p>

      <h2>أعراض الاكتئاب</h2>
      <ul>
        <li>حزن مستمر أو فراغ عاطفي</li>
        <li>فقدان الاهتمام بالأنشطة الممتعة</li>
        <li>تغيرات في الشهية والوزن</li>
        <li>اضطرابات النوم</li>
        <li>تعب مستمر</li>
        <li>صعوبة في التركيز</li>
        <li>أفكار سلبية عن الذات</li>
      </ul>

      <h2>طرق التعامل مع الاكتئاب</h2>
      <h3>1. العلاج النفسي</h3>
      <p>العلاج المعرفي السلوكي وغيره من أنواع العلاج يمكن أن يساعد بشكل كبير.</p>

      <h3>2. الدواء</h3>
      <p>في بعض الحالات، قد يصف الطبيب مضادات الاكتئاب.</p>

      <h3>3. نمط الحياة الصحي</h3>
      <ul>
        <li>ممارسة الرياضة</li>
        <li>النوم الكافي</li>
        <li>التغذية المتوازنة</li>
        <li>التواصل الاجتماعي</li>
      </ul>

      <h2>متى تطلب المساعدة؟</h2>
      <p>إذا استمرت الأعراض لأكثر من أسبوعين وأثرت على حياتك اليومية، فمن المهم طلب المساعدة المهنية.</p>

      <h2>خاتمة</h2>
      <p>الاكتئاب قابل للعلاج. لا تتردد في طلب المساعدة، فأنت لست وحدك.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800',
    tags: ['اكتئاب', 'صحة نفسية', 'علاج', 'دعم'],
    readTime: 7,
    isFeatured: true,
    order: 3
  },
  {
    title: '5 عادات يومية لتحسين صحتك النفسية',
    slug: '5-daily-habits-for-better-mental-health',
    excerpt: 'عادات بسيطة يمكنك ممارستها يومياً لتحسين صحتك النفسية',
    content: `
      <h2>مقدمة</h2>
      <p>العادات الصغيرة يمكن أن تحدث فرقاً كبيراً في صحتك النفسية. إليك 5 عادات يومية بسيطة:</p>

      <h2>1. الامتنان اليومي</h2>
      <p>اكتب 3 أشياء أنت ممتن لها كل يوم. هذا يغير تركيزك من السلبيات إلى الإيجابيات.</p>

      <h2>2. التأمل أو الصلاة</h2>
      <p>10 دقائق يومياً من التأمل أو الصلاة يمكن أن تقلل التوتر وتزيد السلام الداخلي.</p>

      <h2>3. الحركة الجسدية</h2>
      <p>لا يجب أن تكون رياضة شاقة. حتى المشي 20 دقيقة يكفي لتحسين المزاج.</p>

      <h2>4. التواصل الاجتماعي</h2>
      <p>تواصل مع شخص واحد على الأقل يومياً، حتى لو كان برسالة قصيرة.</p>

      <h2>5. النوم المنتظم</h2>
      <p>حاول النوم والاستيقاظ في نفس الوقت يومياً لتحسين جودة النوم والمزاج.</p>

      <h2>خاتمة</h2>
      <p>ابدأ بعادة واحدة وأضف الأخرى تدريجياً. الاستمرارية أهم من الكمال.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800',
    tags: ['عادات', 'صحة نفسية', 'تطوير ذات', 'روتين'],
    readTime: 4,
    isFeatured: false,
    order: 4
  },
  {
    title: 'كيف تبني ثقة بنفسك قوية؟',
    slug: 'how-to-build-strong-self-confidence',
    excerpt: 'خطوات عملية لبناء وتعزيز الثقة بالنفس',
    content: `
      <h2>ما هي الثقة بالنفس؟</h2>
      <p>الثقة بالنفس هي الإيمان بقدراتك وقيمتك كشخص. هي مهارة يمكن بناؤها وتطويرها.</p>

      <h2>خطوات بناء الثقة</h2>
      
      <h3>1. حدد نقاط قوتك</h3>
      <p>اكتب 5 نقاط قوة تملكها. راجعها عندما تشك في نفسك.</p>

      <h3>2. حدد أهدافاً واقعية</h3>
      <p>ابدأ بأهداف صغيرة واحتفل بإنجازاتك.</p>

      <h3>3. تحدث مع نفسك بإيجابية</h3>
      <p>استبدل النقد الذاتي القاسي بكلمات مشجعة.</p>

      <h3>4. تعلم من الفشل</h3>
      <p>الفشل ليس نهاية، بل فرصة للتعلم والنمو.</p>

      <h3>5. اعتنِ بمظهرك</h3>
      <p>العناية بالنفس تعكس احترامك لذاتك.</p>

      <h2>خاتمة</h2>
      <p>بناء الثقة عملية مستمرة. كن صبوراً ورحيماً مع نفسك.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800',
    tags: ['ثقة', 'تطوير ذات', 'نجاح', 'تحفيز'],
    readTime: 5,
    isFeatured: false,
    order: 5
  }
];

async function seedArticles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://admin:password@localhost:27017/waey?authSource=admin');
    console.log('✅ Connected to MongoDB');

    // Find a user to be the author
    const user = await User.findOne({ role: 'user' });
    if (!user) {
      console.log('❌ No user found. Please create a user first.');
      process.exit(1);
    }
    console.log(`✅ Using author: ${user.firstName} ${user.lastName}`);

    // Find a category
    const category = await Category.findOne({ nameAr: 'العلاج' });
    if (!category) {
      console.log('⚠️ No category found. Articles will be created without category.');
    }

    // Delete existing articles
    await Article.deleteMany({});
    console.log('🗑️ Deleted existing articles');

    // Insert articles
    const now = new Date();
    const articlesToInsert = articles.map((article, index) => ({
      ...article,
      authorId: user._id,
      categoryId: category?._id || null,
      publishedAt: new Date(now.getTime() - (index * 24 * 60 * 60 * 1000)), // Spread over days
      views: Math.floor(Math.random() * 500) + 50,
      likes: Math.floor(Math.random() * 50) + 5,
      bookmarks: Math.floor(Math.random() * 20) + 1
    }));

    const inserted = await Article.insertMany(articlesToInsert);
    console.log(`✅ Successfully seeded ${inserted.length} articles`);

    inserted.forEach(article => {
      console.log(`  📄 ${article.title}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding articles:', error);
    process.exit(1);
  }
}

seedArticles();
