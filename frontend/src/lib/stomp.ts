'use client';

import { Client, StompSubscription } from '@stomp/stompjs';

// WebSocket message interfaces
export interface ChatMessage {
    id: string;
    roomId: string;
    userId: number;
    username: string;
    content: string;
    messageType: 'TEXT' | 'IMAGE' | 'VIDEO';
    fileUrl?: string;
    timestamp: string;
    seen: boolean;
}

export interface RoomStatus {
    roomId: string;
    userId: number;
    username: string;
    status: 'ONLINE' | 'OFFLINE';
}

export interface Notification {
    id: string;
    type: 'NEW_MESSAGE' | 'ROOM_INVITE' | 'SYSTEM';
    title: string;
    message: string;
    roomId?: string;
    timestamp: string;
}

// STOMP Client configuration
export function createStompClient(jwt: string): Client {
    return new Client({
        brokerURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/chat',
        connectHeaders: {
            Authorization: `Bearer ${jwt}`,
        },
        debug: process.env.NODE_ENV === 'development' ? console.log : undefined,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });
}

// WebSocket service class
export class WebSocketService {
    private client: Client | null = null;
    private subscriptions: Map<string, StompSubscription> = new Map();

    constructor(jwt: string) {
        this.client = createStompClient(jwt);
        this.setupClient();
    }

    private setupClient() {
        if (!this.client) return;

        this.client.onConnect = () => {
            console.log('WebSocket connected');
        };

        this.client.onStompError = (frame) => {
            console.error('WebSocket error:', frame);
        };

        this.client.onDisconnect = () => {
            console.log('WebSocket disconnected');
        };
    }

    // Connect to WebSocket
    async connect(): Promise<void> {
        if (!this.client) return;

        return new Promise((resolve, reject) => {
            this.client!.onConnect = () => {
                console.log('WebSocket connected');
                resolve();
            };

            this.client!.onStompError = (frame) => {
                console.error('WebSocket error:', frame);
                reject(new Error(frame.headers.message));
            };

            this.client!.activate();
        });
    }

    // Disconnect from WebSocket
    disconnect(): void {
        if (this.client) {
            this.client.deactivate();
            this.subscriptions.clear();
        }
    }

    // Subscribe to room messages
    subscribeToRoom(roomId: string, callback: (message: ChatMessage) => void): void {
        if (!this.client?.connected) return;

        const subscription = this.client.subscribe(
            `/topic/rooms/${roomId}`,
            (message) => {
                try {
                    const chatMessage: ChatMessage = JSON.parse(message.body);
                    callback(chatMessage);
                } catch (error) {
                    console.error('Error parsing chat message:', error);
                }
            }
        );

        this.subscriptions.set(`room-${roomId}`, subscription);
    }

    // Subscribe to room status updates
    subscribeToRoomStatus(roomId: string, callback: (status: RoomStatus) => void): void {
        if (!this.client?.connected) return;

        const subscription = this.client.subscribe(
            `/topic/rooms/${roomId}/status`,
            (message) => {
                try {
                    const status: RoomStatus = JSON.parse(message.body);
                    callback(status);
                } catch (error) {
                    console.error('Error parsing room status:', error);
                }
            }
        );

        this.subscriptions.set(`status-${roomId}`, subscription);
    }

    // Subscribe to user notifications
    subscribeToNotifications(userId: number, callback: (notification: Notification) => void): void {
        if (!this.client?.connected) return;

        const subscription = this.client.subscribe(
            `/topic/users/${userId}/notifications`,
            (message) => {
                try {
                    const notification: Notification = JSON.parse(message.body);
                    callback(notification);
                } catch (error) {
                    console.error('Error parsing notification:', error);
                }
            }
        );

        this.subscriptions.set(`notifications-${userId}`, subscription);
    }

    // Send message to room
    sendMessage(roomId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'seen'>): void {
        if (!this.client?.connected) return;

        this.client.publish({
            destination: `/app/rooms/${roomId}/send`,
            body: JSON.stringify(message),
        });
    }

    // Mark message as seen
    markMessageAsSeen(roomId: string, messageId: string): void {
        if (!this.client?.connected) return;

        this.client.publish({
            destination: `/app/rooms/${roomId}/messages/${messageId}/seen`,
            body: JSON.stringify({}),
        });
    }

    // Unsubscribe from specific topic
    unsubscribe(topicKey: string): void {
        const subscription = this.subscriptions.get(topicKey);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(topicKey);
        }
    }

    // Unsubscribe from all topics
    unsubscribeAll(): void {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
        this.subscriptions.clear();
    }

    // Check if connected
    isConnected(): boolean {
        return this.client?.connected || false;
    }
}

// Hook for using WebSocket service
export function useWebSocket(jwt: string) {
    const wsService = new WebSocketService(jwt);

    return {
        connect: () => wsService.connect(),
        disconnect: () => wsService.disconnect(),
        subscribeToRoom: (roomId: string, callback: (message: ChatMessage) => void) =>
            wsService.subscribeToRoom(roomId, callback),
        subscribeToRoomStatus: (roomId: string, callback: (status: RoomStatus) => void) =>
            wsService.subscribeToRoomStatus(roomId, callback),
        subscribeToNotifications: (userId: number, callback: (notification: Notification) => void) =>
            wsService.subscribeToNotifications(userId, callback),
        sendMessage: (roomId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'seen'>) =>
            wsService.sendMessage(roomId, message),
        markMessageAsSeen: (roomId: string, messageId: string) =>
            wsService.markMessageAsSeen(roomId, messageId),
        unsubscribe: (topicKey: string) => wsService.unsubscribe(topicKey),
        unsubscribeAll: () => wsService.unsubscribeAll(),
        isConnected: () => wsService.isConnected(),
    };
} 