import { Room } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, User, Key } from 'lucide-react';

interface RoomCardProps {
    room: Room;
    onClick?: (room: Room) => void;
    isJoined?: boolean;
}

export function RoomCard({ room, onClick, isJoined }: RoomCardProps) {
    return (
        <Card
            className={`transition-shadow hover:shadow-lg cursor-pointer border-2 ${isJoined ? 'border-blue-500' : 'border-transparent'}`}
            onClick={() => onClick?.(room)}
        >
            <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="font-bold text-lg truncate">
                        {room.name}
                    </div>
                    <Badge variant="secondary" className="ml-2">
                        {room.code}
                    </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {room.memberCount}/{room.maxMembers}
                    </span>
                    <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {room.creatorUsername}
                    </span>
                    {room.maxMembers > 1 && (
                        <span className="flex items-center gap-1">
                            <Key className="h-4 w-4" />
                            {room.maxMembers > 1 ? 'Private' : 'Public'}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 