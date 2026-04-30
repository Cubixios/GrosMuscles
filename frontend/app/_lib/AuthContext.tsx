import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  userId: string | null;
  userName: string | null;
  setUserId: (id: string | null) => void;
  setUserName: (name: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [userName, setUserNameState] = useState<string | null>(null);

  const setUserId = (id: string | null) => {
    setUserIdState(id);
  };

  const setUserName = (name: string | null) => {
    setUserNameState(name);
  };

  const logout = () => {
    setUserIdState(null);
    setUserNameState(null);
  };

  return (
    <AuthContext.Provider value={{ userId, userName, setUserId, setUserName, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
