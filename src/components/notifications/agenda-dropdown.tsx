
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
import { useAISuggestions, getSuggestionIcon } from "@/context/ai-suggestion-context";
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";

export function AgendaDropdown({ children }: { children: React.ReactNode }) {
    const { agendaItems, markAsRead } = useAISuggestions();
    const unreadCount = agendaItems.filter(item => !item.read).length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 md:w-96" align="end">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span className="font-semibold">Today's Agenda</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-80">
                    <div className="p-1">
                        {agendaItems.length > 0 ? (
                            agendaItems.map(item => (
                                <DropdownMenuItem 
                                    key={item.id}
                                    className={cn(
                                        "flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors whitespace-normal h-auto",
                                        !item.read && "bg-accent"
                                    )}
                                    onClick={() => markAsRead(item.id)}
                                >
                                    <div className="mt-1">{getSuggestionIcon(item.type)}</div>
                                    <div className="flex-1 space-y-1">
                                        <p className="font-semibold text-sm text-accent-foreground">{item.title}</p>
                                        <p className="text-xs text-accent-foreground/80 line-clamp-3">{item.content}</p>
                                        {item.source && <p className="text-xs text-accent-foreground/60">Source: {item.source}</p>}
                                    </div>
                                    {!item.read && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1 self-center" />}
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground p-4">
                                No agenda items for today.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
