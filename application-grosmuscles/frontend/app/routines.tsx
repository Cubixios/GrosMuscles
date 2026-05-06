import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNavBar from '../app/BottomNavBar';
import { useSession } from '../lib/SessionContext';

// Définition des types pour une meilleure structure
interface Serie {
  id: string;
  reps: number | string;
  weight: number | string;
  restTime: number;
  isCompleted: boolean;
}

interface Exercise {
  id: string;
  name: string;
  group: string;
  image: string;
  series: Serie[];
}

interface Routine {
  id: string;
  name: string;
  days: string;
  exercisesCount: number;
  icon: string;
  exercises: Exercise[];
}

// Données factices pour l'exemple, maintenant avec les détails des exercices
const fakeRoutines: Routine[] = [
  {
    id: '1',
    name: 'Full Body - Force',
    days: 'Lundi, Jeudi',
    exercisesCount: 2,
    icon: 'rocket-launch',
    exercises: [
      {
        id: 'exo_1',
        name: 'Développé Couché',
        group: 'Pectoraux, Épaules, Triceps',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop',
        series: [
          { id: 's1', reps: 5, weight: '80', restTime: 120, isCompleted: false },
          { id: 's2', reps: 5, weight: '80', restTime: 120, isCompleted: false },
          { id: 's3', reps: 5, weight: '80', restTime: 120, isCompleted: false },
        ],
      },
      {
        id: 'exo_2',
        name: 'Squat',
        group: 'Quadriceps, Fessiers, Ischios',
        image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2069&auto=format&fit=crop',
        series: [
          { id: 's4', reps: 5, weight: '100', restTime: 150, isCompleted: false },
          { id: 's5', reps: 5, weight: '100', restTime: 150, isCompleted: false },
          { id: 's6', reps: 5, weight: '100', restTime: 150, isCompleted: false },
        ],
      },
    ],
  },
  { id: '2', name: 'Push-Pull-Legs', days: 'Mardi, Mercredi, Vendredi', exercisesCount: 12, icon: 'weight-lifter', exercises: [] },
  { id: '3', name: 'Cardio & Core', days: 'Samedi', exercisesCount: 5, icon: 'run-fast', exercises: [] },
  { id: '4', name: 'Haut du corps - Hypertrophie', days: 'Mardi, Vendredi', exercisesCount: 10, icon: 'arm-flex', exercises: [] },
];

const PURPLE = '#b844c7';
const DARK_BG = '#0a0a0a';
const SURFACE_CONTAINER = '#141414';
const TEXT_PRIMARY = '#f9f9fd';
const TEXT_SECONDARY = '#a1a1a1';

export default function Routines() {
  const router = useRouter();
  const { setCurrentSession } = useSession();

  const handleStartRoutine = (routine: Routine) => {
    if (routine.exercises.length === 0) {
      // Pour l'exemple, on ne démarre que les routines qui ont des exercices définis
      alert("Cette routine n'a pas encore d'exercices définis.");
      return;
    }

    // Crée une nouvelle session avec des IDs uniques pour éviter les conflits d'état
    const newSession = {
      id: `session_${Date.now()}`,
      name: routine.name,
      exercises: routine.exercises.map(exo => ({
        ...exo,
        series: exo.series.map(serie => ({
          ...serie,
          id: `serie_${Math.random().toString(36).substring(7)}`,
          isCompleted: false,
        }))
      }))
    };

    setCurrentSession(newSession);
    router.push('/seance-en-cours');
  };

  const handleNewBlankSession = () => {
    const blankSession = {
      id: `session_${Date.now()}`,
      name: 'Séance Libre',
      exercises: [
        {
          id: `exo_${Date.now()}`,
          name: 'Nouvel Exercice',
          group: 'À définir',
          image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2069&auto=format&fit=crop',
          series: [
            { id: `serie_${Math.random().toString(36).substring(7)}`, reps: 10, weight: '0', restTime: 60, isCompleted: false },
            { id: `serie_${Math.random().toString(36).substring(7)}`, reps: 10, weight: '0', restTime: 60, isCompleted: false },
            { id: `serie_${Math.random().toString(36).substring(7)}`, reps: 10, weight: '0', restTime: 60, isCompleted: false },
          ]
        }
      ]
    };
    setCurrentSession(blankSession);
    router.push('/seance-en-cours');
  };

  const renderItem = ({ item }: { item: Routine }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleStartRoutine(item)}>
      <View style={styles.cardIcon}>
        <MaterialCommunityIcons name={item.icon as any} size={24} color={PURPLE} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.days}</Text>
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.cardExercises}>{item.exercisesCount} exos</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color={TEXT_SECONDARY} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mes Routines</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleNewBlankSession}>
            <MaterialCommunityIcons name="plus" size={20} color={PURPLE} />
            <Text style={styles.addButtonText}>Nouvelle</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={fakeRoutines}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucune routine trouvée.</Text>
            </View>
          )}
        />
        <BottomNavBar activeScreen="routines" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: DARK_BG },
  container: { flex: 1, },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(184,68,199,0.15)',
  },
  headerTitle: { color: TEXT_PRIMARY, fontSize: 22, fontWeight: 'bold' },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(184,68,199,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6 },
  addButtonText: { color: PURPLE, fontWeight: 'bold' },
  listContent: { padding: 16 },
  card: {
    backgroundColor: SURFACE_CONTAINER,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  cardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(184,68,199,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardContent: { flex: 1 },
  cardTitle: { color: TEXT_PRIMARY, fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { color: TEXT_SECONDARY, fontSize: 12, marginTop: 4 },
  cardDetails: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardExercises: { color: TEXT_SECONDARY, fontSize: 12, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
  emptyText: { color: TEXT_SECONDARY, fontSize: 16 },
});