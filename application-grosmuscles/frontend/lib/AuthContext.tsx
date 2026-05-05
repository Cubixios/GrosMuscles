import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  userId: string | null;
  userName: string | null;
  setUserId: (id: string | null) => void;
  setUserName: (name: string | null) => void;
  isLoaded: boolean; // Ajout de isLoaded
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdState] = useState<string | null>(null); // L'ID de l'utilisateur connecté
  const [userName, setUserNameState] = useState<string | null>(null); // Le nom de l'utilisateur connecté
  const [isLoaded, setIsLoaded] = useState<boolean>(false); // Indique si les données d'auth ont été chargées

  // Effet pour charger les données d'authentification depuis AsyncStorage au démarrage
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedUserName = await AsyncStorage.getItem('userName');
        if (storedUserId) {
          setUserIdState(storedUserId);
          setUserNameState(storedUserName);
        }
      } catch (error) {
        console.error('Failed to load auth data from AsyncStorage', error);
      } finally {
        setIsLoaded(true); // Le chargement est terminé, que des données aient été trouvées ou non
      }
    };
    loadAuthData();
  }, []);

  // Fonctions pour mettre à jour l'état et le stockage
  const setUserIdAndStore = async (id: string | null) => {
    setUserIdState(id);
    if (id) await AsyncStorage.setItem('userId', id); else await AsyncStorage.removeItem('userId');
  };

  const setUserNameAndStore = async (name: string | null) => {
    setUserNameState(name);
    if (name) await AsyncStorage.setItem('userName', name); else await AsyncStorage.removeItem('userName');
  };

  const logout = () => {
    setUserIdState(null);
    setUserNameState(null);
    AsyncStorage.removeItem('userId');
    AsyncStorage.removeItem('userName');
  };

  return ( // Expose isLoaded et les fonctions de mise à jour avec stockage
    <AuthContext.Provider value={{
      userId,
      userName,
      setUserId: setUserIdAndStore, // Utilise la fonction qui stocke aussi
      setUserName: setUserNameAndStore, // Utilise la fonction qui stocke aussi
      isLoaded,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType { // Ajout explicite du type de retour
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
