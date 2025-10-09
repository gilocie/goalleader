
'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { Book, Newspaper, Zap, Briefcase } from 'lucide-react';

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

// Simulate monthly book suggestions
const getMonthlyBooks = () => {
    const currentMonth = new Date().getMonth();
    const books = [
        {
            id: 'book-1',
            type: 'book' as const,
            title: 'Book of the Month: "The Lean Startup"',
            content: 'How Today\'s Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses. A must-read for anyone in a startup environment.',
            read: false, // Books are never "read" in the context of being dismissible
            link: 'https://www.amazon.com/Lean-Startup-Entrepreneurs-Continuous-Innovation/dp/0307887898',
            timestamp: new Date(new Date().setDate(1)).toISOString(), // First of the month
        },
        {
            id: 'book-2',
            type: 'book' as const,
            title: 'Book of the Month: "Thinking, Fast and Slow"',
            content: 'A fascinating dive into the two systems that drive the way we think. System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical.',
            read: false,
            link: 'https://www.amazon.com/Thinking-Fast-Slow-Daniel-Kahneman/dp/0374533555',
            timestamp: new Date(new Date().setDate(1)).toISOString(),
        },
        {
            id: 'book-3',
            type: 'book' as const,
            title: 'Book of the Month: "Sapiens: A Brief History of Humankind"',
            content: 'Explores the history of humankind, from the Stone Age to the present day, and how Homo sapiens came to dominate the world.',
            read: false,
            link: 'https://www.amazon.com/Sapiens-Humankind-Yuval-Noah-Harari/dp/0062316095',
            timestamp: new Date(new Date().setDate(1)).toISOString(),
        },
    ];
    // In a real app, you might have different books for different months
    return books.slice(currentMonth % 1); // Simple logic to rotate books
};


const initialSuggestions: SuggestionItem[] = [
  ...getMonthlyBooks(),
  {
    id: 'motivation-1',
    type: 'motivation',
    title: 'Your Daily Motivation',
    content: '"Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill',
    read: false,
    timestamp: generateTimestamp(9), // Morning
  },
  {
    id: 'news-1',
    type: 'news',
    title: 'AI in Project Management',
    content: 'A new Forbes article highlights how AI is revolutionizing project timeline predictions, reducing errors by up to 40%.',
    read: false,
    source: 'Forbes',
    timestamp: generateTimestamp(13), // Afternoon
  },
  {
    id: 'news-2',
    type: 'news',
    title: 'Remote Work Trends',
    content: 'The latest Gallup poll shows that a hybrid model is now the preferred work style for 55% of knowledge workers.',
    read: false,
    source: 'Gallup',
    timestamp: generateTimestamp(13),
  },
  {
    id: 'news-3',
    type: 'news',
    title: 'Cybersecurity Alert',
    content: 'A new phishing scam targeting corporate email accounts is on the rise. Be vigilant with unsolicited attachments.',
    read: false,
    source: 'CISA',
    timestamp: generateTimestamp(13),
  },
  {
    id: 'story-1',
    type: 'story',
    title: 'Business Story: The Rise of Slack',
    content: 'Did you know Slack started as an internal tool for a gaming company? When their game failed, they pivoted to the communication tool we know today, a classic example of turning failure into massive success.',
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

  const unreadItems = useMemo(() => suggestions.filter(s => !s.read && s.type !== 'book').sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [suggestions]);
  const readItems = useMemo(() => suggestions.filter(s => s.read).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [suggestions]);
  
  const markAsRead = (id: string) => {
    setSuggestions(prev => prev.map(s => (s.id === id ? { ...s, read: true } : s)));
  };
  
  const markAllAsRead = () => {
    setSuggestions(prev => prev.map(s => s.type !== 'book' ? { ...s, read: true } : s));
  };

  const value = {
    unreadItems,
    readItems,
    markAsRead,
    markAllAsRead,
    // We add the books here so they can be accessed separately
    monthlyBooks: suggestions.filter(s => s.type === 'book')
  };

  return (
    <AISuggestionContext.Provider value={value as any}>
      {children}
    </AISuggestionContext.Provider>
  );
};

export const useAISuggestions = (): AISuggestionContextType & { monthlyBooks: SuggestionItem[] } => {
  const context = useContext(AISuggestionContext);
  if (context === undefined) {
    throw new Error('useAISuggestions must be used within a AISuggestionProvider');
  }
  return context as AISuggestionContextType & { monthlyBooks: SuggestionItem[] };
};

export const getSuggestionIcon = (type: SuggestionItem['type']) => {
    switch (type) {
        case 'book': return <Book className="h-5 w-5 text-purple-500" />;
        case 'news': return <Newspaper className="h-5 w-5 text-blue-500" />;
        case 'story': return <Briefcase className="h-5 w-5 text-orange-500" />;
        case 'motivation': return <Zap className="h-5 w-5 text-yellow-500" />;
        default: return <Zap className="h-5 w-5 text-primary" />;
    }
}
