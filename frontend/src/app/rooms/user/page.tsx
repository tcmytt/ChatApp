'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { roomApi, Room } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RoomCard } from '@/components/RoomCard';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';

export default function UserRoomsPage() {
    const [personalRooms, setPersonalRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    const fetchPersonalRooms = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await roomApi.getUserRooms();
            if (res.result === 'SUCCESS' && res.data) {
                setPersonalRooms(res.data);
            } else {
                setError(res.message || 'Failed to fetch your rooms');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPersonalRooms();
    }, []);

    const handleRoomClick = (room: Room) => {
        router.push(`/chat/${room.id}`);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/rooms">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                        Your Rooms
                    </h1>
                    <p className="text-muted-foreground">Rooms you've created or joined</p>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="text-muted-foreground">Loading your rooms...</div>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <div className="text-red-500 mb-4">{error}</div>
                    <Button onClick={fetchPersonalRooms}>Try Again</Button>
                </div>
            ) : personalRooms.length === 0 ? (
                <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No rooms yet</h3>
                    <p className="text-muted-foreground mb-4">
                        You haven't created or joined any rooms yet.
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Link href="/rooms/create">
                            <Button>Create Room</Button>
                        </Link>
                        <Link href="/rooms/join">
                            <Button variant="outline">Join Room</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {personalRooms.map(room => (
                        <RoomCard
                            key={room.id}
                            room={room}
                            isJoined
                            onClick={handleRoomClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 