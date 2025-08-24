const User = require('../models/User');

/**
 * Generate a unique username from first and last name
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @returns {Promise<string>} - Unique username
 */
async function generateUniqueUsername(firstName, lastName) {
    // Clean and format the names
    const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Create base username
    const baseUsername = `${cleanFirstName}_${cleanLastName}`;
    
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops
    
    while (attempts < maxAttempts) {
        // Generate random number between 0-999
        const randomNum = Math.floor(Math.random() * 1000);
        const username = `${baseUsername}_${randomNum}`;
        
        // Check if username exists in database
        const existingUser = await User.findOne({ username });
        
        if (!existingUser) {
            return username;
        }
        
        attempts++;
    }
    
    // If we can't find a unique username after max attempts, use timestamp
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits
    return `${baseUsername}_${timestamp}`;
}

/**
 * Generate username from full name (splits into first and last)
 * @param {string} fullName - User's full name
 * @returns {Promise<string>} - Unique username
 */
async function generateUsernameFromFullName(fullName) {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'user';
    const lastName = nameParts.slice(1).join('') || 'default';
    
    return generateUniqueUsername(firstName, lastName);
}

/**
 * Ensure user has a username, generate one if missing
 * @param {Object} user - User object
 * @returns {Promise<Object>} - Updated user object
 */
async function ensureUserHasUsername(user) {
    if (!user.username) {
        const username = await generateUsernameFromFullName(user.name);
        user.username = username;
        await user.save();
    }
    return user;
}

module.exports = {
    generateUniqueUsername,
    generateUsernameFromFullName,
    ensureUserHasUsername
};
