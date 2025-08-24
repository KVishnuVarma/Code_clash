import React, { useState } from 'react';
import { FaCheck, FaCheckDouble, FaHeart, FaThumbtack } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Message = ({ 
    message, 
    currentUser, 
    onReact, 
    onPin, 
    onDelete, 
    onEdit 
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(message.message);
    const isOwnMessage = message.userId === currentUser.id;

    const handleEdit = () => {
        if (editText.trim() !== message.message) {
            onEdit(message._id, editText.trim());
        }
        setIsEditing(false);
    };

    const messageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    return (
        <motion.div
            variants={messageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
        >
            <div className={`max-w-[70%] ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-lg px-4 py-2 relative group`}>
                {!isOwnMessage && (
                    <div className="text-xs text-gray-600 mb-1">{message.username}</div>
                )}
                
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-1 rounded border text-black"
                            onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
                            autoFocus
                        />
                        <button
                            onClick={handleEdit}
                            className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                        >
                            Save
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="break-words">{message.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs opacity-70">
                                {new Date(message.createdAt).toLocaleTimeString()}
                            </div>
                            {message.status && (
                                <>
                                    {message.status.delivered.length > 0 && (
                                        <FaCheck className="text-xs" />
                                    )}
                                    {message.status.read.length > 0 && (
                                        <FaCheckDouble className="text-xs" />
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}

                <div className={`absolute ${isOwnMessage ? 'left-0' : 'right-0'} top-0 -translate-x-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2`}>
                    {isOwnMessage && (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1 hover:bg-gray-200 rounded"
                            >
                                ✏️
                            </button>
                            <button
                                onClick={() => onDelete(message._id)}
                                className="p-1 hover:bg-gray-200 rounded"
                            >
                                🗑️
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => onPin(message._id)}
                        className={`p-1 hover:bg-gray-200 rounded ${message.isPinned ? 'text-yellow-500' : ''}`}
                    >
                        <FaThumbtack />
                    </button>
                    <button
                        onClick={() => onReact(message._id)}
                        className={`p-1 hover:bg-gray-200 rounded ${message.reactions?.includes(currentUser.id) ? 'text-red-500' : ''}`}
                    >
                        <FaHeart />
                    </button>
                </div>

                {message.isPinned && (
                    <div className="absolute -top-2 -right-2 text-yellow-500">
                        <FaThumbtack />
                    </div>
                )}

                {message.reactions?.length > 0 && (
                    <div className="absolute -bottom-2 right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                        {message.reactions.length} ❤️
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Message;
