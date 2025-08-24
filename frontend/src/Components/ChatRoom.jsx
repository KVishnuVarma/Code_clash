import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';
import { Send, Edit2, Trash2, Pin, Forward, Smile } from 'react-feather';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const ChatRoom = ({ room = 'general' }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const messageEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        // Initialize chat service
        chatService.connect();
        chatService.joinRoom(room);

        // Load initial messages
        fetchMessages();

        // Set up message handlers
        chatService.onMessage('main', handleMessageUpdate);
        chatService.onTyping('main', handleTypingStatus);
        chatService.onStatus('main', handleMessageStatus);

        return () => {
            chatService.leaveRoom(room);
            chatService.offMessage('main');
            chatService.offTyping('main');
            chatService.offStatus('main');
            chatService.disconnect();
        };
    }, [room]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat?room=${room}`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setMessages(data.messages);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleMessageUpdate = (update) => {
        if (update.type === 'delete') {
            setMessages(prev => prev.filter(msg => msg._id !== update.messageId));
        } else if (update.type === 'edit') {
            setMessages(prev => prev.map(msg => 
                msg._id === update.message._id ? update.message : msg
            ));
        } else if (update.type === 'reaction') {
            setMessages(prev => prev.map(msg =>
                msg._id === update.messageId ? { ...msg, reactions: update.reactions } : msg
            ));
        } else if (update.type === 'pin') {
            setMessages(prev => prev.map(msg =>
                msg._id === update.messageId ? { ...msg, isPinned: update.isPinned } : msg
            ));
        } else {
            setMessages(prev => [...prev, update]);
            scrollToBottom();
        }
    };

    const handleTypingStatus = (username, isTyping) => {
        setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (isTyping) {
                newSet.add(username);
            } else {
                newSet.delete(username);
            }
            return newSet;
        });
    };

    const handleMessageStatus = (update) => {
        setMessages(prev => prev.map(msg =>
            msg._id === update.messageId
                ? {
                    ...msg,
                    status: {
                        ...msg.status,
                        [update.type]: [...(msg.status[update.type] || []), update.userId]
                    }
                }
                : msg
        ));
    };

    const handleTyping = () => {
        chatService.emitTypingStart(room, user.username);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            chatService.emitTypingEnd(room, user.username);
        }, 1000);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() && !selectedMessage) return;

        try {
            const endpoint = isEditing ? `/api/chat/${selectedMessage._id}` : '/api/chat';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    message: newMessage,
                    room
                })
            });

            if (response.ok) {
                setNewMessage('');
                setIsEditing(false);
                setSelectedMessage(null);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleReaction = async (messageId, emoji) => {
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/${messageId}/reaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({ emoji })
            });
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    };

    const handlePinMessage = async (messageId) => {
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/${messageId}/pin`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
        } catch (error) {
            console.error('Error pinning message:', error);
        }
    };

    const handleForwardMessage = async (messageId, toRoom) => {
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/forward`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({ messageId, toRoom })
            });
        } catch (error) {
            console.error('Error forwarding message:', error);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                    <div
                        key={message._id}
                        className={`flex ${message.userId === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[70%] ${message.isPinned ? 'border-l-4 border-yellow-400' : ''}`}>
                            {/* Message Header */}
                            <div className="flex items-center space-x-2 mb-1">
                                <img
                                    src={message.avatar}
                                    alt={message.username}
                                    className="w-6 h-6 rounded-full"
                                />
                                <span className="font-semibold text-sm">{message.username}</span>
                                {message.editedAt && (
                                    <span className="text-xs text-gray-500">(edited)</span>
                                )}
                            </div>

                            {/* Message Content */}
                            <div className={`rounded-lg p-3 ${
                                message.userId === user.id ? 'bg-blue-500 text-white' : 'bg-white'
                            }`}>
                                {message.forwardedFrom && (
                                    <div className="text-xs text-gray-500 mb-1">
                                        Forwarded from {message.forwardedFrom.username}
                                    </div>
                                )}
                                {message.replyTo && (
                                    <div className="text-xs bg-gray-100 p-2 rounded mb-2">
                                        <div className="font-semibold">{message.replyTo.username}</div>
                                        <div>{message.replyTo.preview}</div>
                                    </div>
                                )}
                                <p>{message.message}</p>
                                
                                {/* Attachments */}
                                {message.attachments?.map((attachment, index) => (
                                    <div key={index} className="mt-2">
                                        {attachment.type === 'image' ? (
                                            <img
                                                src={attachment.url}
                                                alt={attachment.name}
                                                className="max-w-full rounded"
                                            />
                                        ) : (
                                            <a
                                                href={attachment.url}
                                                className="text-blue-400 hover:underline"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {attachment.name}
                                            </a>
                                        )}
                                    </div>
                                ))}

                                {/* Reactions */}
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {message.reactions?.map((reaction, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-100 rounded-full px-2 py-1 text-sm"
                                        >
                                            {reaction.emoji} {reaction.username}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Message Actions */}
                            {message.userId === user.id && (
                                <div className="flex items-center space-x-2 mt-1">
                                    <button
                                        onClick={() => {
                                            setSelectedMessage(message);
                                            setNewMessage(message.message);
                                            setIsEditing(true);
                                        }}
                                        className="text-gray-500 hover:text-blue-500"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMessage(message._id)}
                                        className="text-gray-500 hover:text-red-500"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handlePinMessage(message._id)}
                                        className={`${message.isPinned ? 'text-yellow-500' : 'text-gray-500'} hover:text-yellow-500`}
                                    >
                                        <Pin size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleForwardMessage(message._id, 'general')}
                                        className="text-gray-500 hover:text-green-500"
                                    >
                                        <Forward size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messageEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
                <div className="px-4 py-2 text-sm text-gray-500">
                    {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                </div>
            )}

            {/* Message Input */}
            <div className="border-t p-4 bg-white">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="text-gray-500 hover:text-yellow-500"
                    >
                        <Smile size={24} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        onKeyDown={handleTyping}
                        placeholder={isEditing ? "Edit your message..." : "Type a message..."}
                        className="flex-1 rounded-full px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600"
                    >
                        <Send size={20} />
                    </button>
                </div>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                    <div className="absolute bottom-20 right-4">
                        <Picker
                            data={data}
                            onEmojiSelect={(emoji) => {
                                setNewMessage(prev => prev + emoji.native);
                                setShowEmojiPicker(false);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatRoom;
