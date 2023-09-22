// UserContext.tsx

import React, { createContext, useContext, ReactNode } from 'react';

interface User {
  deliveryAddr: string;
}

interface UserContextType {
  user: User | null;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // You would obtain the user data from your data source or state
  const user: User | null = {
    deliveryAddr: '123 Main St, Exampleville, CA',
    // Initialize other user properties
  };

  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
