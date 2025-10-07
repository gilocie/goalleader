
export interface Contact {
    id: string;
    name: string;
    role: string;
    status: 'online' | string; // 'online' or a "last seen" string
    lastMessage: string;
    lastMessageTime: string;
    unreadCount?: number;
    lastMessageReadStatus?: 'sent' | 'delivered' | 'read';
}

export interface Message {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    timestamp: string;
    readStatus?: 'sent' | 'delivered' | 'read';
    isSystem?: boolean;
    type?: 'text' | 'audio' | 'image' | 'file';
    audioUrl?: string;
    audioDuration?: number;
    imageUrl?: string;
    fileName?: string;
    fileUrl?: string;
}
