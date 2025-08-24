const Post = require('../models/Post');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper function to check if ObjectId is valid
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { title, content, type, tags } = req.body;
        const userId = req.user.id; // Assuming user info is attached by auth middleware

        // Input validation
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        // Get user details
        const user = await User.findById(userId).select('username');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create new post with sanitized data
        const newPost = new Post({
            userId,
            username: user.username,
            title: title.trim(),
            content: content.trim(),
            type: type || 'post',
            tags: tags ? tags.map(tag => tag.toLowerCase().trim()) : []
        });

        await newPost.save();

        res.status(201).json({
            success: true,
            post: newPost
        });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ message: 'Server error while creating post' });
    }
};

// Get all posts with pagination and filters
exports.getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const type = req.query.type;
        const tag = req.query.tag;
        const search = req.query.search;
        const userId = req.query.userId;

        // Build query
        let query = {};
        
        if (type) query.type = type;
        if (tag) query.tags = tag;
        if (userId && isValidObjectId(userId)) query.userId = userId;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute query with pagination
        const [posts, total] = await Promise.all([
            Post.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Post.countDocuments(query)
        ]);

        res.json({
            success: true,
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        });
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ message: 'Server error while fetching posts' });
    }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        const post = await Post.findById(id).lean();
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json({
            success: true,
            post
        });
    } catch (error) {
        console.error('Get post by ID error:', error);
        res.status(500).json({ message: 'Server error while fetching post' });
    }
};

// Update a post
exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, type, tags } = req.body;
        const userId = req.user.id;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        // Find post and check ownership
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        if (post.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this post' });
        }

        // Update post with sanitized data
        const updatedPost = await Post.findByIdAndUpdate(
            id,
            {
                $set: {
                    title: title?.trim(),
                    content: content?.trim(),
                    type,
                    tags: tags ? tags.map(tag => tag.toLowerCase().trim()) : post.tags,
                    updatedAt: Date.now()
                }
            },
            { new: true }
        );

        res.json({
            success: true,
            post: updatedPost
        });
    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({ message: 'Server error while updating post' });
    }
};

// Delete a post
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        // Find post and check ownership
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        if (post.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await Post.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ message: 'Server error while deleting post' });
    }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        if (!content?.trim()) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        // Get user details
        const user = await User.findById(userId).select('username');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const post = await Post.findByIdAndUpdate(
            id,
            {
                $push: {
                    comments: {
                        userId,
                        username: user.username,
                        content: content.trim()
                    }
                }
            },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json({
            success: true,
            post
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: 'Server error while adding comment' });
    }
};

// Like/Unlike a post
exports.toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Toggle like
        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { $inc: { likes: 1 } },
            { new: true }
        );

        res.json({
            success: true,
            likes: updatedPost.likes
        });
    } catch (error) {
        console.error('Toggle like error:', error);
        res.status(500).json({ message: 'Server error while toggling like' });
    }
};
