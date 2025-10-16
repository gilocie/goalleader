
'use client';

import { useChat } from "@/context/chat-context";
import type { Contact } from "@/types/chat";

export const useOutgoingCall = () => {
    const { startVoiceCall, startCall, setSelectedContact } = useChat();

    const initiateVoiceCall = (contact: Contact) => {
        setSelectedContact(contact);
        startVoiceCall(contact);
    };

    const initiateVideoCall = (contact: Contact) => {
        setSelectedContact(contact);
        startCall(contact);
    };

    return { initiateVoiceCall, initiateVideoCall };
};
