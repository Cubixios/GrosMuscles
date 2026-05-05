import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, SafeAreaView, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSession, Exercise, Serie } from '../lib/SessionContext';

const PURPLE = '#b844c7';
const DARK_BG = '#0a0a0a';
const SURFACE_CONTAINER = '#141414';
const TEXT_PRIMARY = '#f9f9fd';
const TEXT_SECONDARY = '#a1a1a1';
const OUTLINE = '#333333';

const muscleGroups = ['Tous', 'Pecs', 'Dos', 'Jambes', 'Épaules', 'Bras', 'Abdos'];
const equipments = [
  { key: 'halteres', label: 'Haltères', icon: 'fitness-center', color: '#f481ff' },
  { key: 'barre', label: 'Barre', icon: 'straighten', color: '#fa93e4' },
  { key: 'machine', label: 'Machine', icon: 'settings', color: '#ff937b' },
  { key: 'body', label: 'Poids du corps', icon: 'accessibility-new', color: '#f481ff' },
];

const suggestedExercises = [
  {
    id: 'bench',
    name: 'Développé Couché',
    group: 'Pectoraux • Barre',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80',
    active: false,
    icon: 'fitness-center',
    series: [
      { id: '1', reps: 10, weight: '80 kg', restTime: 90 },
      { id: '2', reps: 10, weight: '80 kg', restTime: 90 },
      { id: '3', reps: 8, weight: '85 kg', restTime: 90 },
      { id: '4', reps: 6, weight: '90 kg', restTime: 120 },
    ],
  },
  {
    id: 'squat',
    name: 'Squat Arrière',
    group: 'Jambes • Barre',
    image: 'https://images.unsplash.com/photo-1558611848-73f7eb4001d0?auto=format&fit=crop&w=400&q=80',
    active: false,
    icon: 'straighten',
    series: [
      { id: '1', reps: 8, weight: '100 kg', restTime: 120 },
      { id: '2', reps: 8, weight: '100 kg', restTime: 120 },
      { id: '3', reps: 6, weight: '110 kg', restTime: 150 },
      { id: '4', reps: 4, weight: '120 kg', restTime: 180 },
    ],
  },
  {
    id: 'pullups',
    name: 'Tractions',
    group: 'Dos • Poids du corps',
    image: 'https://images.unsplash.com/photo-1517964603305-6ef132a6e2f9?auto=format&fit=crop&w=400&q=80',
    active: true,
    icon: 'accessibility-new',
    series: [
      { id: '1', reps: 8, weight: 'Corps', restTime: 90 },
      { id: '2', reps: 8, weight: 'Corps', restTime: 90 },
      { id: '3', reps: 6, weight: 'Corps', restTime: 120 },
    ],
  },
  {
    id: 'curls',
    name: 'Curl Haltères',
    group: 'Bras • Haltères',
    image: 'https://images.unsplash.com/photo-1558611848-73f7eb4001d0?auto=format&fit=crop&w=400&q=80',
    active: false,
    icon: 'fitness-center',
    series: [
      { id: '1', reps: 12, weight: '16 kg', restTime: 60 },
      { id: '2', reps: 12, weight: '16 kg', restTime: 60 },
      { id: '3', reps: 10, weight: '18 kg', restTime: 60 },
    ],
  },
];

