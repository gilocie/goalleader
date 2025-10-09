
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { useAISuggestions, getSuggestionIcon, SuggestionItem } from '@/context/ai-suggestion-context';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Newspaper, Briefcase, Zap } from 'lucide-react';
import Link from 'next/link';
import { SuggestionDetailsDialog } from '@/components/library/suggestion-details-dialog';

export function LibraryPageContent() {
  const { agendaItems, libraryItems, markAsRead } = useAISuggestions();
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestionItem | null>(null);

  const books = libraryItems.filter(item => item.type === 'book');
  const stories = libraryItems.filter(item => item.type === 'story');
  const news = agendaItems.filter(item => item.type === 'news');
  const motivations = agendaItems.filter(item => item.type === 'motivation');

  const shelves = [
    { title: 'Book Recommendations', icon: <BookOpen className="h-6 w-6" />, items: books },
    { title: 'Daily News', icon: <Newspaper className="h-6 w-6" />, items: news },
    { title: 'Business Stories', icon: <Briefcase className="h-6 w-6" />, items: stories },
    { title: 'Motivational Messages', icon: <Zap className="h-6 w-6" />, items: motivations },
  ];
  
  const handleCardClick = (item: SuggestionItem) => {
    setSelectedSuggestion(item);
    setIsDetailsDialogOpen(true);
  };
  
  const handleMarkAsReadFromDialog = (suggestionId: string) => {
    markAsRead(suggestionId);
    setIsDetailsDialogOpen(false);
    setSelectedSuggestion(null);
  };

  return (
    <main className="flex-grow p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Library</CardTitle>
          <CardDescription>Your AI-curated collection of books, articles, and inspiration.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {shelves.map((shelf) => (
              <Card key={shelf.title} className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-primary">
                    {shelf.icon}
                    {shelf.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {shelf.items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {shelf.items.map(item => (
                        <Card 
                          key={item.id} 
                          className={cn(
                            "flex flex-col transition-all hover:shadow-md cursor-pointer",
                            !item.read && "border-primary border-2"
                          )}
                          onClick={() => handleCardClick(item)}
                        >
                          {!item.read && (
                            <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">New</Badge>
                          )}
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
                             {item.link ? (
                                <Button variant="link" asChild className="p-0 h-auto" onClick={(e) => {e.stopPropagation(); markAsRead(item.id)}}>
                                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                                        Read More
                                    </a>
                                </Button>
                            ) : (
                                <Button variant="link" className="p-0 h-auto" onClick={(e) => {e.stopPropagation(); markAsRead(item.id)}}>
                                    Mark as Read
                                </Button>
                            )}
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center p-4">No {shelf.title.toLowerCase()} available at the moment.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
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
