import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { calibrerProfilAPI } from '../services/api';

export default function Calibration() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rawUserId = params.idUser ?? params.id_user ?? params.user_id;
  const userId = Array.isArray(rawUserId) ? String(rawUserId[0]) : rawUserId ? String(rawUserId) : '';

  useEffect(() => {
    if (!userId) {
      Alert.alert("Erreur", "ID utilisateur manquant. Veuillez vous inscrire d'abord.");
      router.replace('/inscription');
    }
  }, [userId, router]);

  // Si pas d'userId, ne rien afficher
  if (!userId || userId === '') {
    return <View style={styles.container} />;
  }

  const [poids, setPoids] = useState('');
  const [taille, setTaille] = useState('');
  const [age, setAge] = useState('');
  const [sexe, setSexe] = useState('');
  const [sportPratique, setSportPratique] = useState('');
  const [environnement, setEnvironnement] = useState('');
  const [objectif, setObjectif] = useState('Hypertrophie');

  const validerCalibration = async () => {
    console.log('userId:', userId);
    if (!poids || !taille || !age || !sexe || !sportPratique || !environnement || !objectif) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    try {
      await calibrerProfilAPI(userId, {
        poids: parseFloat(poids),
        taille: parseInt(taille),
        age: parseInt(age),
        sexe,
        sport_pratique: sportPratique,
        environnement,
        objectif,
      });

      Alert.alert("Succès", "Calibration terminée !");
      router.replace(`/accueil?idUser=${encodeURIComponent(userId)}`); // Aller à la page d'accueil avec l'idUser
    } catch (error) {
      console.error('Erreur lors de la calibration:', error);
      Alert.alert("Erreur", "Impossible de sauvegarder la calibration.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>👤</Text>
          </View>
          <Text style={styles.logoText}>Gros Muscle</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.phaseIndicator}>
            <View style={styles.phaseLine} />
            <Text style={styles.phaseText}>Phase 01 : Calibration</Text>
          </View>
          <Text style={styles.title}>
            Construisez votre <Text style={styles.titleHighlight}>Moteur</Text>
          </Text>
          <Text style={styles.subtitle}>
            Pour générer votre protocole d&apos;entraînement optimisé par IA, nous devons calibrer votre base biométrique. La précision mène à la performance.
          </Text>
        </View>

        {/* Biometric Grid */}
        <View style={styles.biometricGrid}>
          {/* Weight */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricIcon}>⚖️</Text>
              <Text style={styles.metricLabel}>Poids</Text>
            </View>
            <View style={styles.metricInput}>
              <TextInput
                style={styles.metricValue}
                placeholder="00"
                keyboardType="numeric"
                value={poids}
                onChangeText={setPoids}
              />
              <Text style={styles.metricUnit}>KG</Text>
            </View>
          </View>

          {/* Height */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricIcon}>📏</Text>
              <Text style={styles.metricLabel}>Taille</Text>
            </View>
            <View style={styles.metricInput}>
              <TextInput
                style={styles.metricValue}
                placeholder="000"
                keyboardType="numeric"
                value={taille}
                onChangeText={setTaille}
              />
              <Text style={styles.metricUnit}>CM</Text>
            </View>
          </View>

          {/* Age */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricIcon}>📅</Text>
              <Text style={styles.metricLabel}>Âge</Text>
            </View>
            <View style={styles.metricInput}>
              <TextInput
                style={styles.metricValue}
                placeholder="25"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
              <Text style={styles.metricUnit}>ANS</Text>
            </View>
          </View>
        </View>

        {/* Gender and Sport */}
        <View style={styles.secondaryGrid}>
          {/* Gender */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Sexe</Text>
            <View style={styles.genderOptions}>
              {['Homme', 'Femme', 'Autre'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.genderOption, sexe === option && styles.genderSelected]}
                  onPress={() => setSexe(option)}
                >
                  <Text style={[styles.genderText, sexe === option && styles.genderTextSelected]}>
                    {option.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sport */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Sport pratiqué</Text>
            <View style={styles.sportInput}>
              <Text style={styles.sportIcon}>🏃</Text>
              <TextInput
                style={styles.sportField}
                placeholder="Ex: Crossfit, Musculation..."
                value={sportPratique}
                onChangeText={setSportPratique}
              />
            </View>
          </View>

          {/* Environnement Field */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Environnement d'entraînement</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={environnement}
                onValueChange={(itemValue) => setEnvironnement(itemValue)}
                style={styles.picker}
                dropdownIconColor="#7c627e"
              >
                <Picker.Item label="Sélectionnez un environnement" value="" />
                <Picker.Item label="Salle de sport" value="salle de sport" />
                <Picker.Item label="À la maison" value="à la maison" />
                <Picker.Item label="Haltères uniquement" value="Haltères uniquement" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Goals */}
        <View style={styles.goalsSection}>
          <View style={styles.goalsHeader}>
            <Text style={styles.goalsTitle}>
              Définissez votre <Text style={styles.goalsHighlight}>Trajectoire</Text>
            </Text>
            <View style={styles.goalsLine} />
          </View>
          <View style={styles.goalsGrid}>
            {[
              { key: 'Hypertrophie', icon: '💪', desc: 'Maximisez la masse musculaire sèche' },
              { key: 'Puissance', icon: '⚡', desc: 'Force explosive' },
              { key: 'Endurance', icon: '🏃', desc: 'Capacité aérobie' },
            ].map((goal) => (
              <TouchableOpacity
                key={goal.key}
                style={[styles.goalCard, objectif === goal.key && styles.goalSelected]}
                onPress={() => setObjectif(goal.key)}
              >
                <Text style={styles.goalIcon}>{goal.icon}</Text>
                <Text style={styles.goalTitle}>{goal.key.toUpperCase()}</Text>
                <Text style={styles.goalDesc}>{goal.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Insight */}
        <View style={styles.aiInsight}>
          <View style={styles.aiIcon}>
            <Text style={styles.aiIconText}>🧠</Text>
          </View>
          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>Analyse IA Gros Muscle</Text>
            <Text style={styles.aiText}>
              Selon vos mesures, nous nous concentrerons sur le <Text style={styles.aiHighlight}>Conditionnement Métabolique</Text> durant votre première semaine.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={validerCalibration}>
            <Text style={styles.primaryButtonText}>Étape suivante</Text>
            <Text style={styles.primaryButtonIcon}>➡️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton}>
            <Text style={styles.skipText}>Ignorer pour l&apos;instant</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0e11',
  },
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 50,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
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
    backgroundColor: '#171a1d',
    borderWidth: 1,
    borderColor: 'rgba(184,68,199,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 16,
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
    // color removed as TouchableOpacity doesn't have color prop
  },
  headerIcon: {
    fontSize: 24,
  },
  main: {
    paddingTop: 100,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  headerSection: {
    marginBottom: 48,
  },
  phaseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  phaseLine: {
    width: 32,
    height: 2,
    backgroundColor: '#b844c7',
  },
  phaseText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#b844c7',
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    color: '#f9f9fd',
    marginBottom: 16,
  },
  titleHighlight: {
    color: '#b844c7',
  },
  subtitle: {
    fontSize: 18,
    color: '#aaabaf',
    lineHeight: 28,
    maxWidth: 600,
  },
  biometricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 48,
  },
  metricCard: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#1d2024',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(70,72,75,0.1)',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  metricIcon: {
    fontSize: 24,
    color: '#b844c7',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#aaabaf',
  },
  metricInput: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  metricValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#f9f9fd',
    width: 80,
    padding: 0,
    borderWidth: 0,
  },
  metricUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: '#aaabaf',
  },
  secondaryGrid: {
    gap: 32,
    marginBottom: 48,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#aaabaf',
    marginBottom: 12,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#171a1d',
    borderWidth: 1,
    borderColor: 'rgba(70,72,75,0.1)',
    borderRadius: 12,
  },
  genderSelected: {
    backgroundColor: 'rgba(184,68,199,0.2)',
    borderColor: '#b844c7',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#f9f9fd',
  },
  genderTextSelected: {
    color: '#b844c7',
  },
  sportInput: {
    position: 'relative',
  },
  sportIcon: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    fontSize: 20,
    color: '#b844c7',
  },
  sportField: {
    backgroundColor: '#171a1d',
    borderWidth: 1,
    borderColor: 'rgba(70,72,75,0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingLeft: 48,
    paddingRight: 16,
    color: '#f9f9fd',
    fontSize: 16,
    fontWeight: '700',
  },
  pickerContainer: {
    backgroundColor: '#171a1d',
    borderWidth: 1,
    borderColor: 'rgba(70,72,75,0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    color: '#f9f9fd',
    height: 56,
  },
  goalsSection: {
    marginBottom: 48,
  },
  goalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  goalsTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    color: '#f9f9fd',
  },
  goalsHighlight: {
    color: '#b844c7',
  },
  goalsLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(184,68,199,0.3)',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  goalCard: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#171a1d',
    borderWidth: 1,
    borderColor: 'rgba(70,72,75,0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  goalSelected: {
    backgroundColor: 'rgba(184,68,199,0.1)',
    borderColor: '#b844c7',
    shadowColor: '#b844c7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  goalIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#f9f9fd',
    marginBottom: 8,
  },
  goalDesc: {
    fontSize: 12,
    color: '#aaabaf',
    textAlign: 'center',
  },
  aiInsight: {
    backgroundColor: 'rgba(184,68,199,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(184,68,199,0.1)',
    borderRadius: 24,
    padding: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 48,
  },
  aiIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(184,68,199,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#b844c7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 5,
  },
  aiIconText: {
    fontSize: 40,
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#b844c7',
    marginBottom: 8,
  },
  aiText: {
    fontSize: 16,
    color: '#aaabaf',
    lineHeight: 24,
  },
  aiHighlight: {
    fontWeight: '700',
    color: '#f9f9fd',
  },
  actions: {
    alignItems: 'center',
    gap: 24,
  },
  primaryButton: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#b844c7',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#b844c7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  primaryButtonIcon: {
    fontSize: 20,
  },
  skipButton: {
    // color removed as TouchableOpacity doesn't have color prop
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
