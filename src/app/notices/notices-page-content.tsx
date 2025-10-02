
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Bot, User, Trash2, CheckSquare, Send } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { NoticeDetailsDialog } from '@/components/notices/notice-details-dialog';
import { CreateNoticeDialog } from '@/components/notices/create-notice-dialog';
import { useNotifications, Notification } from '@/context/notification-context';


export type Notice = Notification;

const NoticeCard = ({ notice, icon, onSelect, isSelected, onCardClick }: { notice: Notice, icon?: React.ReactNode, onSelect?: (id: string, checked: boolean) => void, isSelected?: boolean, onCardClick: (notice: Notice) => void }) => (
    <div 
        className={cn("relative transition-all rounded-lg cursor-pointer", isSelected && 'ring-2 ring-primary ring-offset-2')}
        onClick={() => onCardClick(notice)}
    >
        <Card className={cn(isSelected && 'bg-primary/5 border-primary/20')}>
            <CardHeader>
                <div className="flex items-start gap-3">
                    {onSelect && (
                        <div 
                            className="flex items-center h-full pt-1" 
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Checkbox 
                                checked={isSelected}
                                onCheckedChange={(checked) => onSelect(notice.id, !!checked)}
                            />
                        </div>
                    )}
                    {icon && <div className="bg-primary/10 text-primary p-2 rounded-full">{icon}</div>}
                    <div className={cn('flex-1', !onSelect && 'pl-8')}>
                        <CardTitle className='text-lg'>{notice.title}</CardTitle>
                        <CardDescription>
                            Posted by {notice.author} on {new Date(notice.timestamp).toLocaleDateString()}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className={cn('pl-16', !onSelect && 'pl-24')}>
                <p className="text-sm text-muted-foreground line-clamp-2">{notice.message}</p>
            </CardContent>
        </Card>
    </div>
);


const ActionToolbar = ({ selectedCount, onSelectAll, allSelected, onMarkAsRead, onDelete }: { selectedCount: number, onSelectAll: (checked: boolean) => void, allSelected: boolean, onMarkAsRead: () => void, onDelete: () => void }) => {
    if (selectedCount === 0) return null;

    return (
        <div className="flex items-center justify-between p-2 mb-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
                <Checkbox id="selectAll" checked={allSelected} onCheckedChange={(checked) => onSelectAll(!!checked)} />
                <label htmlFor="selectAll" className="text-sm font-medium">{selectedCount} selected</label>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onMarkAsRead}>
                    <CheckSquare className="mr-2 h-4 w-4" /> Mark as read
                </Button>
                <Button variant="destructive" size="sm" onClick={onDelete}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
            </div>
        </div>
    );
};


