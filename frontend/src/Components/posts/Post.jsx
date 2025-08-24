import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaHeart, FaComment, FaShare, FaBookmark } from 'react-icons/fa';

const Post = ({ 
    post, 
    currentUser, 
    onLike, 
    onComment, 
    onShare, 
    onBookmark 
}) => {
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [comment, setComment] = useState('');

    const handleComment = (e) => {
        e.preventDefault();
        if (comment.trim()) {
            onComment(post._id, comment.trim());
            setComment('');
        }
    };

    const postVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    return (
        <motion.div
            variants={postVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-white rounded-lg shadow-md mb-4 overflow-hidden"
        >
            {/* Post Header */}
            <div className="flex items-center p-4 border-b">
                <img
                    src={post.author.avatar || '/default-avatar.png'}
                    alt={post.author.username}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div className="ml-3">
                    <h3 className="font-semibold">{post.author.username}</h3>
                    <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Post Content */}
            <div className="p-4">
                <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                {post.image && (
                    <img
                        src={post.image}
                        alt="Post content"
                        className="mt-4 rounded-lg max-h-96 w-full object-cover"
                    />
                )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between px-4 py-2 border-t">
                <button
                    onClick={() => onLike(post._id)}
                    className={`flex items-center gap-1 ${
                        post.likes.find(id => id.toString() === currentUser.id) ? 'text-red-500' : 'text-gray-500'
                    } hover:text-red-500`}
                >
                    <FaHeart />
                    <span>{post.likes.length}</span>
                </button>

                <button
                    onClick={() => setIsCommentOpen(!isCommentOpen)}
                    className="flex items-center gap-1 text-gray-500 hover:text-blue-500"
                >
                    <FaComment />
                    <span>{post.comments.length}</span>
                </button>

                <button
                    onClick={() => onShare(post._id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-green-500"
                >
                    <FaShare />
                </button>

                <button
                    onClick={() => onBookmark(post._id)}
                    className={`flex items-center gap-1 ${
                        post.bookmarks.includes(currentUser.id) ? 'text-yellow-500' : 'text-gray-500'
                    } hover:text-yellow-500`}
                >
                    <FaBookmark />
                </button>
            </div>

            {/* Comments Section */}
            {isCommentOpen && (
                <div className="p-4 border-t">
                    <form onSubmit={handleComment} className="mb-4">
                        <input
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </form>

                    <div className="space-y-4">
                        {post.comments.map((comment) => (
                            <div key={comment._id} className="flex items-start gap-3">
                                <img
                                    src={comment.author.avatar || '/default-avatar.png'}
                                    alt={comment.author.username}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="font-semibold">{comment.author.username}</h4>
                                    <p className="text-gray-800">{comment.content}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Post;
