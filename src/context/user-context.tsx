
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

type UserRole = 'Admin' | 'Team Leader' | 'Consultant';

interface User {
  id: string;
  name: string;
  role: UserRole;
  department: string;
}

const defaultUser: User = {
  id: 'patrick-achitabwino-m1',
  name: 'Patrick Achitabwino',
  role: 'Team Leader', // Defaulting to Team Leader for demonstration
  department: 'Customer Service',
};

interface UserContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(defaultUser);

  const value = {
    user,
    setUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
