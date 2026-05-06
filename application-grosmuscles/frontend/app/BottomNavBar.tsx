import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PURPLE = '#b844c7';
const TEXT_SECONDARY = '#a1a1a1';

type ActiveScreen = 'accueil' | 'routines' | 'analyses' | 'profil';

interface BottomNavBarProps {
  activeScreen: ActiveScreen;
}

export default function BottomNavBar({ activeScreen }: BottomNavBarProps) {
  const router = useRouter();

  // On définit explicitement les icônes pour l'état actif et inactif pour plus de robustesse.
  const navItems = [
    { name: 'accueil', label: 'Accueil', icon: 'home', outlineIcon: 'home-outline', route: '/' },
    { name: 'routines', label: 'Routines', icon: 'dumbbell', outlineIcon: 'dumbbell', route: '/routines' },
    { name: 'analyses', label: 'Analyses', icon: 'chart-bar', outlineIcon: 'chart-bar', route: '/analyses' },
    { name: 'profil', label: 'Profil', icon: 'account', outlineIcon: 'account-outline', route: '/profile' },
  ];

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => {
        const isActive = activeScreen === item.name;
        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => router.push(item.route as any)}
          >
            <MaterialCommunityIcons
              name={(isActive ? item.icon : item.outlineIcon) as any}
              size={24}
              color={isActive ? PURPLE : TEXT_SECONDARY}
            />
            <Text style={[styles.navText, isActive && { color: PURPLE }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(77, 77, 77, 0.2)',
    paddingVertical: 8,
    paddingBottom: 12, // Extra padding for home bar area
  },
  navItem: { alignItems: 'center', gap: 4 },
  navText: { color: TEXT_SECONDARY, fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
});