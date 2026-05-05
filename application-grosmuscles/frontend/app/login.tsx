import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { loginAPI } from '../services/api';
import { useAuth } from '../lib/AuthContext';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUserId, setUserName } = useAuth();

  const handleLogin = async () => {
    Alert.alert('DEBUG', 'handleLogin a été appelé!');
    if (!email.trim() || !password.trim()) {
      return Alert.alert('Erreur', 'Veuillez renseigner votre e-mail et votre mot de passe.');
    }

    try {
      setLoading(true);
      setErrorMessage('');
      Alert.alert('DEBUG', 'Envoi de la requête API...');
      const response = await loginAPI({ email: email.trim().toLowerCase(), password });
      Alert.alert('DEBUG', 'Réponse reçue: ' + JSON.stringify(response).substring(0, 100));
      const idUser = response?.utilisateur?.id_user;
      const nomUtilisateur = response?.utilisateur?.nom ?? null;
      console.warn('DEBUG: idUser=', idUser, 'nom=', nomUtilisateur);
      if (!idUser) {
        throw new Error('Impossible de récupérer l’identifiant utilisateur.');
      }
      setUserId(String(idUser));
      setUserName(nomUtilisateur);
      console.warn('DEBUG: Auth context mis à jour, navigation vers /accueil...');
      router.replace(`/accueil?idUser=${encodeURIComponent(String(idUser))}`);
    } catch (error) {
      console.error('DEBUG: erreur attrapée =', error);
      const message = error instanceof Error ? error.message : 'Erreur de connexion.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="always">
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/inscription')}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GROS MUSCLE</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Bon retour parmi nous</Text>
        <Text style={styles.subtitle}>Connectez-vous pour continuer votre entraînement et suivre vos performances.</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Adresse e-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="votre@email.com"
              placeholderTextColor="#8a82a0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.field}>
            <View style={styles.passwordHeader}>
              <Text style={styles.fieldLabel}>Mot de passe</Text>
              <TouchableOpacity onPress={() => Alert.alert('Mot de passe oublié', 'Cette fonction sera ajoutée prochainement.') }>
                <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#8a82a0"
              autoCapitalize="none"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.loginButtonText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Ou se connecter avec</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}></Text>
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Pas encore de compte ?</Text>
            <TouchableOpacity onPress={() => router.replace('/inscription')}>
              <Text style={styles.footerLink}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0e11',
  },
  contentContainer: {
    paddingTop: 88,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 72,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(18,20,23,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(184,68,199,0.12)',
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    color: '#b844c7',
    fontSize: 20,
  },
  headerTitle: {
    color: '#b844c7',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 32,
  },
  card: {
    backgroundColor: 'rgba(18,20,23,0.9)',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(184,68,199,0.15)',
    shadowColor: '#b844c7',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 12,
  },
  title: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '900',
    color: '#f9f9fd',
    marginBottom: 12,
  },
  subtitle: {
    color: '#aaabaf',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
  },
  form: {
    gap: 18,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#aaabaf',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotText: {
    color: '#b844c7',
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#171a1d',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(184,68,199,0.15)',
    color: '#f9f9fd',
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#ff6e84',
    fontSize: 14,
    marginBottom: 8,
  },
  loginButton: {
    backgroundColor: '#b844c7',
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(148,104,136,0.2)',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#aaabaf',
    fontSize: 11,
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(148,104,136,0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(70,72,75,0.12)',
  },
  socialIcon: {
    color: '#f9f9fd',
    fontSize: 18,
    fontWeight: '900',
  },
  socialText: {
    color: '#f9f9fd',
    fontSize: 14,
    fontWeight: '700',
  },
  footerRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  footerText: {
    color: '#aaabaf',
    fontSize: 13,
  },
  footerLink: {
    color: '#b844c7',
    fontSize: 13,
    fontWeight: '800',
  },
});
