import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/AuthContext';
import { useSession } from '../lib/SessionContext';
import BottomNavBar from '../app/BottomNavBar';

const PURPLE = '#b844c7';
const DARK_BG = '#0a0a0a';
const TEXT_PRIMARY = '#f9f9fd';
const TEXT_SECONDARY = '#a1a1a1';

export default function Profile() {
  const { userName, logout } = useAuth();
  const { clearSession } = useSession();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        { 
          text: "Se déconnecter", 
          onPress: async () => {
            try {
              console.log("Déconnexion en cours...");
              clearSession();
              await logout(); // Attend que la session soit bien vidée
              router.replace('/login'); // Redirige explicitement
            } catch (error) {
              console.error("Erreur lors de la déconnexion :", error);
              Alert.alert("Erreur", "Une erreur est survenue lors de la déconnexion.");
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.profileCard}>
            <MaterialCommunityIcons name="account-circle" size={80} color={PURPLE} />
            <Text style={styles.userName}>{userName || 'Utilisateur'}</Text>
            <Text style={styles.userStatus}>Membre Actif</Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={22} color="#ff6e84" />
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        <BottomNavBar activeScreen="profil" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(184,68,199,0.15)',
  },
  headerTitle: {
    color: TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // Centre le contenu verticalement
    padding: 20,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 40,
  },
  userName: {
    color: TEXT_PRIMARY,
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
  },
  userStatus: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 110, 132, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255, 110, 132, 0.3)',
  },
  logoutButtonText: {
    color: '#ff6e84',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});