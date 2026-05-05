import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { creerCompteAPI } from '../services/api';
import { useAuth } from '../lib/AuthContext';

export default function Inscription() {
  const [nomInscription, setNomInscription] = useState('');
  const [emailInscription, setEmailInscription] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { setUserId, setUserName } = useAuth();

  const validerInscription = async () => {
    if (!nomInscription.trim()) {
      return Alert.alert("Erreur", "Veuillez entrer un nom.");
    }
    if (!password.trim()) {
      return Alert.alert("Erreur", "Veuillez créer un mot de passe.");
    }

    try {
      setLoading(true);
      // 1. Appel à ton backend FastAPI
      const reponse = await creerCompteAPI({
        nom: nomInscription,
        email: emailInscription.trim().toLowerCase(),
        password,
      });

      Alert.alert("Succès", "Compte créé ! Bienvenue.");

      const idUser = reponse?.utilisateur?.id_user;
      const nomUtilisateur = reponse?.utilisateur?.nom ?? nomInscription;
      if (!idUser) {
        throw new Error("Impossible de récupérer l'identifiant utilisateur.");
      }

      setUserId(String(idUser));
      setUserName(nomUtilisateur);
      // Le layout racine s'occupera de la redirection.
      router.replace('/calibration');

    } catch (erreur) {
      const message = erreur instanceof Error ? erreur.message : "Impossible de créer le compte.";
      Alert.alert("Erreur", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>👤</Text>
          </View>
          <Text style={styles.logoText}>Gros Muscle</Text>
        </View> 
      </View>
      <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="always" contentContainerStyle={styles.scrollContent}>
      {/* Background patterns - approximate */}
      <View style={styles.backgroundPattern}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
        <View style={styles.bgLine} />
      </View>
      {/* Main Content */}
      <View style={styles.main}>
        {/* Branding Section */}
        <View style={styles.branding}>
          <Text style={styles.title}>
            COMMENCEZ VOTRE{'\n'}
            <Text style={styles.titleHighlight}>AVENTURE</Text>
          </Text>
          <Text style={styles.subtitle}>
            Créez votre compte pour débloquer des performances athlétiques boostées par l'IA. Repoussez vos limites avec un suivi de précision.
          </Text>
          {/* Metrics - hidden on mobile, but can add */}
        </View>
        {/* Form Section */}
        <View style={styles.formContainer}>
          <View style={styles.form}>
            {/* Name Field */}
            <View style={styles.field}>
              <Text style={styles.label}>Nom Complet</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Alex Rivera"
                  value={nomInscription}
                  onChangeText={setNomInscription}
                />
              </View>
            </View>
            {/* Email Field */}
            <View style={styles.field}>
              <Text style={styles.label}>Adresse E-mail</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="alex@grosmuscle.ai"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={emailInscription}
                  onChangeText={setEmailInscription}
                />
              </View>
            </View>
            {/* Password Field */}
            <View style={styles.field}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="********"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>
            {/* CTA Button */}
            <TouchableOpacity
              style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
              onPress={validerInscription}
              activeOpacity={0.85}
              accessibilityRole="button"
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <><Text style={styles.ctaText}>CRÉER UN COMPTE</Text><Text style={styles.ctaIcon}>⚡</Text></>
              )}
            </TouchableOpacity>
            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Ou continuer avec</Text>
              <View style={styles.dividerLine} />
            </View>
            {/* Social Sign-up - approximate */}
            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialIcon}>G</Text>
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialIcon}></Text>
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            </View>
            {/* Login Redirect */}
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.loginText}>
                Vous avez déjà un compte ? <Text style={styles.loginLink}>Se connecter</Text>
              </Text>
            </TouchableOpacity>
          </View>
          {/* Footer */}
          <Text style={styles.footerText}>
            En vous inscrivant, vous acceptez nos{'\n'}Conditions de Performance et notre Politique Pulse.
          </Text>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

// Les styles de cette page
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a030b', 
  },
  header: { 
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a081d',
    borderWidth: 1,
    borderColor: 'rgba(74,51,77,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 20,
    color: '#b844c7',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#b844c7',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  headerButton: {
    // TouchableOpacity n'accepte pas la propriété color, la couleur se gère sur le Text enfant
  },
  headerIcon: {
    fontSize: 24,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
    pointerEvents: 'none',
  },
  bgCircle1: {
    position: 'absolute',
    top: -96,
    left: -96,
    width: 384,
    height: 384,
    backgroundColor: 'rgba(184,68,199,0.2)',
    borderRadius: 192,
  },
  bgCircle2: {
    position: 'absolute',
    top: '50%',
    right: -96,
    width: 320,
    height: 320,
    backgroundColor: 'rgba(223,146,232,0.1)',
    borderRadius: 160,
  },
  bgLine: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(184,68,199,0.3)',
    transform: [{ rotate: '12deg' }],
  },
  main: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  branding: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    color: '#f9f9fd',
    marginBottom: 18,
    textTransform: 'uppercase',
  },
  titleHighlight: {
    color: '#b844c7',
  },
  subtitle: {
    fontSize: 16,
    color: '#b89ebc',
    textAlign: 'center',
    maxWidth: 360,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    backgroundColor: 'rgba(26,8,29,0.4)',
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(74,51,77,0.15)',
    shadowColor: '#b844c7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 5,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#b89ebc',
    marginLeft: 4,
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    fontSize: 20,
    color: '#7c627e',
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(74,51,77,0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingLeft: 48,
    paddingRight: 16,
    color: '#f9f9fd',
    fontSize: 16,
  },
  picker: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(74,51,77,0.1)',
    borderRadius: 12,
    color: '#f9f9fd',
    paddingLeft: 48,
    paddingVertical: 8,
  },
  ctaButton: {
    backgroundColor: '#b844c7',
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  ctaButtonDisabled: {
    backgroundColor: '#7c627e',
  },
  ctaText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  ctaIcon: {
    fontSize: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(74,51,77,0.2)',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(184,158,188,0.5)',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(45,15,50,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(74,51,77,0.2)',
    borderRadius: 12,
    paddingVertical: 16,
  },
  socialIcon: {
    fontSize: 20,
    color: '#f9f9fd',
  },
  socialText: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#f9f9fd',
  },
  loginText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#b89ebc',
    marginTop: 24,
  },
  loginLink: {
    color: '#b844c7',
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 10,
    color: '#7c627e',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    lineHeight: 16,
    opacity: 0.6,
    marginTop: 24,
  },
});