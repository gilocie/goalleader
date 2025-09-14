
'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Bot, User, Trash2, CheckSquare, Send } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { NoticeDetailsDialog } from '@/components/notices/notice-details-dialog';
import { CreateNoticeDialog } from '@/components/notices/create-notice-dialog';

const initialStaffNotices = [
    {
      id: 1,
      title: 'System Maintenance',
      content: 'The system will be down for maintenance on Sunday at 2 AM. This is a scheduled maintenance to upgrade our servers and improve performance. We expect the downtime to last approximately 2 hours. We apologize for any inconvenience.',
      author: 'Admin',
      date: '2024-07-28',
      read: false,
    },
    {
      id: 3,
      title: 'Holiday Schedule',
      content: 'The office will be closed on Monday for the public holiday. Please plan your work accordingly. We will resume normal operations on Tuesday.',
      author: 'HR Department',
      date: '2024-07-26',
      read: false,
    },
    {
      id: 4,
      title: 'Team Meeting',
      content: 'A mandatory team meeting is scheduled for Friday at 10 AM in the main conference room. Please come prepared to discuss Q3 goals.',
      author: 'Management',
      date: '2024-07-25',
      read: false,
    },
];

const initialReadNotices = [
    {
        id: 2,
        title: 'New Feature: Dark Mode',
        content: 'We have launched a new dark mode. You can enable it in your account settings under the "Appearance" tab. Let us know what you think!',
        author: 'Product Team',
        date: '2024-07-27',
        read: true,
    }
];

const initialAiNotices = [
    {
        id: 101,
        title: 'Performance Anomaly Detected',
        content: 'Liam Martinez\'s task completion rate has dropped by 15% this week compared to his average. This could be a normal fluctuation, but it may be worth scheduling a brief check-in to see if he needs any support.',
        author: 'GoalLeader AI',
        date: '2024-07-29',
        read: false,
    },
    {
        id: 102,
        title: 'Upcoming Project Milestone',
        content: 'Project "Phoenix" is 90% complete and the deadline is approaching in 3 days. Ensure all dependencies are resolved and final checks are in place for a smooth launch.',
        author: 'GoalLeader AI',
        date: '2024-07-28',
        read: false,
    }
];

export type Notice = (typeof initialStaffNotices)[0];

const NoticeCard = ({ notice, icon, onSelect, isSelected, onCardClick }: { notice: Notice, icon?: React.ReactNode, onSelect?: (id: number, checked: boolean) => void, isSelected?: boolean, onCardClick: (notice: Notice) => void }) => (
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
                            Posted by {notice.author} on {new Date(notice.date).toLocaleDateString()}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className={cn('pl-16', !onSelect && 'pl-24')}>
                <p className="text-sm text-muted-foreground line-clamp-2">{notice.content}</p>
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


export default function NoticesPage() {
  const [staffNotices, setStaffNotices] = useState(initialStaffNotices);
  const [aiNotices, setAiNotices] = useState(initialAiNotices);
  const [readNotices, setReadNotices] = useState(initialReadNotices);
  const [myNotices, setMyNotices] = useState<Notice[]>([]);

  const [selectedStaff, setSelectedStaff] = useState<number[]>([]);
  const [selectedAi, setSelectedAi] = useState<number[]>([]);

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const unreadCount = staffNotices.length + aiNotices.length;
  const readCount = readNotices.length;

  const handleSelect = (id: number, checked: boolean, type: 'staff' | 'ai') => {
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
    const setNotices = type === 'staff' ? setStaffNotices : setAiNotices;
    const notices = type === 'staff' ? staffNotices : aiNotices;
    
    if (action === 'read') {
      const toMarkRead = notices.filter(n => selectedIds.includes(n.id));
      setReadNotices(prev => [...toMarkRead.map(n => ({...n, read: true})), ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }

    setNotices(prev => prev.filter(n => !selectedIds.includes(n.id)));
    
    if (type === 'staff') setSelectedStaff([]);
    else setSelectedAi([]);
  };

  const handleCardClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsDetailsDialogOpen(true);
  }

  const handleMarkAsReadFromDialog = (noticeId: number) => {
    let noticeToMove: Notice | undefined;
    
    noticeToMove = staffNotices.find(n => n.id === noticeId);
    if (noticeToMove) {
        setStaffNotices(prev => prev.filter(n => n.id !== noticeId));
    } else {
        noticeToMove = aiNotices.find(n => n.id === noticeId);
        if (noticeToMove) {
            setAiNotices(prev => prev.filter(n => n.id !== noticeId));
        }
    }

    if (noticeToMove) {
        setReadNotices(prev => [{...noticeToMove, read: true}, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
    
    setIsDetailsDialogOpen(false);
    setSelectedNotice(null);
  };
  
  const handleNoticeCreate = (newNoticeData: { title: string, description: string, recipients: string[] }) => {
    const newNotice: Notice = {
        id: Date.now(),
        title: newNoticeData.title,
        content: newNoticeData.description,
        author: 'You', // Assuming the current user is the author
        date: new Date().toISOString().split('T')[0],
        read: false, // Created notices are technically 'read' by the author
    };
    setMyNotices(prev => [newNotice, ...prev]);
    setIsCreateDialogOpen(false);
  };

  return (
    <AppLayout>
      <main className="flex-grow p-4 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Noticeboard</CardTitle>
                <CardDescription>All company announcements and notices.</CardDescription>
            </div>
            <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-primary to-green-700 text-primary-foreground hover:from-primary/90 hover:to-green-700/90"
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Notice
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="unread">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
                    <TabsTrigger value="my-notices">My Notices ({myNotices.length})</TabsTrigger>
                    <TabsTrigger value="read">Read ({readCount})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="unread" className="mt-4">
                    <Tabs defaultValue="staff">
                         <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="staff">
                                <User className="mr-2 h-4 w-4" />
                                From Staff ({staffNotices.length})
                            </TabsTrigger>
                            <TabsTrigger value="ai">
                                <Bot className="mr-2 h-4 w-4" />
                                GoalLeader AI ({aiNotices.length})
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
            </Tabs>
          </CardContent>
        </Card>
      </main>

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

    </AppLayout>
  );
}
