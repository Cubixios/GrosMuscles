import { Slot } from 'expo-router';
import { AuthProvider } from './_lib/AuthContext';
import { SessionProvider } from './_lib/SessionContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SessionProvider>
        <Slot />
      </SessionProvider>
    </AuthProvider>
  );
}