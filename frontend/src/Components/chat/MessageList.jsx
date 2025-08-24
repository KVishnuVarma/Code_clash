import React, { useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import Message from './Message';

const MessageList = ({ 
    messages, 
    currentUser, 
    onReact, 
    onPin, 
    onDelete, 
    onEdit, 
    typingUsers 
}) => {
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);
    const [isScrolledToBottom, setIsScrolledToBottom] = React.useState(true);

    const scrollToBottom = () => {
        if (isScrolledToBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);

    // Handle scroll events to determine if we're at the bottom
    const handleScroll = () => {
        const container = containerRef.current;
        if (container) {
            const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
            setIsScrolledToBottom(isAtBottom);
        }
    };

    return (
        <div 
            className="flex-1 overflow-y-auto p-4"
            ref={containerRef}
            onScroll={handleScroll}
        >
            <AnimatePresence>
                {messages.map((message) => (
                    <Message
                        key={message._id}
                        message={message}
                        currentUser={currentUser}
                        onReact={onReact}
                        onPin={onPin}
                        onDelete={onDelete}
                        onEdit={onEdit}
                    />
                ))}
            </AnimatePresence>

            {typingUsers.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-gray-500 text-sm italic"
                >
                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </motion.div>
            )}

            <div ref={messagesEndRef} />

            {!isScrolledToBottom && messages.length > 0 && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={() => {
                        setIsScrolledToBottom(true);
                        scrollToBottom();
                    }}
                    className="fixed bottom-20 right-6 bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600"
                >
                    ↓
                </motion.button>
            )}
        </div>
    );
};

export default MessageList;
