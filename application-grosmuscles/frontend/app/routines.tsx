import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSession } from './_lib/SessionContext';

const PURPLE = '#b844c7';
const DARK_BG = '#0a0a0a';
const SURFACE = '#111111';
const SURFACE_CONTAINER = '#141414';
const TEXT_PRIMARY = '#f9f9fd';
const TEXT_SECONDARY = '#a1a1a1';
const OUTLINE = '#333333';

export default function Routines() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [routines, setRoutines] = useState([
    {
      id: 1,
      name: 'Puissance Haut du Corps',
      exercises: 8,
      duration: '75',
      type: 'force',
    },
    {
      id: 2,
      name: 'Séance Jambes Lourde',
      exercises: 6,
      duration: 'Hypertrophie',
      type: 'hypertrophie',
    },
    {
      id: 3,
      name: 'Gainage & Stabilité',
      exercises: 4,
      duration: '15',
      type: 'recovery',
    },
  ]);

  const { setCurrentSession } = useSession();

  const handleCreateRoutine = () => {
    router.push('/nouvelle-seance');
  };

  const handleStartRoutine = (routine: any) => {
    const standardExercisesData = [
      {
        id: 'bench-press',
        name: 'Développé Couché',
        group: 'Pecs • Barre',
        sets: 4,
        reps: 8,
        weight: '80 kg',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
        icon: 'dumbbell',
      },
      {
        id: 'squat',
        name: 'Squat Arrière',
        group: 'Jambes • Barre',
        sets: 4,
        reps: 8,
        weight: '100 kg',
        image: 'https://images.unsplash.com/photo-1558611848-73f7eb4001d0?auto=format&fit=crop&w=400&q=80',
        icon: 'dumbbell',
      },
      {
        id: 'pullups',
        name: 'Tractions',
        group: 'Dos • Poids du corps',
        sets: 3,
        reps: 8,
        weight: 'Corps',
        image: 'https://images.unsplash.com/photo-1517964603305-6ef132a6e2f9?auto=format&fit=crop&w=400&q=80',
        icon: 'body',
      },
    ];

    const standardExercises = standardExercisesData.map(ex => ({
      id: ex.id,
      name: ex.name,
      group: ex.group,
      image: ex.image,
      icon: ex.icon,
      series: Array.from({ length: ex.sets }, (_, i) => ({
        id: `${ex.id}-set-${i + 1}`,
        reps: ex.reps,
        weight: ex.weight,
        restTime: 90, // default rest time
      })),
    }));

    setCurrentSession({
      name: routine.name,
      exercises: standardExercises,
      createdAt: new Date().toISOString(),
    });

    router.push('/seance-en-cours');
  };

  const handleEditRoutine = (routine: any) => {
    Alert.alert('Modifier', `Modification de: ${routine.name}`);
  };

  const handleMoreOptions = (routine: any) => {
    Alert.alert(
      'Options',
      `Options pour: ${routine.name}`,
      [
        { text: 'Dupliquer', onPress: () => Alert.alert('Routine dupliquée') },
        { text: 'Supprimer', onPress: () => Alert.alert('Routine supprimée') },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv67-s0wS1MTsQALx1FfxIcS3Uehk2KmbaZAyTCYtY-zbok1nFlxJTeKe3F-kc2txnhVSmOt1ZHHbS7WJW1sYflFadkrqOwZvwHjwiSwnSlNrccyVoGpHqV5aamgmZyix6Eur6Yk0HRzd5brAFGEOCzs5xsT6G3qF7WOritQXPeDt76A8gcOYzcAwVgGAoPLVJgU5KvpDjss-TC0CkV2YqUTde1Ti--Vr9HWBr3GhVIetCjoljIfOzn0cmnKPZr-HtcojTvS8qBkOI' }}
            style={styles.profileImage}
          />
          <Text style={styles.headerTitle}>GROS MUSCLE</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity>
            <MaterialCommunityIcons name="bell-outline" size={24} color={TEXT_SECONDARY} />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialCommunityIcons name="magnify" size={24} color={TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Editorial Header */}
        <View style={styles.editorialHeader}>
          <Text style={styles.label}>PERFORMANCE</Text>
          <Text style={styles.title}>
            MES <Text style={styles.titleHighlight}>ROUTINES</Text>
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateRoutine}
          >
            <MaterialCommunityIcons name="plus" size={18} color="white" />
            <Text style={styles.createButtonText}>Créer</Text>
          </TouchableOpacity>
        </View>

        {/* AI Insight Chip */}
        <View style={styles.aiChip}>
          <View style={styles.aiChipContent}>
            <MaterialCommunityIcons
              name="thermometer-lines"
              size={20}
              color={PURPLE}
            />
            <Text style={styles.aiChipText}>
              Récupération optimale : +12%. Prêt pour une série intense ?
            </Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.aiChipButton}>DÉTAILS</Text>
          </TouchableOpacity>
        </View>

        {/* Routines List */}
        <View style={styles.routinesList}>
          {routines.map((routine) => (
            <View key={routine.id} style={styles.routineCard}>
              <View style={styles.routineHeader}>
                <View style={styles.routineInfo}>
                  <Text style={styles.routineName}>{routine.name}</Text>
                  <View style={styles.routineTags}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>
                        {routine.exercises} Exos
                      </Text>
                    </View>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>
                        {routine.duration}{routine.duration === 'Hypertrophie' ? '' : ' Min'}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleMoreOptions(routine)}>
                  <MaterialCommunityIcons
                    name="dots-vertical"
                    size={24}
                    color={TEXT_SECONDARY}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.routineActions}>
                <TouchableOpacity
                  style={styles.launchButton}
                  onPress={() => handleStartRoutine(routine)}
                >
                  <Text style={styles.launchButtonText}>Lancer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editButton}>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color={TEXT_PRIMARY}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/accueil')}>
          <MaterialCommunityIcons name="home-outline" size={24} color={TEXT_SECONDARY} />
          <Text style={styles.navLabel}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons
            name="dumbbell"
            size={24}
            color={PURPLE}
            solid={true}
          />
          <Text style={[styles.navLabel, { color: PURPLE }]}>Routines</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/analyses')}>
          <MaterialCommunityIcons name="chart-bar" size={24} color={TEXT_SECONDARY} />
          <Text style={styles.navLabel}>Analyses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <MaterialCommunityIcons name="account-outline" size={24} color={TEXT_SECONDARY} />
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateRoutine}
      >
        <MaterialCommunityIcons name="plus" size={28} color="white" />
      </TouchableOpacity>
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
    gap: 12,
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
    textShadowColor: 'rgba(184, 68, 199, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  aiChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: SURFACE_CONTAINER,
    borderWidth: 1,
    borderColor: 'rgba(184, 68, 199, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    gap: 12,
  },
  aiChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  aiChipText: {
    fontSize: 12,
    color: 'rgba(249, 249, 253, 0.7)',
    lineHeight: 16,
    flex: 1,
  },
  aiChipButton: {
    fontSize: 10,
    fontWeight: 'bold',
    color: PURPLE,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  routinesList: {
    gap: 16,
    marginBottom: 16,
  },
  routineCard: {
    backgroundColor: SURFACE_CONTAINER,
    borderWidth: 1,
    borderColor: OUTLINE,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  routineTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(0, 0, 0, 1)',
    borderWidth: 1,
    borderColor: OUTLINE,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: TEXT_SECONDARY,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  routineActions: {
    flexDirection: 'row',
    gap: 12,
  },
  launchButton: {
    flex: 3,
    backgroundColor: PURPLE,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  launchButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  editButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: OUTLINE,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    height: 80,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(77, 77, 77, 0.2)',
    paddingBottom: 12,
    paddingTop: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  navLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: TEXT_SECONDARY,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
