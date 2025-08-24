const mongoose = require('mongoose');
const Post = require('../models/Post');

// Connect to MongoDB
require('dotenv').config();
if (!process.env.MONGO_URI) {
    console.error("⚠️ MONGO_URI is missing. Check your .env file.");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI);

const migrateLikes = async () => {
    try {
        console.log('Starting likes field migration...');
        
        // Get all posts
        const posts = await Post.find({});
        console.log(`Found ${posts.length} posts to process`);
        
        let migratedCount = 0;
        let alreadyOkCount = 0;

        for (const post of posts) {
            let shouldUpdate = false;
            
            // Check if likes is not an array or is undefined
            if (!Array.isArray(post.likes)) {
                console.log(`Fixing likes field for post ${post._id} (Current value: ${post.likes})`);
                shouldUpdate = true;
                post.likes = [];
                migratedCount++;
            } else {
                alreadyOkCount++;
            }
            
            // Update post if needed
            if (shouldUpdate) {
                try {
                    await Post.updateOne(
                        { _id: post._id },
                        { $set: { likes: [] } }
                    );
                    console.log(`Successfully migrated post ${post._id}`);
                } catch (updateError) {
                    console.error(`Error updating post ${post._id}:`, updateError);
                }
            }
        }
        
        console.log(`\nLikes field migration completed:`);
        console.log(`- Migrated posts: ${migratedCount}`);
        console.log(`- Already correct: ${alreadyOkCount}`);
        console.log(`- Total posts processed: ${posts.length}`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
};

// Run migration
migrateLikes();
