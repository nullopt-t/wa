/**
 * Seed script to add tags to existing posts
 * Run with: node seed-post-tags.js
 */

const mongoose = require('mongoose');

const MONGODB_URL = process.env.DATABASE_URL;

if (!MONGODB_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Sample tags for mental health topics
const sampleTags = [
  'anxiety',
  'depression',
  'stress',
  'mental-health',
  'self-care',
  'therapy',
  'mindfulness',
  'meditation',
  'wellness',
  'support',
  'healing',
  'motivation',
  'positivity',
  'recovery',
  'hope'
];

async function seedTags() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URL);
    console.log('Connected!');

    const Post = mongoose.model('Post', new mongoose.Schema({
      title: String,
      content: String,
      tags: [String],
      status: String,
      authorId: mongoose.Schema.Types.ObjectId,
      categoryId: mongoose.Schema.Types.ObjectId,
    }, { timestamps: true }), 'posts');

    // Get all posts without tags
    const postsWithoutTags = await Post.find({
      $or: [
        { tags: { $exists: false } },
        { tags: { $size: 0 } }
      ]
    });

    console.log(`Found ${postsWithoutTags.length} posts without tags`);

    let updated = 0;
    for (const post of postsWithoutTags) {
      // Assign 1-3 random tags
      const numTags = Math.floor(Math.random() * 3) + 1;
      const shuffled = sampleTags.sort(() => 0.5 - Math.random());
      const selectedTags = shuffled.slice(0, numTags);

      post.tags = selectedTags;
      await post.save();
      updated++;

      console.log(`Updated post "${post.title}" with tags: ${selectedTags.join(', ')}`);
    }

    console.log(`\n✅ Successfully added tags to ${updated} posts!`);

    // Show trending tags
    const trending = await Post.aggregate([
      { $match: { tags: { $exists: true, $ne: [] } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    console.log('\n📊 Trending tags:');
    trending.forEach(t => console.log(`  #${t._id}: ${t.count} posts`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

seedTags();
