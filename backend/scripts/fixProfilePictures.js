const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codeclash', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Function to validate and fix profile picture URLs
const fixProfilePictures = async () => {
    try {
        console.log('Starting profile picture URL fix...');
        
        // Get all users with profile pictures
        const users = await User.find({ profilePicture: { $exists: true, $ne: null, $ne: '' } });
        
        console.log(`Found ${users.length} users with profile pictures`);
        
        let fixedCount = 0;
        let removedCount = 0;
        
        for (const user of users) {
            let shouldUpdate = false;
            let newUrl = user.profilePicture;
            
            // Check if URL is valid
            try {
                const url = new URL(user.profilePicture);
                
                // Fix localhost URLs
                if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
                    console.log(`Fixing localhost URL for user ${user.name}: ${user.profilePicture}`);
                    shouldUpdate = true;
                    newUrl = null; // Remove localhost URLs
                    removedCount++;
                }
                
                // Fix relative URLs
                if (!url.protocol || !url.hostname) {
                    console.log(`Fixing relative URL for user ${user.name}: ${user.profilePicture}`);
                    shouldUpdate = true;
                    newUrl = null; // Remove relative URLs
                    removedCount++;
                }
                
                // Convert HTTP to HTTPS in production
                if (process.env.NODE_ENV === 'production' && url.protocol === 'http:') {
                    console.log(`Converting HTTP to HTTPS for user ${user.name}: ${user.profilePicture}`);
                    shouldUpdate = true;
                    newUrl = user.profilePicture.replace('http://', 'https://');
                    fixedCount++;
                }
                
            } catch (urlError) {
                // Invalid URL
                console.log(`Removing invalid URL for user ${user.name}: ${user.profilePicture}`);
                shouldUpdate = true;
                newUrl = null;
                removedCount++;
            }
            
            // Update user if needed
            if (shouldUpdate) {
                user.profilePicture = newUrl;
                await user.save();
            }
        }
        
        console.log(`\nProfile picture fix completed:`);
        console.log(`- Fixed URLs: ${fixedCount}`);
        console.log(`- Removed invalid URLs: ${removedCount}`);
        console.log(`- Total users processed: ${users.length}`);
        
    } catch (error) {
        console.error('Error fixing profile pictures:', error);
    } finally {
        mongoose.connection.close();
    }
};

// Run the fix
fixProfilePictures();
