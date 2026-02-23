/**
 * Seed script to create default community categories
 * Run with: node seed-community-categories.js
 */

const mongoose = require('mongoose');

const DB_URL = process.env.DATABASE_URL || 'mongodb://admin:password@localhost:27017/waey?authSource=admin';

// Category schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  nameAr: { type: String, required: true },
  description: String,
  icon: String,
  color: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  postCount: { type: Number, default: 0 },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

// Default categories
const defaultCategories = [
  {
    name: 'support',
    nameAr: 'الدعم العام',
    description: 'مساحة للدعم العام والمشاركة',
    icon: 'fa-hands-helping',
    color: '#3498db',
    order: 1,
  },
  {
    name: 'anxiety',
    nameAr: 'القلق والتوتر',
    description: 'نقاشات حول القلق وطرق التعامل معه',
    icon: 'fa-wind',
    color: '#e74c3c',
    order: 2,
  },
  {
    name: 'depression',
    nameAr: 'الاكتئاب',
    description: 'دعم ومتابعة لحالات الاكتئاب',
    icon: 'fa-cloud-rain',
    color: '#5555aa',
    order: 3,
  },
  {
    name: 'therapy',
    nameAr: 'العلاج',
    description: 'تجارب ونصائح حول العلاج النفسي',
    icon: 'fa-heartbeat',
    color: '#27ae60',
    order: 4,
  },
  {
    name: 'self-care',
    nameAr: 'العناية بالذات',
    description: 'نصائح وأنشطة للعناية بالصحة النفسية',
    icon: 'fa-spa',
    color: '#f39c12',
    order: 5,
  },
  {
    name: 'relationships',
    nameAr: 'العلاقات',
    description: 'نقاشات حول العلاقات الاجتماعية والأسرية',
    icon: 'fa-users',
    color: '#e91e63',
    order: 6,
  },
  {
    name: 'success-stories',
    nameAr: 'قصص النجاح',
    description: 'شارك قصة نجاحك في التغلب على التحديات',
    icon: 'fa-trophy',
    color: '#f1c40f',
    order: 7,
  },
  {
    name: 'questions',
    nameAr: 'أسئلة واستفسارات',
    description: 'اطرح أسئلتك واحصل على إجابات من المجتمع',
    icon: 'fa-question-circle',
    color: '#1abc9c',
    order: 8,
  },
];

async function seedCategories() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(DB_URL);
    console.log('✅ Connected to MongoDB');

    console.log('📝 Seeding categories...');
    
    for (const categoryData of defaultCategories) {
      const category = await Category.findOneAndUpdate(
        { name: categoryData.name },
        categoryData,
        { upsert: true, new: true }
      );
      console.log(`✅ Created/Updated: ${category.nameAr}`);
    }

    console.log('🎉 Seeding completed successfully!');
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
