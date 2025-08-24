import React from 'react';
import { Hash, Users, Star, Settings } from 'react-feather';

const RoomList = ({ 
    rooms, 
    activeRoom, 
    onRoomSelect, 
    onCreateRoom 
}) => {
    // Preset rooms that are always available
    const presetRooms = [
        { id: 'general', name: 'General', icon: <Hash /> },
        { id: 'help', name: 'Help', icon: <Users /> }
    ];

    // Combine preset rooms with user-created rooms
    const allRooms = [...presetRooms, ...rooms];

    return (
        <div className="w-64 bg-gray-800 text-gray-100 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold">Rooms</h2>
            </div>

            {/* Room List */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                    {allRooms.map(room => (
                        <button
                            key={room.id}
                            onClick={() => onRoomSelect(room.id)}
                            className={`w-full flex items-center space-x-2 p-2 rounded-lg mb-1 ${
                                activeRoom === room.id
                                    ? 'bg-blue-600'
                                    : 'hover:bg-gray-700'
                            }`}
                        >
                            <span className="text-gray-400">{room.icon}</span>
                            <span>{room.name}</span>
                            {room.unreadCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                                    {room.unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Starred Messages */}
            <button className="p-4 flex items-center space-x-2 hover:bg-gray-700 border-t border-gray-700">
                <Star size={20} />
                <span>Starred Messages</span>
            </button>

            {/* Settings */}
            <button className="p-4 flex items-center space-x-2 hover:bg-gray-700 border-t border-gray-700">
                <Settings size={20} />
                <span>Settings</span>
            </button>

            {/* Create Room Button */}
            <button
                onClick={onCreateRoom}
                className="m-4 bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600 transition-colors"
            >
                Create Room
            </button>
        </div>
    );
};

export default RoomList;
