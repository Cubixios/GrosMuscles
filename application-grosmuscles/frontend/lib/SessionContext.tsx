import React, { createContext, useContext, useState } from 'react';

export interface Serie {
  id: string;
  reps: number;
  weight: string;
  restTime: number; // en secondes
}

export interface Exercise {
  id: string;
  name: string;
  group: string;
  series: Serie[];
  image: string;
  icon: string;
}

export interface SessionData {
  name: string;
  exercises: Exercise[];
  createdAt: string;
  startedAt?: string;
}

interface SessionContextType {
  currentSession: SessionData | null;
  setCurrentSession: (session: SessionData) => void;
  updateSession: (session: SessionData) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [currentSession, setCurrentSessionState] = useState<SessionData | null>(null);

  const setCurrentSession = (session: SessionData) => {
    setCurrentSessionState({
      ...session,
      startedAt: new Date().toISOString(),
    });
  };

  const updateSession = (session: SessionData) => {
    setCurrentSessionState(session);
  };

  const clearSession = () => {
    setCurrentSessionState(null);
  };

  return (
    <SessionContext.Provider value={{ currentSession, setCurrentSession, updateSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
