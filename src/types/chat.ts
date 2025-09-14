
export interface Contact {
    id: string;
    name: string;
    role: string;
    status: 'online' | 'offline';
    lastMessage: string;
    lastMessageTime: string;
}

export interface Message {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    timestamp: string;
}
