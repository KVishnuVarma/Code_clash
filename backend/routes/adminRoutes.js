    const express = require('express');
    const { authenticateUser, adminMiddleware } = require('../middleware/authMiddleware');
    const { 
        createContest, 
        uploadProblem, 
        getAllUsers, 
        monitorUserActivity, 
        suspendUser, 
        unsuspendUser 
    } = require('../controllers/adminController');

    const router = express.Router();

    // ✅ Only Admins can access these routes
    router.use(authenticateUser, adminMiddleware);

    // 📌 Route to create a new contest
    router.post('/create-contest', createContest);

    // 📌 Route to upload a new coding problem
    router.post('/upload-problem', uploadProblem);

    // 📌 Route to get all users (for monitoring participation & cheating)
    router.get('/all-users', getAllUsers);

    // 📌 Route to monitor user activity & detect cheating
    router.get('/monitor-user/:userId', monitorUserActivity);

    // 📌 Route to suspend a user for cheating
    router.put('/suspend-user/:userId', suspendUser);

    // 📌 Route to unsuspend a user
    router.put('/unsuspend-user/:userId', unsuspendUser);

    module.exports = router;
