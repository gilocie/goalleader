
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

export function LibraryDropdown({ children }: { children: React.ReactNode }) {
    const { libraryItems, markAsRead } = useAISuggestions();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 md:w-96" align="end">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span className="font-semibold">Knowledge Library</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-80">
                    <div className="p-1">
                        {libraryItems.length > 0 ? (
                            libraryItems.map(item => (
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
                                        {item.link && (
                                            <Button variant="link" size="sm" asChild className="p-0 h-auto -ml-1 text-xs" onClick={(e) => e.stopPropagation()}>
                                                <a href={item.link} target="_blank" rel="noopener noreferrer">
                                                    Read more
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                    {!item.read && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1 self-center" />}
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground p-4">
                                No library items available.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
