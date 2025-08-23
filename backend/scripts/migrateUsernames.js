const mongoose = require('mongoose');
const User = require('../models/User');
const { generateUsernameFromFullName } = require('../utils/usernameGenerator');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codeclash', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function migrateUsernames() {
    try {
        console.log('Starting username migration...');
        
        // Find all users without usernames
        const usersWithoutUsernames = await User.find({ 
            $or: [
                { username: { $exists: false } },
                { username: null },
                { username: '' }
            ]
        });
        
        console.log(`Found ${usersWithoutUsernames.length} users without usernames`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const user of usersWithoutUsernames) {
            try {
                // Generate unique username
                const username = await generateUsernameFromFullName(user.name);
                
                // Update user
                user.username = username;
                await user.save();
                
                console.log(`✓ Generated username "${username}" for user "${user.name}" (${user.email})`);
                successCount++;
            } catch (error) {
                console.error(`✗ Failed to generate username for user "${user.name}" (${user.email}):`, error.message);
                errorCount++;
            }
        }
        
        console.log('\nMigration completed!');
        console.log(`✓ Successfully migrated: ${successCount} users`);
        console.log(`✗ Failed migrations: ${errorCount} users`);
        
        // Verify all users now have usernames
        const remainingUsersWithoutUsernames = await User.find({ 
            $or: [
                { username: { $exists: false } },
                { username: null },
                { username: '' }
            ]
        });
        
        if (remainingUsersWithoutUsernames.length === 0) {
            console.log('✓ All users now have usernames!');
        } else {
            console.log(`⚠ ${remainingUsersWithoutUsernames.length} users still don't have usernames`);
        }
        
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    migrateUsernames();
}

module.exports = migrateUsernames;