export default function NouvelleSeance() {
  const router = useRouter();
  const { setCurrentSession } = useSession();
  const [sessionName, setSessionName] = useState('Nouvelle Séance');
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Tous');
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>(
    suggestedExercises.filter((exercise) => exercise.active).map((exercise) => exercise.id)
  );
  const [exercisesWithSeries, setExercisesWithSeries] = useState<Record<string, Serie[]>>({});
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [currentSeries, setCurrentSeries] = useState<Serie[]>([]);

  const selectedExercises = useMemo(
    () => suggestedExercises.filter((exercise) => selectedExerciseIds.includes(exercise.id)),
    [selectedExerciseIds]
  );

  const toggleExercise = (exerciseId: string) => {
    setSelectedExerciseIds((ids) =>
      ids.includes(exerciseId) ? ids.filter((id) => id !== exerciseId) : [...ids, exerciseId]
    );
  };

  const openSeriesEditor = (exerciseId: string) => {
    const exercise = suggestedExercises.find((e) => e.id === exerciseId);
    if (exercise) {
      setEditingExerciseId(exerciseId);
      setCurrentSeries(exercisesWithSeries[exerciseId] || exercise.series);
    }
  };

  const closeSeriesEditor = () => {
    setEditingExerciseId(null);
  };

  const saveSeriesEdits = () => {
    if (editingExerciseId) {
      setExercisesWithSeries((prev) => ({
        ...prev,
        [editingExerciseId]: currentSeries,
      }));
      closeSeriesEditor();
    }
  };

  const addSerie = () => {
    const newSerie: Serie = {
      id: Date.now().toString(),
      reps: 10,
      weight: '0 kg',
      restTime: 90,
    };
    setCurrentSeries([...currentSeries, newSerie]);
  };

  const removeSerie = (serieId: string) => {
    setCurrentSeries(currentSeries.filter((s) => s.id !== serieId));
  };

  const updateSerie = (serieId: string, field: keyof Serie, value: any) => {
    setCurrentSeries((series) =>
      series.map((s) => (s.id === serieId ? { ...s, [field]: value } : s))
    );
  };

  const validateSession = () => {
    if (selectedExercises.length === 0) {
      return Alert.alert('Aucun exercice', 'Sélectionne au moins un exercice pour lancer la séance.');
    }

    // Créer les exercices avec les séries
    const sessionExercises: Exercise[] = selectedExercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      group: exercise.group,
      image: exercise.image,
      icon: exercise.icon,
      series: exercisesWithSeries[exercise.id] || exercise.series,
    }));

    setCurrentSession({
      id: new Date().getTime().toString(),
      name: sessionName.trim() || 'Nouvelle Séance',
      exercises: sessionExercises,
      createdAt: new Date().toISOString(),
    });
    router.push('/seance-en-cours');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#f481ff" />
          </TouchableOpacity>
          <Text style={styles.title}>Nouvelle Séance</Text>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color="#f481ff" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Nom de la session</Text>
            <View style={styles.inputCard}>
              <TextInput
                value={sessionName}
                onChangeText={setSessionName}
                style={styles.sessionInput}
                placeholder="NOM DE LA SÉANCE"
                placeholderTextColor="rgba(244,129,255,0.3)"
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.searchWrapper}>
              <MaterialCommunityIcons name="magnify" size={20} color="#946888" style={styles.searchIcon} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Rechercher un exercice..."
                placeholderTextColor="rgba(255,219,242,0.5)"
                style={styles.searchInput}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Groupes Musculaires</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
              {muscleGroups.map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.pill,
                    selectedGroup === group ? styles.pillActive : styles.pillSecondary,
                  ]}
                  onPress={() => setSelectedGroup(group)}
                >
                  <Text style={[styles.pillText, selectedGroup === group && styles.pillTextActive]}>{group}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Matériel</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.equipmentRow}>
              {equipments.map((item) => (
                <View key={item.key} style={styles.equipmentCard}>
                  <MaterialCommunityIcons name={item.icon as any} size={18} color={item.color} />
                  <Text style={styles.equipmentLabel}>{item.label}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exercices suggérés</Text>
            {suggestedExercises.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseInfo}>
                  <View style={styles.exerciseThumb}>
                    <Image source={{ uri: exercise.image }} style={styles.exerciseImage} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseMeta}>{exercise.group}</Text>
                    <Text style={styles.exerciseSeriesCount}>
                      {exercisesWithSeries[exercise.id]?.length || exercise.series.length} séries
                    </Text>
                  </View>
                </View>
                <View style={styles.exerciseActions}>
                  {selectedExerciseIds.includes(exercise.id) && (
                    <TouchableOpacity
                      style={styles.editSeriesButton}
                      onPress={() => openSeriesEditor(exercise.id)}
                    >
                      <MaterialCommunityIcons name="pencil" size={16} color="#f481ff" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.exerciseButton,
                      selectedExerciseIds.includes(exercise.id)
                        ? styles.exerciseButtonActive
                        : styles.exerciseButtonInactive,
                    ]}
                    onPress={() => toggleExercise(exercise.id)}
                  >
                    <MaterialCommunityIcons
                      name={selectedExerciseIds.includes(exercise.id) ? 'check' : 'plus'}
                      size={20}
                      color={selectedExerciseIds.includes(exercise.id) ? '#fff' : '#f481ff'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Modal pour éditer les séries */}
        <Modal
          visible={editingExerciseId !== null}
          transparent
          animationType="slide"
          onRequestClose={closeSeriesEditor}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeSeriesEditor}>
                <Text style={styles.modalCloseText}>Annuler</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Séries</Text>
              <TouchableOpacity onPress={saveSeriesEdits}>
                <Text style={styles.modalSaveText}>Valider</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {currentSeries.map((serie, index) => (
                <View key={serie.id} style={styles.serieEditCard}>
                  <View style={styles.serieIndex}>
                    <Text style={styles.serieIndexText}>S{index + 1}</Text>
                  </View>
                  <View style={styles.serieInputs}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Reps</Text>
                      <TextInput
                        style={styles.serieInput}
                        value={serie.reps.toString()}
                        onChangeText={(text) => updateSerie(serie.id, 'reps', parseInt(text) || 0)}
                        keyboardType="numeric"
                        placeholder="10"
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Poids</Text>
                      <TextInput
                        style={styles.serieInput}
                        value={serie.weight}
                        onChangeText={(text) => updateSerie(serie.id, 'weight', text)}
                        placeholder="80 kg"
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Repos (s)</Text>
                      <TextInput
                        style={styles.serieInput}
                        value={serie.restTime.toString()}
                        onChangeText={(text) => updateSerie(serie.id, 'restTime', parseInt(text) || 0)}
                        keyboardType="numeric"
                        placeholder="90"
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.removeSerieButton}
                      onPress={() => removeSerie(serie.id)}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ff6b6b" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.addSerieButton} onPress={addSerie}>
                <MaterialCommunityIcons name="plus" size={20} color="#f481ff" />
                <Text style={styles.addSerieText}>Ajouter une série</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        <View style={styles.floatingBar}>
          <View>
            <Text style={styles.floatingLabel}>Sélection</Text>
            <Text style={styles.floatingCount}>{selectedExercises.length} exercices</Text>
          </View>
          <TouchableOpacity style={styles.validateButton} onPress={validateSession}>
            <Text style={styles.validateButtonText}>Valider la séance</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
            <MaterialCommunityIcons name="home-outline" size={24} color={TEXT_SECONDARY} />
            <Text style={styles.navText}>Accueil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/routines')}>
            <MaterialCommunityIcons name="dumbbell" size={24} color={PURPLE} />
            <Text style={[styles.navText, { color: PURPLE }]}>Routines</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/analyses')}>
            <MaterialCommunityIcons name="chart-bar" size={24} color={TEXT_SECONDARY} />
            <Text style={styles.navText}>Analyses</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
            <MaterialCommunityIcons name="account-outline" size={24} color={TEXT_SECONDARY} />
            <Text style={styles.navText}>Profil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#20031c',
  },
  container: {
    flex: 1,
    backgroundColor: '#20031c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244,129,255,0.08)',
  },
  title: {
    color: '#f481ff',
    fontSize: 18,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 180,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    color: '#cd9cbf',
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputCard: {
    backgroundColor: SURFACE_CONTAINER,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sessionInput: {
    fontSize: 34,
    fontWeight: '900',
    color: '#f481ff',
    textTransform: 'uppercase',
    paddingVertical: 4,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#30092b',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: TEXT_PRIMARY,
    fontSize: 15,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  pillsRow: {
    paddingVertical: 4,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    marginRight: 10,
  },
  pillActive: {
    backgroundColor: PURPLE,
  },
  pillSecondary: {
    backgroundColor: '#221226',
  },
  pillText: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pillTextActive: {
    color: '#1c0021',
  },
  equipmentRow: {
    paddingVertical: 4,
  },
  equipmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: SURFACE_CONTAINER,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  equipmentLabel: {
    color: '#f5e6f5',
    fontSize: 12,
    fontWeight: '600',
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SURFACE_CONTAINER,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 14,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  exerciseThumb: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#41133a',
    borderWidth: 1,
    borderColor: 'rgba(148,104,136,0.2)',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  exerciseName: {
    color: '#ffdbf2',
    fontSize: 15,
    fontWeight: '800',
  },
  exerciseMeta: {
    color: '#cd9cbf',
    fontSize: 10,
    letterSpacing: 0.6,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  exerciseSeriesCount: {
    color: '#f481ff',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editSeriesButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#30092b',
    borderWidth: 1,
    borderColor: '#f481ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseButtonActive: {
    backgroundColor: '#f481ff',
  },
  exerciseButtonInactive: {
    backgroundColor: '#30092b',
    borderWidth: 1,
    borderColor: '#f481ff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#20031c',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  modalTitle: {
    color: '#f481ff',
    fontSize: 18,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalCloseText: {
    color: '#cd9cbf',
    fontSize: 14,
    fontWeight: '700',
  },
  modalSaveText: {
    color: '#f481ff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  serieEditCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE_CONTAINER,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  serieIndex: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f481ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serieIndexText: {
    color: '#1c0021',
    fontWeight: '900',
    fontSize: 14,
  },
  serieInputs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    color: '#cd9cbf',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  serieInput: {
    backgroundColor: '#30092b',
    color: '#f481ff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(244,129,255,0.2)',
  },
  removeSerieButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,107,107,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  addSerieButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(244,129,255,0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#f481ff',
    marginTop: 10,
    marginBottom: 20,
  },
  addSerieText: {
    color: '#f481ff',
    fontSize: 14,
    fontWeight: '700',
  },
  floatingBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 96,
    backgroundColor: SURFACE_CONTAINER,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  floatingLabel: {
    color: '#f481ff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  floatingCount: {
    color: '#ffdbf2',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  validateButton: {
    backgroundColor: '#f481ff',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  validateButtonText: {
    color: '#1c0021',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
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
    gap: 4,
  },
  navText: {
    color: '#7c7c7c',
    fontSize: 10,
  },
  navTextActive: {
    color: '#f481ff',
    fontSize: 10,
    fontWeight: '700',
  },
});
