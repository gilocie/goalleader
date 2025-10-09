
'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { useAISuggestions, getSuggestionIcon, SuggestionItem } from '@/context/ai-suggestion-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { SuggestionDetailsDialog } from '@/components/library/suggestion-details-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SuggestionCard = ({ item, onCardClick }: { item: SuggestionItem, onCardClick: (item: SuggestionItem) => void }) => (
    <Card 
      className="flex flex-col transition-all hover:shadow-md cursor-pointer h-full"
      onClick={() => onCardClick(item)}
    >
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <div className="mt-1">{getSuggestionIcon(item.type)}</div>
        <div className="flex-1">
            <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
            {item.source && (
                <p className="text-xs text-muted-foreground">Source: {item.source}</p>
            )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-4">{item.content}</p>
      </CardContent>
      <CardFooter>
         <Button variant="link" className="p-0 h-auto text-xs">Read More...</Button>
      </CardFooter>
    </Card>
);

const Shelf = ({ title, items, onCardClick, gridCols = 'md:grid-cols-2 lg:grid-cols-3' }: { title: string; items: SuggestionItem[]; onCardClick: (item: SuggestionItem) => void; gridCols?: string }) => {
    if (items.length === 0) return null;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <div className={cn("grid grid-cols-1 gap-4", gridCols)}>
                {items.map(item => (
                    <SuggestionCard key={item.id} item={item} onCardClick={onCardClick} />
                ))}
            </div>
        </div>
    );
};

export function LibraryPageContent() {
  const { unreadItems, readItems, markAsRead, monthlyBooks } = useAISuggestions();
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestionItem | null>(null);

  const handleCardClick = (item: SuggestionItem) => {
    setSelectedSuggestion(item);
    setIsDetailsDialogOpen(true);
  };
  
  const handleMarkAsReadFromDialog = (suggestionId: string) => {
    markAsRead(suggestionId);
    setIsDetailsDialogOpen(false);
    setSelectedSuggestion(null);
  };

  const motivationItem = useMemo(() => unreadItems.find(item => item.type === 'motivation'), [unreadItems]);
  const newsItems = useMemo(() => unreadItems.filter(item => item.type === 'news').slice(0, 3), [unreadItems]);
  const storyItem = useMemo(() => unreadItems.find(item => item.type === 'story'), [unreadItems]);

  return (
    <main className="flex-grow p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Library</CardTitle>
          <CardDescription>Your Goal Leader-curated collection of books, articles, and inspiration.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="new">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="new">
                        New For You <Badge className="ml-2">{unreadItems.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="new" className="mt-4">
                    <Card>
                         <CardContent className="pt-6 space-y-8">
                             {unreadItems.length > 0 || monthlyBooks.length > 0 ? (
                                <>
                                    {motivationItem && <Shelf title="Daily Motivation" items={[motivationItem]} onCardClick={handleCardClick} gridCols="lg:grid-cols-1" />}
                                    <Shelf title="Daily News" items={newsItems} onCardClick={handleCardClick} gridCols="lg:grid-cols-3" />
                                    <Shelf title="Book Suggestions of the Month" items={monthlyBooks} onCardClick={handleCardClick} gridCols="lg:grid-cols-3" />
                                    {storyItem && <Shelf title="Business Stories" items={[storyItem]} onCardClick={handleCardClick} gridCols="lg:grid-cols-1" />}
                                </>
                            ) : (
                                <p className="text-muted-foreground text-center p-8">You're all caught up!</p>
                            )}
                         </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                    <Card>
                         <CardContent className="pt-6">
                            {readItems.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {readItems.map(item => (
                                    <SuggestionCard key={item.id} item={item} onCardClick={handleCardClick} />
                                ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center p-8">No items in your history yet.</p>
                            )}
                         </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
      {selectedSuggestion && (
        <SuggestionDetailsDialog
          isOpen={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          suggestion={selectedSuggestion}
          onMarkAsRead={handleMarkAsReadFromDialog}
        />
      )}
    </main>
  );
}
