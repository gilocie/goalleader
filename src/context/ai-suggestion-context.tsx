
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
    // Books themed around performance, personal growth, and company growth
    const books = [
        {
            id: 'book-1',
            type: 'book' as const,
            title: 'For Your Performance: "Deep Work"',
            content: 'Rules for Focused Success in a Distracted World. This book provides actionable advice for improving focus and productivity in a world filled with distractions. A must-read for anyone looking to increase their effectiveness.',
            read: false,
            link: 'https://www.amazon.com/Deep-Work-Focused-Success-Distracted/dp/1455586692',
            timestamp: new Date(new Date().setDate(1)).toISOString(),
        },
        {
            id: 'book-2',
            type: 'book' as const,
            title: 'For Personal Growth: "Atomic Habits"',
            content: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. James Clear presents a framework for improving every day. It\'s a powerful guide to making small changes that lead to remarkable results.',
            read: false,
            link: 'https://www.amazon.com/Atomic-Habits-Proven-Build-Breaks/dp/0735211299',
            timestamp: new Date(new Date().setDate(1)).toISOString(),
        },
        {
            id: 'book-3',
            type: 'book' as const,
            title: 'For Company Growth: "The Innovator\'s Dilemma"',
            content: 'When New Technologies Cause Great Firms to Fail. This book by Clayton Christensen is a classic on disruption and why market leaders are often the last to see it coming. Essential reading for any business leader.',
            read: false,
            link: 'https://www.amazon.com/Innovators-Dilemma-Technologies-Management-Innovation/dp/1633691780',
            timestamp: new Date(new Date().setDate(1)).toISOString(),
        },
    ];
    // In a real app, you might have different books for different months
    return books;
};


const initialSuggestions: SuggestionItem[] = [
  ...getMonthlyBooks(),
  {
    id: 'motivation-1',
    type: 'motivation',
    title: 'A Thought for Your Day, Patrick',
    content: `### The Power of a Growth Mindset

A growth mindset, Patrick, is the belief that your abilities can be developed through dedication and hard work. It’s not about believing you can be anything, but knowing you can improve. This simple shift in perspective is the foundation of personal and financial success. When you see challenges as opportunities to learn rather than as insurmountable obstacles, you unlock your potential to achieve great things. Every setback becomes a lesson, and every success is a stepping stone.

Embracing this mindset means you are constantly learning and improving. To cultivate it, start by recognizing your fixed-mindset thoughts (e.g., "I'm not good at this") and consciously reframe them ("I'm not good at this *yet*"). Celebrate your process, not just the outcome. By focusing on growth and resilience, you build the mental wealth that is crucial for achieving financial freedom and personal fulfillment.`,
    read: false,
    timestamp: generateTimestamp(9), // Morning
  },
  {
    id: 'news-1',
    type: 'news',
    title: 'Local News: Malawi Digital Skills Initiative',
    content: 'The Malawian government has launched a new initiative to boost digital literacy and provide tech skills to over 10,000 youths, aiming to foster innovation and create jobs in the tech sector.',
    read: false,
    source: 'Malawi News Agency',
    timestamp: generateTimestamp(13), // Afternoon
  },
  {
    id: 'news-2',
    type: 'news',
    title: 'International: Global Tech Market Trends',
    content: 'A recent report indicates that investment in AI and machine learning startups has surpassed $50 billion in the last quarter, signaling continued growth in the tech industry worldwide.',
    read: false,
    source: 'Reuters',
    timestamp: generateTimestamp(13),
  },
  {
    id: 'news-3',
    type: 'news',
    title: 'Business: The Future of Hybrid Work',
    content: 'Companies are increasingly adopting flexible work policies, with a focus on results-oriented performance metrics rather than hours spent in the office. This shift is reshaping corporate culture.',
    read: false,
    source: 'Harvard Business Review',
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
