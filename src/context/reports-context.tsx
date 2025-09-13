
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

export type Report = {
  id: string;
  title: string;
  content: string;
  date: string;
};

interface ReportsContextType {
  reports: Report[];
  addReport: (report: Omit<Report, 'id' | 'date'>) => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const ReportsProvider = ({ children }: { children: ReactNode }) => {
  const [reports, setReports] = useState<Report[]>([]);

  const addReport = (report: Omit<Report, 'id' | 'date'>) => {
    const newReport: Report = {
      ...report,
      id: new Date().toISOString() + Math.random(),
      date: new Date().toISOString(),
    };
    setReports(prev => [newReport, ...prev]);
  };

  const value = {
    reports,
    addReport,
  };

  return (
    <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};
