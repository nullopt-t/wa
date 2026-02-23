const mongoose = require('mongoose');

const DB_URL = process.env.DATABASE_URL || 'mongodb://admin:password@localhost:27017/waey?authSource=admin';

async function approveFirstPost() {
  try {
    await mongoose.connect(DB_URL);
    console.log('✅ Connected to MongoDB');

    const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }));
    
    const result = await Post.updateOne({}, { $set: { status: 'approved' } });
    
    if (result.modifiedCount > 0) {
      console.log('✅ Post approved successfully!');
    } else {
      console.log('ℹ️  No posts found to approve');
    }

    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

approveFirstPost();
