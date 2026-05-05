import { Slot } from 'expo-router';
import { AuthProvider } from '../lib/AuthContext';
import { SessionProvider } from '../lib/SessionContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SessionProvider>
        <Slot />
      </SessionProvider>
    </AuthProvider>
  );
}