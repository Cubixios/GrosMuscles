import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNavBar from '../app/BottomNavBar';

const PURPLE = '#b844c7';
const DARK_BG = '#0a0a0a';
const SURFACE_CONTAINER = '#141414';
const TEXT_PRIMARY = '#f9f9fd';
const TEXT_SECONDARY = '#a1a1a1';

export default function Analyses() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analyses & Progrès</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.placeholderCard}>
            <MaterialCommunityIcons name="chart-gantt" size={48} color={PURPLE} />
            <Text style={styles.placeholderTitle}>Graphiques de progression</Text>
            <Text style={styles.placeholderSubtitle}>
              Cette section affichera bientôt des graphiques détaillés sur votre volume, votre poids soulevé et vos records personnels.
            </Text>
          </View>
          <View style={styles.placeholderCard}>
            <MaterialCommunityIcons name="calendar-check" size={48} color={PURPLE} />
            <Text style={styles.placeholderTitle}>Calendrier d'activité</Text>
            <Text style={styles.placeholderSubtitle}>
              Visualisez votre régularité et les groupes musculaires travaillés au fil du temps.
            </Text>
          </View>
        </ScrollView>
        <BottomNavBar activeScreen="analyses" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: DARK_BG },
  container: { flex: 1, },
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
    padding: 16,
  },
  placeholderCard: {
    backgroundColor: SURFACE_CONTAINER,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  placeholderTitle: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});