export function NoticesPageContent() {
  const { notifications, markAsRead, addNotification, deleteNotifications } = useNotifications();
  
  const [myNotices, setMyNotices] = useState<Notice[]>([]);

  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [selectedAi, setSelectedAi] = useState<string[]>([]);

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const staffNotices = notifications.filter(n => !n.read && n.author !== 'GoalLeader AI');
  const aiNotices = notifications.filter(n => !n.read && n.author === 'GoalLeader AI');
  const readNotices = notifications.filter(n => n.read).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const unreadCount = staffNotices.length + aiNotices.length;
  const readCount = readNotices.length;

  const handleSelect = (id: string, checked: boolean, type: 'staff' | 'ai') => {
    const setSelected = type === 'staff' ? setSelectedStaff : setSelectedAi;
    setSelected(prev => checked ? [...prev, id] : prev.filter(item => item !== id));
  };
  
  const handleSelectAll = (checked: boolean, type: 'staff' | 'ai') => {
    const notices = type === 'staff' ? staffNotices : aiNotices;
    const setSelected = type === 'staff' ? setSelectedStaff : setSelectedAi;
    setSelected(checked ? notices.map(n => n.id) : []);
  };

  const handleAction = (action: 'read' | 'delete', type: 'staff' | 'ai') => {
    const selectedIds = type === 'staff' ? selectedStaff : selectedAi;
    
    if (action === 'read') {
        selectedIds.forEach(id => markAsRead(id));
    }

    if (action === 'delete') {
        deleteNotifications(selectedIds);
    }
    
    if (type === 'staff') setSelectedStaff([]);
    else setSelectedAi([]);
  };

  const handleCardClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsDetailsDialogOpen(true);
  }

  const handleMarkAsReadFromDialog = (noticeId: string) => {
    markAsRead(noticeId);
    setIsDetailsDialogOpen(false);
    setSelectedNotice(null);
  };
  
  const handleNoticeCreate = (newNoticeData: { title: string, description: string, recipients: string[] }) => {
    const newNotice = {
        title: newNoticeData.title,
        message: newNoticeData.description,
        author: 'You',
        type: 'staff' as const,
        link: '/notices'
    };
    // This will both add it to the notification system and make it appear here
    addNotification(newNotice);
    
    // Also track "My Notices" separately
    const myCreatedNotice: Notice = {
        ...newNotice,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
    };
    setMyNotices(prev => [myCreatedNotice, ...prev]);

    setIsCreateDialogOpen(false);
  };

  return (
    <main className="flex-grow p-4 md:p-8">
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Noticeboard</CardTitle>
            <CardDescription>All company announcements and notices.</CardDescription>
        </div>
        <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-primary-dark text-primary-foreground hover:from-primary/90 hover:to-primary-dark/90"
        >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Notice
        </Button>
        </CardHeader>
        <CardContent>
        <Tabs defaultValue="unread">
            <TabsList className="grid w-full grid-cols-3 gap-1">
                <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
                <TabsTrigger value="read">Read ({readCount})</TabsTrigger>
                <TabsTrigger value="my-notices">My Notices ({myNotices.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="unread" className="mt-4">
                <Tabs defaultValue="staff">
                    <TabsList className="grid w-full grid-cols-2 gap-1">
                        <TabsTrigger value="staff">
                            <User className="mr-2 h-4 w-4" />
                            Staff ({staffNotices.length})
                        </TabsTrigger>
                        <TabsTrigger value="ai">
                            <Bot className="mr-2 h-4 w-4" />
                            GoalLeader ({aiNotices.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="staff" className="mt-4 space-y-4">
                        <ActionToolbar 
                            selectedCount={selectedStaff.length}
                            allSelected={selectedStaff.length > 0 && selectedStaff.length === staffNotices.length}
                            onSelectAll={(checked) => handleSelectAll(checked, 'staff')}
                            onMarkAsRead={() => handleAction('read', 'staff')}
                            onDelete={() => handleAction('delete', 'staff')}
                        />
                        {staffNotices.length > 0 ? staffNotices.map((notice) => (
                            <NoticeCard 
                                key={notice.id} 
                                notice={notice} 
                                icon={<User className="h-5 w-5" />} 
                                isSelected={selectedStaff.includes(notice.id)}
                                onSelect={(id, checked) => handleSelect(id, checked, 'staff')}
                                onCardClick={handleCardClick}
                            />
                        )) : <p className='text-center text-muted-foreground py-4'>No new staff notices.</p>}
                    </TabsContent>

                        <TabsContent value="ai" className="mt-4 space-y-4">
                        <ActionToolbar 
                            selectedCount={selectedAi.length}
                            allSelected={selectedAi.length > 0 && selectedAi.length === aiNotices.length}
                            onSelectAll={(checked) => handleSelectAll(checked, 'ai')}
                            onMarkAsRead={() => handleAction('read', 'ai')}
                            onDelete={() => handleAction('delete', 'ai')}
                        />
                        {aiNotices.length > 0 ? aiNotices.map((notice) => (
                            <NoticeCard 
                                key={notice.id} 
                                notice={notice} 
                                icon={<Bot className="h-5 w-5" />} 
                                isSelected={selectedAi.includes(notice.id)}
                                onSelect={(id, checked) => handleSelect(id, checked, 'ai')}
                                onCardClick={handleCardClick}
                            />
                        )) : <p className='text-center text-muted-foreground py-4'>No new AI notices.</p>}
                    </TabsContent>
                </Tabs>
            </TabsContent>
                <TabsContent value="read" className="mt-4 space-y-4">
                    {readNotices.map((notice) => (
                        <NoticeCard 
                        key={notice.id}
                        notice={notice}
                        icon={notice.author === 'GoalLeader AI' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                        onCardClick={handleCardClick}
                    />
                ))}
                {readNotices.length === 0 && <p className='text-center text-muted-foreground py-4'>No read notices.</p>}
            </TabsContent>
                <TabsContent value="my-notices" className="mt-4 space-y-4">
                    {myNotices.map((notice) => (
                    <NoticeCard 
                        key={notice.id}
                        notice={notice}
                        icon={<Send className="h-5 w-5" />}
                        onCardClick={handleCardClick}
                    />
                ))}
                {myNotices.length === 0 && <p className='text-center text-muted-foreground py-4'>You haven't created any notices.</p>}
            </TabsContent>
        </Tabs>
        </CardContent>
    </Card>

    {selectedNotice && (
    <NoticeDetailsDialog 
        isOpen={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        notice={selectedNotice}
        onMarkAsRead={handleMarkAsReadFromDialog}
    />
    )}
    
    <CreateNoticeDialog
    isOpen={isCreateDialogOpen}
    onOpenChange={setIsCreateDialogOpen}
    onNoticeCreate={handleNoticeCreate}
    />

</main>
  );
}
