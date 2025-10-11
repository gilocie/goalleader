
import type { Timestamp } from 'firebase/firestore';

export interface Contact {
    id: string;
    name: string;
    role: string;
    status: 'online' | string; // 'online' or a "last seen" string
    lastMessage: string;
    lastMessageTime: string;
    unreadCount?: number;
    lastMessageReadStatus?: 'sent' | 'delivered' | 'read' | 'request_sent';
    lastMessageSenderId?: string;
}

export interface Message {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    timestamp: Timestamp;
    readStatus?: 'sent' | 'delivered' | 'read' | 'request_sent' | 'updated';
    isSystem?: boolean;
    type: 'text' | 'audio' | 'image' | 'file';
    audioUrl?: string;
    audioDuration?: number;
    imageUrls?: string[];
    fileName?: string;
    fileUrl?: string;
    replyTo?: string; // ID of the message this is a reply to
    callType?: 'video' | 'voice';
    deletedBySender?: boolean;
    deletedByRecipient?: boolean;
}

    