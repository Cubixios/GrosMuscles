import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../lib/AuthContext';
import { SessionProvider } from '../lib/SessionContext';

// Ce composant "gardien" protège les routes de l'application.
const AuthGuard = () => {
  const { userId, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // On attend que le statut de connexion soit chargé avant de faire quoi que ce soit.
    if (!isLoaded) return;

    const isAuthPage = (segments as string[]).includes('login') || (segments as string[]).includes('inscription');

    if (userId && isAuthPage) {
      // L'utilisateur est connecté mais sur une page d'authentification (login/inscription).
      // On le redirige vers la page d'accueil.
      router.replace('/');
    } else if (!userId && !isAuthPage) {
      // L'utilisateur n'est pas connecté et essaie d'accéder à une page protégée.
      // On le redirige vers la page de connexion.
      router.replace('/login');
    }
  }, [userId, isLoaded, segments, router]);

  // Le Stack gère l'affichage des pages une fois la redirection terminée.
  return <Stack screenOptions={{ headerShown: false }} />;
};

// C'est le layout racine de toute l'application.
export default function RootLayout() {
  return (
    // On enveloppe toute l'application avec les fournisseurs de contexte
    // pour que la connexion soit accessible partout.
    <AuthProvider>
      <SessionProvider>
        <AuthGuard />
      </SessionProvider>
    </AuthProvider>
  );
}