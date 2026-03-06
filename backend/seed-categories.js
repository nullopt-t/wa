/**
 * Seed Categories Data Script
 * Run: node seed-categories.js
 */

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@mongo:27017/waey?authSource=admin';

// Categories data
const categoriesData = [
  {
    name: 'Articles',
    nameAr: 'المقالات',
    icon: 'fa-newspaper',
    color: '#c5a98e',
    order: 1,
    isActive: true,
  },
  {
    name: 'Videos',
    nameAr: 'الفيديوهات',
    icon: 'fa-video',
    color: '#8b5cf6',
    order: 2,
    isActive: true,
  },
  {
    name: 'Community',
    nameAr: 'المجتمع',
    icon: 'fa-users',
    color: '#10b981',
    order: 3,
    isActive: true,
  },
  {
    name: 'Future Message',
    nameAr: 'رسالة مستقبلية',
    icon: 'fa-envelope',
    color: '#f59e0b',
    order: 4,
    isActive: true,
  },
  {
    name: 'Sessions',
    nameAr: 'الجلسات',
    icon: 'fa-calendar',
    color: '#3b82f6',
    order: 5,
    isActive: true,
  },
  {
    name: 'Therapists',
    nameAr: 'المعالجون',
    icon: 'fa-user-md',
    color: '#ef4444',
    order: 6,
    isActive: true,
  },
];

async function seedCategories() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create Category model
    const Category = mongoose.model('Category', new mongoose.Schema({
      name: String,
      nameAr: String,
      icon: String,
      color: String,
      order: Number,
      isActive: Boolean,
      articlesCount: { type: Number, default: 0 },
      videosCount: { type: Number, default: 0 },
    }, { timestamps: true }));

    // Clear existing categories (optional)
    console.log('🗑️  Clearing existing categories...');
    await Category.deleteMany({});
    console.log('✅ Existing categories cleared');

    // Insert categories
    console.log('📁 Inserting categories...');
    await Category.insertMany(categoriesData);
    console.log(`✅ Successfully inserted ${categoriesData.length} categories`);

    // Display summary
    console.log('\n📊 Summary:');
    categoriesData.forEach(cat => {
      console.log(`   - ${cat.nameAr} (${cat.name})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

// Run the seed function
seedCategories();
