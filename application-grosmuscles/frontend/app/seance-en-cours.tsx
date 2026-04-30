import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSession } from './_lib/SessionContext';

const PURPLE = '#b844c7';
const DARK_BG = '#0a0a0a';
const SURFACE_CONTAINER = '#141414';
const TEXT_PRIMARY = '#f9f9fd';
const TEXT_SECONDARY = '#a1a1a1';

export default function SeanceEnCours() {
  const router = useRouter();
  const { currentSession, clearSession } = useSession();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const exercises = currentSession?.exercises ?? [];

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsRunning(true);
  }, [currentSession]);

  const currentExercise = exercises[currentIndex];

  // Formater le temps en HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Calculer le temps estimé total
  const calculateTotalEstimatedTime = () => {
    let totalSeconds = 0;
    exercises.forEach((exercise) => {
      exercise.series?.forEach((serie) => {
        totalSeconds += (serie.reps || 0) * 3 + (serie.restTime || 0);
      });
    });
    return totalSeconds;
  };

  const totalEstimatedSeconds = calculateTotalEstimatedTime();

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleFinish = () => {
    setIsRunning(false);
    clearSession();
    router.push('/accueil');
  };

  const generateAIAdvice = () => {
    if (elapsedSeconds < 60) {
      return '🔥 C\'est parti ! Garde le rythme !';
    } else if (elapsedSeconds < totalEstimatedSeconds * 0.5) {
      return '💪 Excellent rythme ! Continue comme ça !';
    } else if (elapsedSeconds < totalEstimatedSeconds * 0.8) {
      return '⚡ Tu approches de la fin ! Dernière ligne droite !';
    } else {
      return '✅ Presque terminé ! Super session !';
    }
  };

  if (!currentSession || exercises.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Aucune séance active</Text>
            <Text style={styles.emptyDescription}>
              Crée une séance dans l'onglet Routines ou Nouvelle Séance pour commencer.
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/routines')}>
              <Text style={styles.emptyButtonText}>Voir mes routines</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#f481ff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Séance en cours</Text>
            <Text style={styles.headerSubtitle}>{currentSession?.name}</Text>
          </View>
          <TouchableOpacity onPress={() => setIsRunning(!isRunning)} style={styles.timerToggle}>
            <MaterialCommunityIcons 
              name={isRunning ? 'pause' : 'play'} 
              size={20} 
              color="#f481ff" 
            />
          </TouchableOpacity>
        </View>

        {/* Timer Bar */}
        <View style={styles.timerBar}>
          <View style={styles.timerContent}>
            <View style={styles.timerBlock}>
              <Text style={styles.timerLabel}>Temps écoulé</Text>
              <Text style={styles.timerValue}>{formatTime(elapsedSeconds)}</Text>
            </View>
            <View style={styles.timerDivider} />
            <View style={styles.timerBlock}>
              <Text style={styles.timerLabel}>Estimé</Text>
              <Text style={styles.timerValue}>{formatTime(totalEstimatedSeconds)}</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* AI Coaching Card */}
          <View style={styles.coachingCard}>
            <View style={styles.coachingIcon}>
              <MaterialCommunityIcons name="brain" size={24} color="#f481ff" />
            </View>
            <Text style={styles.coachingText}>{generateAIAdvice()}</Text>
          </View>

          {/* Current Exercise Card */}
          <View style={styles.exerciseCard}>
            <Image source={{ uri: currentExercise.image }} style={styles.exerciseImage} />
            <View style={styles.exerciseBody}>
              <Text style={styles.exerciseLabel}>Exercice actuel</Text>
              <Text style={styles.exerciseName}>{currentExercise.name}</Text>
              <Text style={styles.exerciseGroup}>{currentExercise.group}</Text>
            </View>
          </View>

          {/* Series List */}
          <View style={styles.seriesSection}>
            <Text style={styles.seriesSectionTitle}>Séries de cet exercice</Text>
            {currentExercise?.series?.map((serie, index) => (
              <View key={serie.id} style={styles.serieCard}>
                <View style={styles.serieHeader}>
                  <View style={styles.serieBadge}>
                    <Text style={styles.serieBadgeText}>S{index + 1}</Text>
                  </View>
                  <View style={styles.serieInfo}>
                    <Text style={styles.serieDetail}>
                      <Text style={styles.serieLabel}>Reps:</Text> {serie.reps || 0}
                    </Text>
                    <Text style={styles.serieDetail}>
                      <Text style={styles.serieLabel}>Poids:</Text> {serie.weight}
                    </Text>
                  </View>
                  <View style={styles.restTimeBadge}>
                    <MaterialCommunityIcons name="timer" size={14} color="#ffdbf2" />
                    <Text style={styles.restTimeText}>{serie.restTime}s</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Progress */}
          <View style={styles.progressCard}>
            <Text style={styles.progressLabel}>Progression</Text>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>{currentIndex + 1} / {exercises.length}</Text>
              <Text style={styles.progressHint}>
                {exercises.length - currentIndex - 1} exercices restants
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${((currentIndex + 1) / exercises.length) * 100}%` }
                ]} 
              />
            </View>
          </View>

          {/* Exercise List */}
          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Liste des exercices</Text>
            {exercises.map((exercise, index) => (
              <View key={exercise.id} style={[styles.listItem, index === currentIndex && styles.listItemActive]}>
                <View>
                  <Text style={[styles.listName, index === currentIndex && styles.listNameActive]}>
                    {exercise.name}
                  </Text>
                  <Text style={styles.listGroup}>{exercise.group}</Text>
                  <Text style={styles.listSeriesCount}>{exercise.series.length} séries</Text>
                </View>
                <Text style={styles.listStep}>{index + 1}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionButton, currentIndex === 0 && styles.actionButtonDisabled]}
            disabled={currentIndex === 0}
            onPress={handlePrevious}
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color={currentIndex === 0 ? '#7c7c7c' : '#f481ff'} />
            <Text style={[styles.actionText, currentIndex === 0 && styles.actionTextDisabled]}>Précédent</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishText}>Terminer la séance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, currentIndex === exercises.length - 1 && styles.actionButtonDisabled]}
            disabled={currentIndex === exercises.length - 1}
            onPress={handleNext}
          >
            <Text style={[styles.actionText, currentIndex === exercises.length - 1 && styles.actionTextDisabled]}>
              Suivant
            </Text>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={22} 
              color={currentIndex === exercises.length - 1 ? '#7c7c7c' : '#f481ff'} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/accueil')}>
            <MaterialCommunityIcons name="home-outline" size={24} color={TEXT_SECONDARY} />
            <Text style={styles.navText}>Accueil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/routines')}>
            <MaterialCommunityIcons name="dumbbell" size={24} color={TEXT_SECONDARY} />
            <Text style={styles.navText}>Routines</Text>
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
    backgroundColor: DARK_BG,
  },
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(77, 77, 77, 0.2)',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(244,129,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerToggle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(244,129,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f481ff',
  },
  timerBar: {
    backgroundColor: 'rgba(244,129,255,0.08)',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244,129,255,0.1)',
  },
  timerContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  timerBlock: {
    alignItems: 'center',
    flex: 1,
  },
  timerLabel: {
    color: '#cd9cbf',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timerValue: {
    color: '#f481ff',
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  timerDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(244,129,255,0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  coachingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244,129,255,0.1)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(244,129,255,0.2)',
  },
  coachingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(244,129,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  coachingText: {
    color: TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  exerciseCard: {
    backgroundColor: SURFACE_CONTAINER,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 20,
  },
  exerciseImage: {
    width: '100%',
    height: 160,
  },
  exerciseBody: {
    padding: 16,
  },
  exerciseLabel: {
    color: '#cd9cbf',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  exerciseName: {
    color: TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  exerciseGroup: {
    color: TEXT_SECONDARY,
    fontSize: 11,
  },
  seriesSection: {
    marginBottom: 20,
  },
  seriesSectionTitle: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  serieCard: {
    backgroundColor: SURFACE_CONTAINER,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(244,129,255,0.1)',
  },
  serieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serieBadge: {
    backgroundColor: '#f481ff',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serieBadgeText: {
    color: '#1c0021',
    fontWeight: '900',
    fontSize: 12,
  },
  serieInfo: {
    flex: 1,
  },
  serieDetail: {
    color: TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  serieLabel: {
    color: '#cd9cbf',
    fontWeight: '700',
  },
  restTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(244,129,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  restTimeText: {
    color: '#ffdbf2',
    fontSize: 11,
    fontWeight: '700',
  },
  progressCard: {
    backgroundColor: SURFACE_CONTAINER,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  progressLabel: {
    color: '#cd9cbf',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
  },
  progressHint: {
    color: TEXT_SECONDARY,
    fontSize: 12,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(244,129,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#f481ff',
    borderRadius: 3,
  },
  listSection: {
    marginBottom: 20,
  },
  listTitle: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1f0d24',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  listItemActive: {
    borderWidth: 1,
    borderColor: PURPLE,
  },
  listName: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '700',
  },
  listNameActive: {
    color: PURPLE,
  },
  listGroup: {
    color: TEXT_SECONDARY,
    fontSize: 10,
    marginTop: 4,
  },
  listSeriesCount: {
    color: '#f481ff',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  listStep: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: '#221226',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PURPLE,
    backgroundColor: 'rgba(244,129,255,0.08)',
  },
  actionButtonDisabled: {
    borderColor: '#3a2a3f',
    backgroundColor: '#1b101d',
  },
  actionText: {
    color: PURPLE,
    fontSize: 12,
    fontWeight: '700',
  },
  actionTextDisabled: {
    color: '#7c7c7c',
  },
  finishButton: {
    backgroundColor: PURPLE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    flex: 1,
    alignItems: 'center',
  },
  finishText: {
    color: '#1c0021',
    fontWeight: '800',
    fontSize: 12,
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
    gap: 4,
  },
  navText: {
    color: TEXT_SECONDARY,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  emptyDescription: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: PURPLE,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#1c0021',
    fontWeight: '800',
    fontSize: 14,
  },
});
