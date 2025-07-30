const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Test the streak functionality
async function testStreak() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a test user
    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('❌ Test user not found. Please create a user first.');
      return;
    }

    console.log('📊 Current user streak data:');
    console.log('- Current streak:', user.streak.currentStreak);
    console.log('- Longest streak:', user.streak.longestStreak);
    console.log('- Badge:', user.streak.badge);
    console.log('- Freezes:', user.streak.streakFreezes);
    console.log('- Last solved date:', user.streak.lastSolvedDate);
    console.log('- Daily progress entries:', user.streak.dailyProgress.length);

    // Test badge update
    console.log('\n🔄 Testing badge update...');
    user.streak.currentStreak = 8; // Set to 8 to test bronze badge
    user.updateBadge();
    console.log('- New badge:', user.streak.badge);
    console.log('- New freezes:', user.streak.streakFreezes);

    // Test daily reset
    console.log('\n🔄 Testing daily reset...');
    const resetResult = user.checkDailyReset();
    console.log('- Reset performed:', resetResult);

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testStreak(); 