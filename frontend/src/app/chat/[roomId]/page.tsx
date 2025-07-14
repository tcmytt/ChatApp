import { notFound } from 'next/navigation';
import { Chat } from '@/components/Chat';

interface PageProps {
    params: { roomId: string };
    searchParams?: { [key: string]: string | string[] | undefined };
}

export default function ChatPage({ params }: PageProps) {
    console.log('ChatPage params:', params);
    const roomId = Number(params.roomId);
    console.log('Parsed roomId:', roomId);
    if (!roomId || isNaN(roomId)) {
        console.log('Invalid roomId, returning notFound');
        return notFound();
    }
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Chat roomId={roomId} isOwner={false} />
        </div>
    );
} 