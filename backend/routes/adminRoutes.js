    const express = require('express');
    const { authenticateUser, adminMiddleware } = require('../middleware/authMiddleware');
    const { 
        getAllUsers, 
        monitorUserActivity, 
        suspendUser, 
        unsuspendUser 
    } = require('../controllers/adminController');

    const router = express.Router();

    router.use(authenticateUser, adminMiddleware);


    router.get('/all-users', getAllUsers);
    
    router.get('/monitor-user/:userId', monitorUserActivity);

    router.put('/suspend-user/:userId', suspendUser);

    router.put('/unsuspend-user/:userId', unsuspendUser);

    module.exports = router;
