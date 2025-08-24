import io from 'socket.io-client';

class ChatService {
    constructor() {
        this.socket = null;
        this.messageHandlers = new Map();
        this.typingHandlers = new Map();
        this.statusHandlers = new Map();
    }

    connect() {
        this.socket = io(import.meta.env.VITE_BACKEND_URL, {
            withCredentials: true
        });

        this.socket.on('connect', () => {
            console.log('Connected to chat server');
        });

        this.socket.on('new_message', (message) => {
            this.messageHandlers.forEach(handler => handler(message));
        });

        this.socket.on('message_deleted', (messageId) => {
            this.messageHandlers.forEach(handler => handler({ type: 'delete', messageId }));
        });

        this.socket.on('message_edited', (message) => {
            this.messageHandlers.forEach(handler => handler({ type: 'edit', message }));
        });

        this.socket.on('message_reaction', ({ messageId, reactions }) => {
            this.messageHandlers.forEach(handler => handler({ type: 'reaction', messageId, reactions }));
        });

        this.socket.on('message_pin_status', ({ messageId, isPinned }) => {
            this.messageHandlers.forEach(handler => handler({ type: 'pin', messageId, isPinned }));
        });

        this.socket.on('user_typing', ({ username, isTyping }) => {
            this.typingHandlers.forEach(handler => handler(username, isTyping));
        });

        this.socket.on('delivery_status_update', ({ messageId, status, userId }) => {
            this.statusHandlers.forEach(handler => handler({ type: 'delivery', messageId, status, userId }));
        });

        this.socket.on('read_status_update', ({ messageId, status, userId }) => {
            this.statusHandlers.forEach(handler => handler({ type: 'read', messageId, status, userId }));
        });
    }

    joinRoom(room) {
        if (this.socket) {
            this.socket.emit('join_room', room);
        }
    }

    leaveRoom(room) {
        if (this.socket) {
            this.socket.emit('leave_room', room);
        }
    }

    // Message handlers
    onMessage(id, handler) {
        this.messageHandlers.set(id, handler);
    }

    offMessage(id) {
        this.messageHandlers.delete(id);
    }

    // Typing handlers
    onTyping(id, handler) {
        this.typingHandlers.set(id, handler);
    }

    offTyping(id) {
        this.typingHandlers.delete(id);
    }

    // Status handlers
    onStatus(id, handler) {
        this.statusHandlers.set(id, handler);
    }

    offStatus(id) {
        this.statusHandlers.delete(id);
    }

    // Emit typing status
    emitTypingStart(room, username) {
        if (this.socket) {
            this.socket.emit('typing_start', { room, username });
        }
    }

    emitTypingEnd(room, username) {
        if (this.socket) {
            this.socket.emit('typing_end', { room, username });
        }
    }

    // Emit message status
    emitMessageDelivered(messageId, userId, room) {
        if (this.socket) {
            this.socket.emit('message_delivered', { messageId, userId, room });
        }
    }

    emitMessageRead(messageId, userId, room) {
        if (this.socket) {
            this.socket.emit('message_read', { messageId, userId, room });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const chatService = new ChatService();
