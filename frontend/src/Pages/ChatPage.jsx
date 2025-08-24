import React, { useState } from 'react';
import ChatRoom from '../Components/ChatRoom';
import RoomList from '../Components/chat/RoomList';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ChatPage = () => {
    const { user } = useAuth();
    const [activeRoom, setActiveRoom] = useState('general');
    const [userRooms, setUserRooms] = useState([]);

    const handleCreateRoom = async () => {
        const roomName = prompt('Enter room name:');
        if (!roomName?.trim()) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: roomName,
                    createdBy: user.id
                })
            });

            if (response.ok) {
                const newRoom = await response.json();
                setUserRooms(prev => [...prev, newRoom]);
                setActiveRoom(newRoom.id);
                toast.success('Room created successfully');
            }
        } catch (error) {
            console.error('Error creating room:', error);
            toast.error('Failed to create room');
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <RoomList
                rooms={userRooms}
                activeRoom={activeRoom}
                onRoomSelect={setActiveRoom}
                onCreateRoom={handleCreateRoom}
            />
            <div className="flex-1">
                <ChatRoom room={activeRoom} />
            </div>
        </div>
    );
};

export default ChatPage;
