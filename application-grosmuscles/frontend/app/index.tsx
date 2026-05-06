import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, useRootNavigationState } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../lib/AuthContext';
import { getSeancesUtilisateur } from '../services/api';

const PURPLE = '#b844c7';
const DARK_BG = '#0a0a0a';
const SURFACE_CONTAINER = '#141414';
const TEXT_PRIMARY = '#f9f9fd';
const TEXT_SECONDARY = '#a1a1a1';
const OUTLINE = '#333333';

// Définissons un type pour nos séances pour plus de clarté et de sécurité
interface Seance {
  id_realise: number;
  nom_seance: string;
  date_heure: string;
  duree_totale: number;
  note_fatigue: number;
}

export default function Index() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { userId, setUserId, userName } = useAuth();
  const [seances, setSeances] = useState<Seance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les séances au montage du composant ou quand userId change
  useEffect(() => {
    if (userId) {
      chargerSeances(userId);
    }
  }, [userId]);

  const chargerSeances = async (uid: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSeancesUtilisateur(parseInt(uid, 10));
      setSeances(data);
    } catch (err) {
      console.error('Erreur lors du chargement des séances:', err);
      setError('Erreur lors du chargement des séances');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPress = () => {
    if (userId) {
      chargerSeances(userId);
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    }
  };

  // Formater la durée en heures/minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${heures}h${mins}` : `${heures}h`;
  };

  // Calculer le temps total d'entraînement à partir des séances chargées
  const totalMinutes = seances.reduce((sum, seance) => sum + seance.duree_totale, 0);

  if (!userId) {
    return <View style={styles.container} />;
  }

  // Composant pour afficher une seule séance dans la FlatList
  const renderSeanceCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.sessionCard}>
      <View style={styles.sessionLeft}>
        <View style={styles.sessionIconContainer}>
          <MaterialCommunityIcons
            name="dumbbell"
            size={20}
            color={PURPLE}
          />
        </View>
        <View>
          <Text style={styles.sessionName}>{item.nom_seance || 'Séance'}</Text>
          <Text style={styles.sessionDate}>{formatDate(item.date_heure)}</Text>
        </View>
      </View>
      <View style={styles.sessionStats}>
        <View style={styles.statBadge}>
          <Text style={styles.statBadgeText}>⏱ {formatDuration(item.duree_totale)}</Text>
        </View>
        <View style={styles.statBadge}>
          <Text style={styles.statBadgeText}>💪 Fatigue: {item.note_fatigue}/10</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
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
            Bienvenue, {userName || 'Athlète'}<Text style={styles.titleHighlight}> 💪</Text>
          </Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{seances.length}</Text>
            <Text style={styles.statLabel}>Séances</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Routines</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{formatDuration(totalMinutes)}</Text>
            <Text style={styles.statLabel}>Temps Total</Text>
          </View>
        </View>

        {/* Recent Sessions Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Séances Récentes</Text>
            <TouchableOpacity onPress={handleRefreshPress}>
              <MaterialCommunityIcons
                name="refresh"
                size={20}
                color={PURPLE}
              />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={PURPLE} style={{ marginVertical: 20 }} />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={handleRefreshPress}
              >
                <Text style={styles.retryButtonText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          ) : seances.length > 0 ? (
            <FlatList
              data={seances}
              renderItem={renderSeanceCard}
              keyExtractor={(item) => item.id_realise.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="dumbbell"
                size={48}
                color={TEXT_SECONDARY}
              />
              <Text style={styles.emptyText}>Aucune séance enregistrée</Text>
              <Text style={styles.emptySubText}>Commence ta première séance!</Text>
            </View>
          )}
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.navBar}>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
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
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: PURPLE,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: TEXT_PRIMARY,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    marginTop: 4,
  },
  spacer: {
    height: 80,
  },
  navBar: {
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