/**
 * Remove coverImage field from all articles
 * Run: node remove-article-cover-images.js
 */

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@mongo:27017/waey?authSource=admin';

async function removeCoverImages() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create Article model
    const Article = mongoose.model('Article', new mongoose.Schema({
      title: String,
      slug: String,
      excerpt: String,
      content: String,
      coverImage: String,
      authorId: mongoose.Schema.Types.ObjectId,
      tags: [String],
      status: String,
      views: Number,
      likes: [mongoose.Schema.Types.ObjectId],
      isFeatured: Boolean,
      order: Number,
      publishedAt: Date,
      readTime: Number,
    }, { timestamps: true }));

    // Remove coverImage from all articles
    console.log('🗑️  Removing coverImage field from all articles...');
    const result = await Article.updateMany({}, { $unset: { coverImage: 1 } });
    
    console.log(`✅ Updated ${result.modifiedCount} articles`);
    console.log(`ℹ️  Matched ${result.matchedCount} articles`);

    await mongoose.disconnect();
    console.log('\n✅ Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error removing cover images:', error);
    process.exit(1);
  }
}

// Run the cleanup
removeCoverImages();
