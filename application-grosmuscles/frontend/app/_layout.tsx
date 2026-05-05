import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../lib/AuthContext';
import { SessionProvider } from '../lib/SessionContext'; // Assure-toi que ce fichier existe et exporte SessionProvider

const InitialLayout = () => {
  const { userId, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Si l'état d'authentification n'est pas encore chargé, on ne fait rien.
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (userId && inAuthGroup) {
      // L'utilisateur est connecté mais se trouve sur une page d'authentification (login, inscription...).
      // On le redirige vers la page d'accueil de l'application.
      router.replace('/');
    } else if (!userId && !inAuthGroup) {
      // L'utilisateur n'est pas connecté et essaie d'accéder à une page protégée.
      // On le redirige vers la page d'inscription.
      router.replace('/inscription');
    }
  }, [userId, isLoaded, segments, router]);

  // Affiche un écran vide pendant que l'on vérifie l'authentification
  if (!isLoaded) {
    return null;
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <SessionProvider> {/* Ajouté pour englober l'application si tu as un SessionContext */}
      <AuthProvider>
        <InitialLayout />
      </AuthProvider>
    </SessionProvider>
  );
}