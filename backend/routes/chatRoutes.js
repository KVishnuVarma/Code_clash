const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
    createMessage,
    getMessages,
    deleteMessage,
    getUserMessages,
    editMessage,
    addReaction,
    togglePin,
    forwardMessage
} = require('../controllers/chatController');

// Chat Routes
router.post('/rooms', auth.authenticateUser, createMessage);
router.get('/', auth.authenticateUser, getMessages);
router.delete('/:id', auth.authenticateUser, deleteMessage);
router.get('/user/:userId', auth.authenticateUser, getUserMessages);

// New Enhanced Chat Routes
router.put('/:id', auth.authenticateUser, editMessage);
router.post('/:id/reaction', auth.authenticateUser, addReaction);
router.post('/:id/pin', auth.authenticateUser, togglePin);
router.post('/forward', auth.authenticateUser, forwardMessage);

module.exports = router;
