const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper function to check if ObjectId is valid
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new chat message
exports.createMessage = async (req, res) => {
    try {
        const { message, room } = req.body;
        const userId = req.user.id;

        // Input validation
        if (!message?.trim()) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        // Get user details
        const user = await User.findById(userId).select('username avatar');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newMessage = new ChatMessage({
            userId,
            username: user.username,
            message: message.trim(),
            avatar: user.avatar || '👤',
            room: room || 'general'
        });

        await newMessage.save();

        // Emit the message through Socket.IO if available
        if (req.io) {
            req.io.to(room || 'general').emit('new_message', newMessage);
        }

        res.status(201).json({
            success: true,
            message: newMessage
        });
    } catch (error) {
        console.error('Create message error:', error);
        res.status(500).json({ message: 'Server error while creating message' });
    }
};

// Get chat messages with pagination and room filter
exports.getMessages = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const room = req.query.room || 'general';

        // Build query
        const query = { room };

        // Execute query with pagination
        const [messages, total] = await Promise.all([
            ChatMessage.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            ChatMessage.countDocuments(query)
        ]);

        res.json({
            success: true,
            messages: messages.reverse(), // Return in chronological order
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalMessages: total
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Server error while fetching messages' });
    }
};

// Delete a message (only by the message creator)
exports.deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid message ID' });
        }

        // Find message and check ownership
        const message = await ChatMessage.findById(id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        
        if (message.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        await ChatMessage.findByIdAndDelete(id);

        // Emit deletion through Socket.IO if available
        if (req.io) {
            req.io.to(message.room).emit('message_deleted', id);
        }

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ message: 'Server error while deleting message' });
    }
};

// Get messages by user ID
exports.getUserMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const [messages, total] = await Promise.all([
            ChatMessage.find({ userId })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            ChatMessage.countDocuments({ userId })
        ]);

        res.json({
            success: true,
            messages,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalMessages: total
        });
    } catch (error) {
        console.error('Get user messages error:', error);
        res.status(500).json({ message: 'Server error while fetching user messages' });
    }
};

// Edit a message
exports.editMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const userId = req.user.id;

        if (!message?.trim()) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        const existingMessage = await ChatMessage.findById(id);
        if (!existingMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }

        if (existingMessage.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to edit this message' });
        }

        existingMessage.message = message.trim();
        existingMessage.editedAt = new Date();
        await existingMessage.save();

        if (req.io) {
            req.io.to(existingMessage.room).emit('message_edited', existingMessage);
        }

        res.json({
            success: true,
            message: existingMessage
        });
    } catch (error) {
        console.error('Edit message error:', error);
        res.status(500).json({ message: 'Server error while editing message' });
    }
};

// Add reaction to a message
exports.addReaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { emoji } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId).select('username');
        const message = await ChatMessage.findById(id);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Remove existing reaction from this user if any
        const reactions = message.reactions || [];
        const filteredReactions = reactions.filter(r => r.userId.toString() !== userId);

        // Add new reaction
        filteredReactions.push({
            emoji,
            userId,
            username: user.username
        });

        message.reactions = filteredReactions;
        await message.save();

        if (req.io) {
            req.io.to(message.room).emit('message_reaction', {
                messageId: id,
                reactions: message.reactions
            });
        }

        res.json({
            success: true,
            reactions: message.reactions
        });
    } catch (error) {
        console.error('Add reaction error:', error);
        res.status(500).json({ message: 'Server error while adding reaction' });
    }
};

// Pin/Unpin a message
exports.togglePin = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await ChatMessage.findById(id);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        message.isPinned = !message.isPinned;
        await message.save();

        if (req.io) {
            req.io.to(message.room).emit('message_pin_status', {
                messageId: id,
                isPinned: message.isPinned
            });
        }

        res.json({
            success: true,
            isPinned: message.isPinned
        });
    } catch (error) {
        console.error('Toggle pin error:', error);
        res.status(500).json({ message: 'Server error while toggling pin status' });
    }
};

// Forward a message
exports.forwardMessage = async (req, res) => {
    try {
        const { messageId, toRoom } = req.body;
        const userId = req.user.id;

        const originalMessage = await ChatMessage.findById(messageId);
        if (!originalMessage) {
            return res.status(404).json({ message: 'Original message not found' });
        }

        const user = await User.findById(userId).select('username avatar');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const forwardedMessage = new ChatMessage({
            userId,
            username: user.username,
            message: originalMessage.message,
            avatar: user.avatar || '👤',
            room: toRoom,
            attachments: originalMessage.attachments,
            forwardedFrom: {
                messageId: originalMessage._id,
                username: originalMessage.username
            }
        });

        await forwardedMessage.save();

        if (req.io) {
            req.io.to(toRoom).emit('new_message', forwardedMessage);
        }

        res.json({
            success: true,
            message: forwardedMessage
        });
    } catch (error) {
        console.error('Forward message error:', error);
        res.status(500).json({ message: 'Server error while forwarding message' });
    }
};