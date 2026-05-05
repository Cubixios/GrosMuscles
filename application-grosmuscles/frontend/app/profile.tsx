import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../lib/AuthContext';

const PURPLE = '#b844c7';
const DARK_BG = '#0a0a0a';
const SURFACE_CONTAINER = '#141414';
const TEXT_PRIMARY = '#f9f9fd';
const TEXT_SECONDARY = '#a1a1a1';

export default function Profile() {
  const router = useRouter();
  const { logout, userName } = useAuth(); // `logout` vient maintenant du contexte

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: () => {
            // On appelle simplement logout. Le layout s'occupera de la redirection.
            logout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.title}>PROFIL</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv67-s0wS1MTsQALx1FfxIcS3Uehk2KmbaZAyTCYtY-zbok1nFlxJTeKe3F-kc2txnhVSmOt1ZHHbS7WJW1sYflFadkrqOwZvwHjwiSwnSlNrccyVoGpHqV5aamgmZyix6Eur6Yk0HRzd5brAFGEOCzs5xsT6G3qF7WOritQXPeDt76A8gcOYzcAwVgGAoPLVJgU5KvpDjss-TC0CkV2YqUTde1Ti--Vr9HWBr3GhVIetCjoljIfOzn0cmnKPZr-HtcojTvS8qBkOI' }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{userName ?? 'Utilisateur'}</Text>
          <Text style={styles.profileSubtitle}>Membre depuis 2026</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Séances</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Routines</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>42h</Text>
            <Text style={styles.statLabel}>Entraînement</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialCommunityIcons
              name="account-edit"
              size={20}
              color={PURPLE}
            />
            <Text style={styles.settingText}>Modifier le profil</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={TEXT_SECONDARY}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialCommunityIcons name="bell" size={20} color={PURPLE} />
            <Text style={styles.settingText}>Notifications</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={TEXT_SECONDARY}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialCommunityIcons name="cog" size={20} color={PURPLE} />
            <Text style={styles.settingText}>Préférences</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={TEXT_SECONDARY}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#ff7351" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/')}
        >
          <MaterialCommunityIcons
            name="home-outline"
            size={24}
            color={TEXT_SECONDARY}
          />
          <Text style={styles.navLabel}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/routines')}>
          <MaterialCommunityIcons name="dumbbell" size={24} color={TEXT_SECONDARY} />
          <Text style={styles.navLabel}>Routines</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/analyses')}
        >
          <MaterialCommunityIcons
            name="chart-bar"
            size={24}
            color={TEXT_SECONDARY}
          />
          <Text style={styles.navLabel}>Analyses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="account" size={24} color={PURPLE} />
          <Text style={[styles.navLabel, { color: PURPLE }]}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(77, 77, 77, 0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    letterSpacing: 1.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: SURFACE_CONTAINER,
    borderRadius: 16,
    paddingVertical: 24,
    marginBottom: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: PURPLE,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
  },
  profileSubtitle: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: SURFACE_CONTAINER,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PURPLE,
  },
  statLabel: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE_CONTAINER,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    color: TEXT_PRIMARY,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 115, 81, 0.1)',
    borderWidth: 1,
    borderColor: '#ff7351',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff7351',
  },
  spacer: {
    height: 60,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(77, 77, 77, 0.2)',
    paddingBottom: 12,
    paddingTop: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: TEXT_SECONDARY,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
