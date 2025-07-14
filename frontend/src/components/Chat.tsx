"use client";

import { useEffect, useRef, useState } from "react";
import { chatApi, ChatMessage } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/lib/stomp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Paperclip, Send, Trash2, Image as ImageIcon, Video as VideoIcon, Eye, Loader2 } from "lucide-react";
import Image from "next/image";

interface ChatProps {
    roomId: number;
    isOwner: boolean;
}

export function Chat({ roomId, isOwner }: ChatProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);
    const ws = useWebSocket(localStorage.getItem("authToken") || "");

    // Fetch initial messages
    useEffect(() => {
        setLoading(true);
        chatApi.getMessages(roomId, 0, 30)
            .then(res => {
                if (res.result === "SUCCESS" && res.data) {
                    setMessages(res.data.messages.reverse());
                    setHasMore(res.data.messages.length === 30);
                    setPage(0);
                } else {
                    setError(res.message || "Failed to load messages");
                }
            })
            .catch(() => setError("Network error"))
            .finally(() => setLoading(false));
    }, [roomId]);

    // WebSocket: subscribe to new messages
    useEffect(() => {
        if (!ws || !ws.connect) return;
        ws.connect().then(() => {
            ws.subscribeToRoom(roomId.toString(), (msg: ChatMessage) => {
                setMessages(prev => {
                    // Nếu là update seenBy thì update message, nếu là mới thì push
                    const idx = prev.findIndex(m => m.id === msg.id);
                    if (idx !== -1) {
                        const updated = [...prev];
                        updated[idx] = msg;
                        return updated;
                    }
                    return [...prev, msg];
                });
            });
        });
        return () => ws.unsubscribe(`room-${roomId}`);
    }, [ws, roomId]);

    // Scroll to bottom khi có tin nhắn mới
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages.length]);

    // Gửi tin nhắn
    const handleSend = async () => {
        if (!input.trim() && !file) return;
        setSending(true);
        let content = input.trim();
        let contentType: "text" | "image" | "video" = "text";
        if (file) {
            setUploading(true);
            const ext = file.name.split(".").pop()?.toLowerCase();
            if (["jpg", "jpeg", "png"].includes(ext || "")) contentType = "image";
            else if (["mp4"].includes(ext || "")) contentType = "video";
            else {
                setError("Only .jpg, .png, .mp4 allowed");
                setUploading(false);
                setSending(false);
                return;
            }
            // Validate size
            if ((contentType === "image" && file.size > 5 * 1024 * 1024) || (contentType === "video" && file.size > 50 * 1024 * 1024)) {
                setError("File too large");
                setUploading(false);
                setSending(false);
                return;
            }
            const res = await chatApi.uploadFile(file);
            if (res.result === "SUCCESS" && res.data) {
                content = res.data.url;
            } else {
                setError(res.message || "Upload failed");
                setUploading(false);
                setSending(false);
                return;
            }
            setUploading(false);
        }
        ws.sendMessage(roomId.toString(), { roomId, content, contentType, userId: user?.id, username: user?.username, avatarUrl: user?.avatarUrl });
        setInput("");
        setFile(null);
        setSending(false);
    };

    // Load more messages (pagination)
    const loadMore = async () => {
        setLoading(true);
        const nextPage = page + 1;
        const res = await chatApi.getMessages(roomId, nextPage, 30);
        if (res.result === "SUCCESS" && res.data) {
            setMessages(prev => [...res.data.messages.reverse(), ...prev]);
            setHasMore(res.data.messages.length === 30);
            setPage(nextPage);
        }
        setLoading(false);
    };

    // Xóa tin nhắn (owner)
    const handleDelete = async (msg: ChatMessage) => {
        if (!isOwner) return;
        await chatApi.deleteMessage(roomId, msg.id);
        setMessages(prev => prev.filter(m => m.id !== msg.id));
    };

    // Đánh dấu đã đọc khi message hiển thị
    useEffect(() => {
        if (!ws || !ws.markMessageAsSeen || !user) return;
        messages.forEach(msg => {
            if (!msg.seenBy.includes(user.id)) {
                ws.markMessageAsSeen(roomId, msg.id);
            }
        });
    }, [messages, ws, user, roomId]);

    return (
        <div className="flex flex-col h-full max-h-[80vh]">
            <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 rounded-t-xl" ref={chatRef}>
                {loading && <div className="text-center text-muted-foreground"><Loader2 className="animate-spin inline-block mr-2" />Loading...</div>}
                {hasMore && !loading && (
                    <div className="text-center mb-2">
                        <Button variant="outline" size="sm" onClick={loadMore}>Load older messages</Button>
                    </div>
                )}
                {messages.map(msg => (
                    <div key={msg.id} className={`flex mb-2 ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-2 rounded-lg shadow ${msg.userId === user?.id ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <Image src={msg.avatarUrl} alt={msg.username} width={24} height={24} className="rounded-full" />
                                <span className="font-semibold text-xs">{msg.username}</span>
                                <span className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                {msg.seenBy.length > 1 && <Eye className="h-3 w-3 ml-1 text-green-400" title="Seen" />}
                                {isOwner && <Button size="icon" variant="ghost" onClick={() => handleDelete(msg)}><Trash2 className="h-4 w-4 text-red-500" /></Button>}
                            </div>
                            {msg.contentType === "text" && <div className="break-words whitespace-pre-wrap">{msg.content}</div>}
                            {msg.contentType === "image" && <Image src={msg.content} alt="img" width={200} height={200} className="rounded-lg mt-2" />}
                            {msg.contentType === "video" && <video src={msg.content} controls className="rounded-lg mt-2 max-w-full" />}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-white dark:bg-gray-900 rounded-b-xl flex items-center gap-2">
                <Input
                    placeholder="Type a message..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    disabled={sending || uploading}
                />
                <input
                    type="file"
                    accept="image/jpeg,image/png,video/mp4"
                    style={{ display: 'none' }}
                    id="file-upload"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="file-upload">
                    <Button variant="ghost" size="icon" asChild>
                        <span>{file ? <Paperclip className="h-5 w-5 text-blue-500" /> : <ImageIcon className="h-5 w-5" />}</span>
                    </Button>
                </label>
                <Button onClick={handleSend} disabled={sending || uploading || (!input.trim() && !file)} className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white">
                    {sending || uploading ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
                </Button>
            </div>
            {error && <div className="text-center text-red-500 mt-2">{error}</div>}
        </div>
    );
} 