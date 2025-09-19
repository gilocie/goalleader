
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
import { useNotifications } from "@/context/notification-context";
import { NotificationItem } from "./notification-item";
import Link from "next/link";


export function NotificationDropdown({ children }: { children: React.ReactNode }) {
    const { notifications, markAllAsRead } = useNotifications();
    const unreadNotifications = notifications.filter(n => !n.read);
    const unreadCount = unreadNotifications.length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 md:w-96" align="end">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span className="font-semibold">Notifications</span>
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
                            unreadNotifications.map(notification => (
                                <NotificationItem key={notification.id} notification={notification} />
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground p-4">
                                No new notifications.
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <DropdownMenuSeparator />
                <div className="p-1">
                     <Button variant="ghost" className="w-full" asChild>
                        <Link href="/notices">View all notices</Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
