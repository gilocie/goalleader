
'use client';

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Notification, getNotificationIcon, useNotifications } from "@/context/notification-context";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

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
        if (notification.link) {
            router.push(notification.link);
        }
    };

    return (
        <DropdownMenuItem 
            className={cn(
                "flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors whitespace-normal h-auto",
                !notification.read && "bg-accent"
            )}
            onClick={handleClick}
        >
            <div className="mt-1">{icon}</div>
            <div className="flex-1 space-y-1">
                <p className="font-semibold text-sm">{notification.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                <p className="text-xs text-muted-foreground/80">{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</p>
            </div>
            {!notification.read && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1 self-center" />}
        </DropdownMenuItem>
    );
}
