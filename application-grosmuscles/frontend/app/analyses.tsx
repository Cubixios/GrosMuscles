import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PURPLE = '#b844c7';
const DARK_BG = '#0a0a0a';
const TEXT_PRIMARY = '#f9f9fd';
const TEXT_SECONDARY = '#a1a1a1';

export default function Analyses() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.title}>ANALYSES</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.placeholder}>
          Page des analyses en construction...
        </Text>
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
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="chart-bar" size={24} color={PURPLE} />
          <Text style={[styles.navLabel, { color: PURPLE }]}>Analyses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/profile')}
        >
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
  placeholder: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 50,
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
