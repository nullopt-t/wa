/**
 * Migrate Local MongoDB to Atlas
 * Run: node migrate-local-to-atlas.js
 * 
 * Copies all data from local MongoDB to MongoDB Atlas
 */

const mongoose = require('mongoose');

// Connection strings
const LOCAL_URI = process.env.LOCAL_URI || 'mongodb://admin:password@localhost:27017/waey?authSource=admin';
const ATLAS_URI = process.env.ATLAS_URI || 'mongodb+srv://hedrsag:test@cluster0.ysstcmo.mongodb.net/?appName=Cluster0';

async function migrateData() {
  try {
    console.log('📡 Connecting to LOCAL MongoDB...');
    await mongoose.connect(LOCAL_URI);
    console.log('✅ Connected to LOCAL MongoDB');

    // Get all collections from local DB
    const localDb = mongoose.connection.db;
    const collections = await localDb.collections();
    
    console.log(`\n📋 Found ${collections.length} collections:\n`);
    
    const dataToMigrate = {};
    
    // Read all data from local
    for (const collection of collections) {
      const name = collection.collectionName;
      const count = await collection.countDocuments();
      console.log(`  📄 ${name}: ${count} documents`);
      
      if (count > 0) {
        const docs = await collection.find().toArray();
        dataToMigrate[name] = docs;
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Read all data from local MongoDB\n');

    // Connect to Atlas
    console.log('📡 Connecting to ATLAS MongoDB...');
    await mongoose.connect(ATLAS_URI);
    console.log('✅ Connected to ATLAS MongoDB');

    const atlasDb = mongoose.connection.db;

    // Clear existing data in Atlas (optional - comment out if you want to keep existing data)
    console.log('\n⚠️  Clearing existing data in Atlas...');
    for (const collectionName of Object.keys(dataToMigrate)) {
      await atlasDb.collection(collectionName).deleteMany({});
      console.log(`  🗑️  Cleared: ${collectionName}`);
    }

    // Insert data into Atlas
    console.log('\n💾 Migrating data to Atlas...\n');
    
    for (const [collectionName, docs] of Object.entries(dataToMigrate)) {
      if (docs.length > 0) {
        // Convert ObjectId strings back to ObjectId if needed
        const processedDocs = docs.map(doc => {
          const processed = { ...doc };
          // Convert _id string back to ObjectId if it's a string
          if (typeof processed._id === 'string') {
            const { ObjectId } = require('mongodb');
            processed._id = new ObjectId(processed._id);
          }
          // Convert date strings back to Date objects
          if (processed.createdAt && typeof processed.createdAt === 'string') {
            processed.createdAt = new Date(processed.createdAt);
          }
          if (processed.updatedAt && typeof processed.updatedAt === 'string') {
            processed.updatedAt = new Date(processed.updatedAt);
          }
          return processed;
        });

        await atlasDb.collection(collectionName).insertMany(processedDocs);
        console.log(`  ✅ Migrated ${docs.length} documents to ${collectionName}`);
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    for (const [collectionName, docs] of Object.entries(dataToMigrate)) {
      console.log(`  - ${collectionName}: ${docs.length} documents`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();
