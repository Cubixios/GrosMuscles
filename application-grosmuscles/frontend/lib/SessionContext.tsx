import React, { createContext, useContext, useState } from 'react';

// Définis les types pour tes exercices et séries.
// Voici un exemple de structure, tu devras l'adapter à tes besoins réels.
interface Serie {
  id: string;
  reps: number;
  weight: number;
  restTime: number;
  isCompleted: boolean;
}

interface Exercise {
  id: string;
  name: string;
  group: string;
  image: string;
  icon?: string; // Ajout de la propriété icon (optionnelle)
  series: Serie[];
}

interface CurrentSession {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: string; // Ajout de la propriété createdAt
}

interface SessionContextType {
  currentSession: CurrentSession | null;
  setCurrentSession: (session: CurrentSession | null) => void;
  clearSession: () => void;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [currentSession, setCurrentSession] = useState<CurrentSession | null>(null);

  const clearSession = () => {
    setCurrentSession(null);
  };

  return (
    <SessionContext.Provider value={{ currentSession, setCurrentSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}