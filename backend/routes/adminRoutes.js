    const express = require('express');
    const { authenticateUser, adminMiddleware } = require('../middleware/authMiddleware');
    const { 
        getAllUsers, 
        monitorUserActivity, 
        suspendUser, 
        unsuspendUser, 
        reportViolation,
        getViolations,
        submitContactMessage,
        getContactMessages
    } = require('../controllers/adminController');

    const router = express.Router();

    // Public endpoint for reporting violations
    router.post('/report-violation', reportViolation);

    // Test endpoint for manual violation testing
    router.post('/test-violation', (req, res) => {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'User ID required for testing' });
        }
        console.log('🧪 TEST VIOLATION TRIGGERED for user:', userId);
        // Call the reportViolation logic directly
        reportViolation(req, res);
    });

    // Contact message route
    router.post('/contact-message', submitContactMessage);
    // Fetch all contact messages
    router.get('/contact-messages', getContactMessages);

    router.use(authenticateUser, adminMiddleware);


    router.get('/all-users', getAllUsers);
    
    router.get('/monitor-user/:userId', monitorUserActivity);

    router.put('/suspend-user/:userId', suspendUser);

    router.put('/unsuspend-user/:userId', unsuspendUser);

    router.get('/violations', getViolations);

    module.exports = router;
