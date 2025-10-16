
'use client';

import { useChat } from "@/context/chat-context";
import type { Contact } from "@/types/chat";

export const useOutgoingCall = () => {
    const { startVoiceCall, startCall, setSelectedContact, setIsVoiceCallOpen, setIsVideoCallOpen } = useChat();

    const initiateVoiceCall = (contact: Contact) => {
        setSelectedContact(contact);
        setIsVoiceCallOpen(true);
        startVoiceCall(contact);
    };

    const initiateVideoCall = (contact: Contact) => {
        setSelectedContact(contact);
        setIsVideoCallOpen(true);
        startCall(contact);
    };

    return { initiateVoiceCall, initiateVideoCall };
};
