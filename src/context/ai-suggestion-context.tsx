
'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { Book, Newspaper, Zap } from 'lucide-react';

export interface SuggestionItem {
  id: string;
  type: 'book' | 'news' | 'story' | 'motivation';
  title: string;
  content: string;
  read: boolean;
  link?: string;
  source?: string;
  timestamp: string;
}

const generateTimestamp = (hour: number) => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
}

const initialSuggestions: SuggestionItem[] = [
  {
    id: 'book-1',
    type: 'book',
    title: 'Book Suggestion: "The Phoenix Project"',
    content: 'A must-read for anyone in tech. It narrates the story of a company\'s IT and DevOps transformation. A great story on teamwork and process improvement.',
    read: false,
    link: 'https://www.amazon.com/Phoenix-Project-DevOps-Helping-Business/dp/0988262592',
    timestamp: generateTimestamp(9), // Morning
  },
  {
    id: 'news-1',
    type: 'news',
    title: 'Daily News: AI in Customer Service',
    content: 'A new study by TechCrunch shows that AI-powered chatbots have improved customer satisfaction rates by up to 25% in the retail sector.',
    read: false,
    source: 'TechCrunch',
    timestamp: generateTimestamp(13), // Afternoon
  },
  {
    id: 'motivation-1',
    type: 'motivation',
    title: 'Daily Motivation',
    content: '"The secret of getting ahead is getting started." - Mark Twain',
    read: false,
    timestamp: generateTimestamp(16), // End of day
  },
];

interface AISuggestionContextType {
  unreadItems: SuggestionItem[];
  readItems: SuggestionItem[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const AISuggestionContext = createContext<AISuggestionContextType | undefined>(undefined);

export const AISuggestionProvider = ({ children }: { children: ReactNode }) => {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(initialSuggestions);

  const unreadItems = useMemo(() => suggestions.filter(s => !s.read).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [suggestions]);
  const readItems = useMemo(() => suggestions.filter(s => s.read).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [suggestions]);
  
  const markAsRead = (id: string) => {
    setSuggestions(prev => prev.map(s => (s.id === id ? { ...s, read: true } : s)));
  };
  
  const markAllAsRead = () => {
    setSuggestions(prev => prev.map(s => ({ ...s, read: true })));
  };

  const value = {
    unreadItems,
    readItems,
    markAsRead,
    markAllAsRead,
  };

  return (
    <AISuggestionContext.Provider value={value}>
      {children}
    </AISuggestionContext.Provider>
  );
};

export const useAISuggestions = () => {
  const context = useContext(AISuggestionContext);
  if (context === undefined) {
    throw new Error('useAISuggestions must be used within a AISuggestionProvider');
  }
  return context;
};

export const getSuggestionIcon = (type: SuggestionItem['type']) => {
    switch (type) {
        case 'book': return <Book className="h-5 w-5 text-purple-500" />;
        case 'news': return <Newspaper className="h-5 w-5 text-blue-500" />;
        case 'story': return <Book className="h-5 w-5 text-orange-500" />;
        case 'motivation': return <Zap className="h-5 w-5 text-yellow-500" />;
        default: return <Zap className="h-5 w-5 text-primary" />;
    }
}
