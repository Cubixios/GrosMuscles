import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router'; // L'outil magique pour changer d'écran
import { creerCompteAPI } from '../../services/api';

export default function Inscription() {
  const [nomInscription, setNomInscription] = useState('');
  const router = useRouter();

  const validerInscription = async () => {
    if (!nomInscription.trim()) {
      return Alert.alert("Erreur", "Veuillez entrer un nom.");
    }

    try {
      // 1. Appel à ton backend FastAPI
      const reponse = await creerCompteAPI({ nom: nomInscription });

      Alert.alert("Succès", "Compte créé ! Bienvenue.");

      // 2. On redirige l'utilisateur vers l'écran principal (index)
      // On utilise "replace" (et non "push") pour qu'il ne puisse pas 
      // faire "Retour" et revenir sur la page d'inscription par erreur.
      // On lui passe aussi l'ID généré en paramètre !
      router.replace({
        pathname: '/',
        params: { idUser: reponse.id_user }
      });

    } catch (erreur) {
      Alert.alert("Erreur", "Impossible de créer le compte.");
    }
  };

  return (
    <View style={styles.containerCentre}>
      <View style={styles.carteAction}>
        <Text style={styles.titreSection}>Créer un compte</Text>
        <Text style={{ marginBottom: 15, color: '#7f8c8d' }}>
          Inscris-toi pour sauvegarder tes performances et obtenir tes conseils IA.
        </Text>
        
        <TextInput 
          style={styles.input} 
          placeholder="Ton nom de sportif" 
          onChangeText={setNomInscription} 
          value={nomInscription} 
        />
        
        <TouchableOpacity style={styles.boutonPrincipal} onPress={validerInscription}>
          <Text style={styles.boutonTexte}>S'inscrire et démarrer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Les styles de cette page
const styles = StyleSheet.create({
  containerCentre: { flex: 1, backgroundColor: '#f8f9fa', justifyContent: 'center', padding: 20 },
  carteAction: { backgroundColor: 'white', padding: 20, borderRadius: 12, elevation: 5 },
  titreSection: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#2c3e50' },
  input: { borderWidth: 1, borderColor: '#ecf0f1', padding: 15, borderRadius: 8, marginBottom: 15, backgroundColor: '#fafafa', fontSize: 16 },
  boutonPrincipal: { backgroundColor: '#e74c3c', padding: 15, borderRadius: 8, alignItems: 'center' },
  boutonTexte: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});