import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../lib/AuthContext';
import { SessionProvider } from '../lib/SessionContext';

/**
 * Ce composant est le gardien de l'application.
 * Il gère la redirection en fonction de l'état d'authentification.
 */
function RootLayoutNav() {
  const { userId, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // On attend que le contexte d'authentification soit chargé.
    if (!isLoaded) return;

    const inAuthGroup = segments.length > 0 && ['inscription', 'login'].includes(segments[0]);

    if (userId && inAuthGroup) {
      // L'utilisateur est connecté mais sur une page d'authentification.
      // On le redirige vers la page d'accueil.
      router.replace('/');
    } else if (!userId && !inAuthGroup) {
      // L'utilisateur n'est pas connecté et tente d'accéder à une page protégée.
      // On le redirige vers l'inscription.
      router.replace('/inscription');
    }
  }, [userId, isLoaded, segments, router]);

  // Si le contexte n'est pas encore chargé, on n'affiche rien pour éviter les erreurs.
  if (!isLoaded) {
    return null;
  }

  // Affiche la page actuelle.
  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SessionProvider>
        <RootLayoutNav />
      </SessionProvider>
    </AuthProvider>
  );
}