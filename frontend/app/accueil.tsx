import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, useRootNavigationState } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from './AuthContext';

const PURPLE = '#b844c7';
const DARK_BG = '#0a0a0a';
const SURFACE = '#111111';
const SURFACE_CONTAINER = '#141414';
const TEXT_PRIMARY = '#f9f9fd';
const TEXT_SECONDARY = '#a1a1a1';
const OUTLINE = '#333333';

export default function Accueil() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const { userId, setUserId } = useAuth();

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    // Si on a un ID en paramètre, on le sauvegarde dans le context
    if (params.idUser) {
      setUserId(String(params.idUser));
      return;
    }

    // Si pas d'ID, on redirige vers l'inscription
    if (!userId) {
      router.replace('/inscription');
    }
  }, [rootNavigationState?.key, params.idUser, userId]);

  if (!userId) {
    return <View style={styles.container} />;
  }

  const seancesFaites = [
    {
      id: 1,
      nom: 'Dos / Biceps',
      date: 'Aujourd\'hui',
      volume: '8 500 kg',
      duree: '1h15',
    },
    {
      id: 2,
      nom: 'Jambes (Focus Quad)',
      date: '27 Mars',
      volume: '12 200 kg',
      duree: '1h30',
    },
    {
      id: 3,
      nom: 'Pectoraux / Triceps',
      date: '25 Mars',
      volume: '7 800 kg',
      duree: '1h10',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv67-s0wS1MTsQALx1FfxIcS3Uehk2KmbaZAyTCYtY-zbok1nFlxJTeKe3F-kc2txnhVSmOt1ZHHbS7WJW1sYflFadkrqOwZvwHjwiSwnSlNrccyVoGpHqV5aamgmZyix6Eur6Yk0HRzd5brAFGEOCzs5xsT6G3qF7WOritQXPeDt76A8gcOYzcAwVgGAoPLVJgU5KvpDjss-TC0CkV2YqUTde1Ti--Vr9HWBr3GhVIetCjoljIfOzn0cmnKPZr-HtcojTvS8qBkOI',
            }}
            style={styles.profileImage}
          />
          <Text style={styles.headerTitle}>GROS MUSCLE</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity>
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color={TEXT_SECONDARY}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialCommunityIcons
              name="magnify"
              size={24}
              color={TEXT_SECONDARY}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Editorial Header */}
        <View style={styles.editorialHeader}>
          <Text style={styles.label}>ACCUEIL</Text>
          <Text style={styles.title}>
            Bienvenue<Text style={styles.titleHighlight}> 💪</Text>
          </Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Séances</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Routines</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>42h</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Recent Sessions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Séances Récentes</Text>
          {seancesFaites.map((seance) => (
            <TouchableOpacity key={seance.id} style={styles.sessionCard}>
              <View style={styles.sessionLeft}>
                <View style={styles.sessionIconContainer}>
                  <MaterialCommunityIcons
                    name="dumbbell"
                    size={20}
                    color={PURPLE}
                  />
                </View>
                <View>
                  <Text style={styles.sessionName}>{seance.nom}</Text>
                  <Text style={styles.sessionDate}>{seance.date}</Text>
                </View>
              </View>
              <View style={styles.sessionStats}>
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>⏱ {seance.duree}</Text>
                </View>
                <View style={styles.statBadge}>
                  <Text style={styles.statBadgeText}>🏋️ {seance.volume}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="home" size={24} color={PURPLE} />
          <Text style={[styles.navLabel, { color: PURPLE }]}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/routines')}>
          <MaterialCommunityIcons
            name="dumbbell"
            size={24}
            color={TEXT_SECONDARY}
          />
          <Text style={styles.navLabel}>Routines</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/analyses')}>
          <MaterialCommunityIcons
            name="chart-bar"
            size={24}
            color={TEXT_SECONDARY}
          />
          <Text style={styles.navLabel}>Analyses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <MaterialCommunityIcons
            name="account-outline"
            size={24}
            color={TEXT_SECONDARY}
          />
          <Text style={styles.navLabel}>Profil</Text>
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: PURPLE,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: PURPLE,
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  editorialHeader: {
    marginBottom: 24,
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: PURPLE,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
    fontStyle: 'italic',
  },
  titleHighlight: {
    color: PURPLE,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: SURFACE_CONTAINER,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(184, 68, 199, 0.1)',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PURPLE,
  },
  statLabel: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  sessionCard: {
    backgroundColor: SURFACE_CONTAINER,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: OUTLINE,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sessionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(184, 68, 199, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(184, 68, 199, 0.2)',
  },
  sessionName: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  sessionDate: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },
  sessionStats: {
    gap: 6,
  },
  statBadge: {
    backgroundColor: 'rgba(184, 68, 199, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(184, 68, 199, 0.2)',
  },
  statBadgeText: {
    fontSize: 11,
    color: TEXT_PRIMARY,
    fontWeight: '600',
  },
  spacer: {
    height: 80,
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
