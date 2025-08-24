import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaSmile } from 'react-icons/fa';

const MessageInput = ({ onSendMessage, onTyping }) => {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);

    useEffect(() => {
        return () => {
            if (typingTimeout) clearTimeout(typingTimeout);
        };
    }, [typingTimeout]);

    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            onTyping(true);
        }

        if (typingTimeout) clearTimeout(typingTimeout);

        const timeout = setTimeout(() => {
            setIsTyping(false);
            onTyping(false);
        }, 2000);

        setTypingTimeout(timeout);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
            setIsTyping(false);
            onTyping(false);
        }
    };

    return (
        <form 
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-4 border-t bg-white"
        >
            <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {/* TODO: Implement emoji picker */}}
            >
                <FaSmile size={20} />
            </button>
            <input
                type="text"
                value={message}
                onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping();
                }}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                disabled={!message.trim()}
                className={`p-2 rounded-lg ${
                    message.trim() 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
                <FaPaperPlane />
            </button>
        </form>
    );
};

export default MessageInput;
