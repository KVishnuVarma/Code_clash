const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    addComment,
    toggleLike,
    incrementViews
} = require('../controllers/postController');

// Post Routes
router.post('/:id/view', incrementViews);
router.post('/create', auth.authenticateUser, createPost); 
router.get('/all', getPosts);            
router.get('/:id', getPostById);
router.put('/:id', auth.authenticateUser, updatePost);
router.delete('/:id', auth.authenticateUser, deletePost);
router.post('/:id/comments', auth.authenticateUser, addComment);
router.post('/:id/like', auth.authenticateUser, toggleLike);

module.exports = router;
