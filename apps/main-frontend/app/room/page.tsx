'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HTTP_BACKEND } from '@/lib/config';
import { House } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RoomPage() {
    const [roomName, setRoomName] = useState('');
    const [joinRoomName, setJoinRoomName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const createRoom = async () => {
        if (!roomName.trim()) {
            toast.error('Please enter a room name');
            return;
        }

        setIsLoading(true);
        const token = localStorage.getItem('token');
       
        try {
            const response = await fetch(`${HTTP_BACKEND}/room`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token || '',
                },
                body: JSON.stringify({ name: roomName }),
            });
           
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create room');
            }

            toast.success('Room created successfully!');
            router.push(`/canvas/${data.roomId}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const joinRoom = async () => {
        if (!joinRoomName.trim()) {
            toast.error('Please enter a room name to join');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${HTTP_BACKEND}/room/${joinRoomName}`);
            if (!response.ok) {
                throw new Error('Failed to fetch room');
            }

            const data = await response.json();
            if (!data.room) {
                throw new Error('Room not found');
            }
    
            toast.success('Joined room successfully!');
            router.push(`/canvas/${data.room.id}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Room not found or invalid room name');
            setJoinRoomName(''); // Clear the input on error
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-r from-white-100 to-purple-500">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-96">
                <h1 className="text-2xl flex justify-center font-black pb-4">Name Your Room</h1>
                <label className="block text-gray-700 font-black">Room Name</label>
                <div className="flex items-center border border-black rounded-md px-3 py-2">  
                    <House className="text-gray-500 mr-2" size={20} />
                    <input
                        type="text"
                        name="name"
                        className="w-full outline-none bg-transparent"
                        placeholder="piggies"
                        required
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <button
                    onClick={createRoom}
                    disabled={isLoading}
                    className="w-full mt-2 py-2 bg-[#9950af] text-white rounded-md hover:bg-[#9950af]/80 disabled:opacity-50"
                >
                    {isLoading ? 'Creating...' : 'Create Room'}
                </button>

                <h1 className="text-2xl flex justify-center font-black pb-4 pt-5">Join Room</h1>
                <label className="block text-gray-700 font-black">Room Name</label>
                <div className="flex items-center border border-black rounded-md px-3 py-2">  
                    <House className="text-gray-500 mr-2" size={20} />
                    <input
                        type="text"
                        name="name"
                        className="w-full outline-none bg-transparent"
                        placeholder="piggies"
                        required
                        value={joinRoomName}
                        onChange={(e) => setJoinRoomName(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <button
                    onClick={joinRoom}
                    disabled={isLoading}
                    className="w-full mt-2 py-2 bg-[#9950af] text-white rounded-md hover:bg-[#9950af]/80 disabled:opacity-50"
                >
                    {isLoading ? 'Joining...' : 'Join Room'}
                </button>
            </div>
        </div>
    );
}
