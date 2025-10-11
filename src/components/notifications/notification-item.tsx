
'use client';

import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Notification, getNotificationIcon, useNotifications } from "@/context/notification-context";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Button } from "../ui/button";

interface NotificationItemProps {
    notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
    const { markAsRead } = useNotifications();
    const router = useRouter();
    const icon = getNotificationIcon(notification.type);

    const handleClick = () => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
    };

    return (
        <>
        <DropdownMenuItem 
            className={cn(
                "flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors whitespace-normal h-auto",
                !notification.read && "bg-accent"
            )}
            onClick={handleClick}
            asChild
        >
            <div className="w-full">
                <div className="flex items-start gap-3">
                    <div className="mt-1">{icon}</div>
                    <div className="flex-1 space-y-1">
                        <p className="font-semibold text-sm text-accent-foreground">{notification.title}</p>
                        <p className="text-xs text-accent-foreground/80 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-accent-foreground/80">{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</p>
                    </div>
                    {!notification.read && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1 self-center" />}
                </div>
                {notification.link && notification.type === 'report' && (
                     <Button 
                        variant="link" 
                        className="p-0 h-auto text-xs mt-2" 
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(notification.link!);
                        }}>
                        View Report
                    </Button>
                )}
            </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        </>
    );
}
