

'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { useChat } from "@/context/chat-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { Contact } from "@/types/chat";


export function ChatDropdown({ children }: { children: React.ReactNode }) {
    const { contacts, setSelectedContact } = useChat();
    const router = useRouter();
    const unreadContacts = contacts.filter(c => c.unreadCount && c.unreadCount > 0);

    const handleNotificationClick = (contact: Contact) => {
        setSelectedContact(contact);
        router.push('/chat');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 md:w-96" align="end">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span className="font-semibold">Messages</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-80">
                    <div className="p-1">
                        {unreadContacts.length > 0 ? (
                            unreadContacts.map(contact => {
                                const avatar = PlaceHolderImages.find(p => p.id === contact.id);
                                return (
                                <DropdownMenuItem 
                                    key={contact.id}
                                    className="flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors whitespace-normal h-auto bg-accent text-accent-foreground"
                                    onClick={() => handleNotificationClick(contact)}
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={avatar?.imageUrl} alt={contact.name} />
                                        <AvatarFallback>{contact.name.slice(0,2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <p className="font-semibold text-sm">{contact.name}</p>
                                        <p className="text-xs text-accent-foreground/80 line-clamp-2">{contact.lastMessage}</p>
                                    </div>
                                </DropdownMenuItem>
                            )})
                        ) : (
                            <div className="text-center text-muted-foreground p-4">
                                No new messages.
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <DropdownMenuSeparator />
                <div className="p-1">
                     <Button variant="ghost" className="w-full" asChild>
                        <Link href="/chat">View all messages</Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
