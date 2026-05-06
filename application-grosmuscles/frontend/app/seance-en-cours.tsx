import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSession, Serie } from '../lib/SessionContext';
import { useAuth } from '../lib/AuthContext';
import { validerSeanceAPI } from '../services/api';

const PURPLE = '#b844c7';
const DARK_BG = '#0a0a0a';
const SURFACE_CONTAINER = '#141414';
const TEXT_PRIMARY = '#f9f9fd';
const TEXT_SECONDARY = '#a1a1a1';
const GREEN_VALID = '#4CAF50';

export default function SeanceEnCours() {
  const router = useRouter();
  const { currentSession, setCurrentSession, clearSession } = useSession();
  const { userId } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false); // Ajout de l'état de chargement pour la finalisation
  const [activeRestTimer, setActiveRestTimer] = useState<{ serieId: string; timeLeft: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
    // On ne veut démarrer le chrono et initialiser l'index que lorsqu'une NOUVELLE session est chargée.
    if (currentSession) {
      setIsRunning(true);
    }
  }, [currentSession?.id]); // Dépendre de l'ID de la session, pas de l'objet entier.

  // Logique pour le décompte du temps de repos
  useEffect(() => {
    if (activeRestTimer && activeRestTimer.timeLeft > 0) {
      const timer = setInterval(() => {
        setActiveRestTimer(prev => {
          if (prev && prev.timeLeft > 1) {
            return { ...prev, timeLeft: prev.timeLeft - 1 };
          }
          clearInterval(timer);
          return null; // Le temps de repos est terminé
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeRestTimer]);

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
      exercise.series.forEach((serie) => {
        totalSeconds += serie.reps * 3 + serie.restTime;
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

  const handleFinish = async () => {
    if (isFinishing) return; // Empêcher les clics multiples pendant le chargement
    setIsFinishing(true);
    setIsRunning(false);

    if (!currentSession || !userId) {
      Alert.alert("Erreur", "Impossible de terminer la séance, données de session ou utilisateur manquantes.");
      setIsFinishing(false);
      return;
    }

    // Pour le MVP, on utilise une valeur de fatigue fixe.
    // Dans une V2, on pourrait afficher une modale pour que l'utilisateur la saisisse.
    const note_fatigue = 7; // Note de fatigue arbitraire (RPE)

    const exercisesData = currentSession.exercises.map(ex => ({
      ...ex,
      // On ne garde que les séries complétées et on s'assure que les reps sont des nombres
      series: ex.series
        .filter(s => s.isCompleted)
        .map(s => ({
          ...s,
          reps: typeof s.reps === 'string' ? parseInt(s.reps, 10) || 0 : s.reps,
        })),
    }));

    const donneesSeance = {
      id_user: parseInt(userId, 10),
      nom_seance: currentSession.name,
      duree_totale: Math.round(elapsedSeconds / 60), // L'API attend des minutes
      note_fatigue: note_fatigue,
      exercises: exercisesData,
    };

    try {
      console.log("Tentative d'enregistrement de la séance...");
      const reponse = await validerSeanceAPI(donneesSeance);

      // On vérifie que la réponse est valide AVANT de l'utiliser
      // Le bouton affiche "Séance enregistrée...", on attend un peu pour que l'utilisateur le voie, puis on redirige.
      console.log("Séance enregistrée avec succès, redirection en cours...");
      setTimeout(() => {
        clearSession();
        router.push('/');
      }, 1500); // Laisse 1.5s pour voir le message sur le bouton

    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la séance:", error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
      // On propose à l'utilisateur de réessayer, sans perdre sa progression
      Alert.alert("Erreur de sauvegarde", `La connexion avec le serveur a échoué : ${errorMessage}. Voulez-vous réessayer ?`, [
        { text: "Annuler", style: "cancel", onPress: () => setIsRunning(true) }, // On peut relancer le chrono si on annule
        { text: "Réessayer", onPress: () => handleFinish() } // On relance la même fonction
      ]);
      setIsFinishing(false); // On réinitialise seulement en cas d'erreur
    }
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

  const handleToggleSerieCompletion = (serieId: string) => {
    if (!currentSession) return;

    let targetSerie: Serie | undefined;

    const updatedExercises = currentSession.exercises.map((exercise, index) => {
      if (index !== currentIndex) return exercise;
      const updatedSeries = exercise.series.map((serie) => {
        if (serie.id === serieId) {
          const newSerieState = !serie.isCompleted;
          if (newSerieState) { // Si on vient de cocher la case
            targetSerie = serie;
          }
          return { ...serie, isCompleted: newSerieState };
        }
        return serie;
      });
      return { ...exercise, series: updatedSeries };
    });

    setCurrentSession({ ...currentSession, exercises: updatedExercises });

    if (targetSerie) {
      setActiveRestTimer({ serieId: targetSerie.id, timeLeft: targetSerie.restTime });
    } else if (activeRestTimer?.serieId === serieId) {
      setActiveRestTimer(null); // Si on décoche, on arrête le timer
    }
  };

  const handleSerieUpdate = (serieId: string, field: keyof Serie, value: string) => {
    if (!currentSession) return;

    const updatedExercises = currentSession.exercises.map((exercise, index) => {
      if (index !== currentIndex) return exercise;
      const updatedSeries = exercise.series.map((serie) => {
        if (serie.id === serieId) {
          const updatedValue = (field === 'reps' || field === 'restTime') ? (parseInt(value, 10) || 0) : value;
          return { ...serie, [field]: updatedValue };
        }
        return serie;
      });
      return { ...exercise, series: updatedSeries };
    });

    setCurrentSession({ ...currentSession, exercises: updatedExercises });
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
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/routines' as any)}>
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
            {currentExercise.series.map((serie, index) => (
              <View key={serie.id} style={[styles.serieCard, serie.isCompleted && styles.serieCardCompleted]}>
                <TouchableOpacity
                  style={styles.completionButton}
                  onPress={() => handleToggleSerieCompletion(serie.id)}
                >
                  <MaterialCommunityIcons
                    name={serie.isCompleted ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                    size={28}
                    color={serie.isCompleted ? GREEN_VALID : PURPLE}
                  />
                </TouchableOpacity>

                <View style={styles.serieContent}>
                  <View style={styles.serieBadge}>
                    <Text style={styles.serieBadgeText}>S{index + 1}</Text>
                  </View>
                  <View style={styles.serieInputs}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Reps</Text>
                      <TextInput
                        style={styles.serieInput}
                        value={serie.reps.toString()}
                        onChangeText={(text) => handleSerieUpdate(serie.id, 'reps', text)}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Poids</Text>
                      <TextInput
                        style={styles.serieInput}
                        value={serie.weight.toString()}
                        onChangeText={(text) => handleSerieUpdate(serie.id, 'weight', text)}
                        placeholder="0 kg"
                      />
                    </View>
                  </View>
                  {activeRestTimer && activeRestTimer.serieId === serie.id ? (
                    <View style={[styles.restTimeBadge, styles.restTimeBadgeActive]}>
                      <ActivityIndicator size="small" color={PURPLE} />
                      <Text style={[styles.restTimeText, styles.restTimeTextActive]}>{activeRestTimer.timeLeft}s</Text>
                    </View>
                  ) : (
                    <View style={styles.restTimeBadge}>
                      <MaterialCommunityIcons name="timer" size={14} color="#ffdbf2" />
                      <Text style={styles.restTimeText}>{serie.restTime}s</Text>
                    </View>
                  )}
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

          <TouchableOpacity
            style={[styles.finishButton, isFinishing && styles.actionButtonDisabled]}
            onPress={handleFinish}
            disabled={isFinishing}
          >
            <Text style={styles.finishText}>
              {isFinishing ? "SÉANCE ENREGISTRÉE..." : "TERMINER LA SÉANCE"}
            </Text>
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
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serieCardCompleted: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  completionButton: {
    padding: 4,
  },
  serieContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    fontWeight: '700',
    fontSize: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  serieInput: {
    backgroundColor: '#30092b',
    color: '#f481ff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(244,129,255,0.2)',
    textAlign: 'center',
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
  restTimeBadgeActive: {
    backgroundColor: '#f481ff',
    borderColor: '#f481ff',
    borderWidth: 1,
  },
  restTimeTextActive: {
    color: '#1c0021',
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
    letterSpacing: 1,
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
