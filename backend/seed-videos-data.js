/**
 * Seed Videos Data Script
 * Run: node seed-videos-data.js
 */

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@mongo:27017/waey?authSource=admin';

// Sample videos data (Egyptian mental health content)
const videosData = [
  {
    title: 'ما هي الصحة النفسية؟',
    description: 'مقدمة شاملة عن الصحة النفسية وأهميتها في حياتنا اليومية',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Replace with actual video ID
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: 300, // 5 minutes
    category: 'تعليمي',
    tags: ['صحة نفسية', 'توعية', 'مقدمة'],
    isFeatured: true,
    isActive: true,
    order: 1,
  },
  {
    title: 'كيفية التعامل مع القلق',
    description: 'تقنيات عملية للتعامل مع نوبات القلق والتوتر',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: 420, // 7 minutes
    category: 'تقنيات علاجية',
    tags: ['قلق', 'توتر', 'تقنيات'],
    isFeatured: true,
    isActive: true,
    order: 2,
  },
  {
    title: 'أعراض الاكتئاب وكيفية التعرف عليها',
    description: 'دليل شامل للتعرف على أعراض الاكتئاب ومتى تطلب المساعدة',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: 540, // 9 minutes
    category: 'توعية',
    tags: ['اكتئاب', 'أعراض', 'تشخيص'],
    isFeatured: true,
    isActive: true,
    order: 3,
  },
  {
    title: 'تمارين التنفس للاسترخاء',
    description: 'تمارين تنفس بسيطة تساعد على الاسترخاء وتقليل التوتر',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: 180, // 3 minutes
    category: 'تمارين عملية',
    tags: ['تنفس', 'استرخاء', 'توتر'],
    isFeatured: false,
    isActive: true,
    order: 4,
  },
  {
    title: 'أهمية النوم للصحة النفسية',
    description: 'كيف يؤثر النوم على صحتك النفسية ونصائح لنوم أفضل',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: 360, // 6 minutes
    category: 'نمط حياة',
    tags: ['نوم', 'صحة', 'عادات'],
    isFeatured: false,
    isActive: true,
    order: 5,
  },
  {
    title: 'كيفية بناء الثقة بالنفس',
    description: 'خطوات عملية لبناء وتعزيز الثقة بالنفس',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: 480, // 8 minutes
    category: 'تطوير ذات',
    tags: ['ثقة', 'تطوير', 'نفسية'],
    isFeatured: false,
    isActive: true,
    order: 6,
  },
  {
    title: 'التعامل مع الغضب بطريقة صحية',
    description: 'استراتيجيات للتعامل مع الغضب والتحكم في المشاعر',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: 420, // 7 minutes
    category: 'تقنيات علاجية',
    tags: ['غضب', 'مشاعر', 'تحكم'],
    isFeatured: false,
    isActive: true,
    order: 7,
  },
  {
    title: 'أهمية العلاقات الاجتماعية للصحة النفسية',
    description: 'كيف تؤثر علاقاتنا على صحتنا النفسية وكيفية بنائها',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: 390, // 6.5 minutes
    category: 'علاقات',
    tags: ['علاقات', 'مجتمع', 'دعم'],
    isFeatured: false,
    isActive: true,
    order: 8,
  },
];

async function seedVideos() {
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get admin user or first user
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      role: String,
      firstName: String,
      lastName: String,
    }));
    
    let adminUser = await User.findOne({ role: 'admin' });
    
    // If no admin, use first user
    if (!adminUser) {
      console.log('⚠️  No admin user found, using first user...');
      adminUser = await User.findOne();
    }

    if (!adminUser) {
      console.error('❌ No users found. Please create a user first.');
      await mongoose.disconnect();
      return;
    }

    console.log(`👤 Using user: ${adminUser.email} (${adminUser.role})`);

    // Create Video model
    const Video = mongoose.model('Video', new mongoose.Schema({
      title: String,
      description: String,
      videoUrl: String,
      thumbnailUrl: String,
      duration: Number,
      category: String,
      tags: [String],
      isFeatured: Boolean,
      isActive: Boolean,
      order: Number,
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      views: { type: Number, default: 0 },
    }, { timestamps: true }));

    // Clear existing videos (optional)
    console.log('🗑️  Clearing existing videos...');
    await Video.deleteMany({});
    console.log('✅ Existing videos cleared');

    // Insert videos
    console.log('📹 Inserting videos...');
    const videos = videosData.map(video => ({
      ...video,
      addedBy: adminUser._id,
    }));

    await Video.insertMany(videos);
    console.log(`✅ Successfully inserted ${videos.length} videos`);

    // Display summary
    console.log('\n📊 Summary:');
    console.log(`   Total videos: ${videos.length}`);
    console.log(`   Featured: ${videos.filter(v => v.isFeatured).length}`);
    console.log(`   Active: ${videos.filter(v => v.isActive).length}`);

    await mongoose.disconnect();
    console.log('\n✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding videos:', error);
    process.exit(1);
  }
}

// Run the seed function
seedVideos();
