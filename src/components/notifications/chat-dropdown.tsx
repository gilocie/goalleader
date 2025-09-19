
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { useChat } from "@/context/chat-context";
import Link from "next/link";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";


export function ChatDropdown({ children }: { children: React.ReactNode }) {
    const { contacts } = useChat();
    const unreadContacts = contacts.filter(c => c.unreadCount && c.unreadCount > 0);

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
                                <DropdownMenuItem key={contact.id} asChild>
                                     <Link href="/chat" className="flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors whitespace-normal h-auto bg-accent">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={avatar?.imageUrl} alt={contact.name} />
                                            <AvatarFallback>{contact.name.slice(0,2)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <p className="font-semibold text-sm">{contact.name}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{contact.lastMessage}</p>
                                        </div>
                                    </Link>
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
