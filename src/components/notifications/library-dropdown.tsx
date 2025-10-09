
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
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';

export function LibraryDropdown({ children }: { children: React.ReactNode }) {
    const { unreadItems, markAsRead, markAllAsRead } = useAISuggestions();
    const unreadCount = unreadItems.length;

    const handleItemClick = (id: string, link?: string) => {
        markAsRead(id);
        if (link) {
            window.open(link, '_blank');
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 md:w-96" align="end">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span className="font-semibold">Knowledge Library</span>
                    {unreadCount > 0 && (
                        <Button variant="link" size="sm" className="p-0 h-auto" onClick={markAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-80">
                    <div className="p-1">
                        {unreadCount > 0 ? (
                            unreadItems.map((item, index) => (
                                <React.Fragment key={item.id}>
                                <DropdownMenuItem 
                                    className={cn(
                                        "flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors whitespace-normal h-auto",
                                        !item.read && "bg-primary text-primary-foreground"
                                    )}
                                    onClick={() => handleItemClick(item.id, item.link)}
                                >
                                    <div className="mt-1">{getSuggestionIcon(item.type)}</div>
                                    <div className="flex-1 space-y-1">
                                        <p className="font-semibold text-sm">{item.title}</p>
                                        <p className="text-xs text-primary-foreground/80 line-clamp-2">{item.content}</p>
                                        <p className="text-xs text-primary-foreground/60">{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</p>
                                    </div>
                                    {!item.read && <div className="h-2.5 w-2.5 rounded-full bg-primary-foreground mt-1 self-center" />}
                                </DropdownMenuItem>
                                {index < unreadItems.length - 1 && <DropdownMenuSeparator className="bg-primary-foreground/20" />}
                                </React.Fragment>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground p-4">
                                No new suggestions.
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                     <Link href="/library" className="justify-center cursor-pointer">View Library</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
