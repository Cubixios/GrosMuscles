import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';

// 1. On importe proprement ta fonction depuis le fichier de service
import { validerSeanceAPI } from '../../services/api';

export default function Index() {
  // Navigation : 'historique', 'encours', 'modeles'
  const [ongletActif, setOngletActif] = useState('encours');
  
  // États pour la séance en cours
  const [etapeSeance, setEtapeSeance] = useState(1);
  const [duree, setDuree] = useState('');
  const [fatigue, setFatigue] = useState('');
  const [conseilIA, setConseilIA] = useState('');

  // Fausses données 
  const seancesFaites = [
    { id: 1, nom: 'Dos / Biceps', date: 'Aujourd\'hui', volume: '8 500 kg', duree: '1h15' },
    { id: 2, nom: 'Jambes (Focus Quad)', date: '27 Mars', volume: '12 200 kg', duree: '1h30' },
    { id: 3, nom: 'Pectoraux / Triceps', date: '25 Mars', volume: '7 800 kg', duree: '1h10' },
  ];

  const modelesEnregistres = [
    { id: 1, nom: 'Push (Pecs/Epaules/Triceps)' },
    { id: 2, nom: 'Pull (Dos/Biceps)' },
    { id: 3, nom: 'Legs (Jambes complètes)' },
  ];

  // 2. La fonction est maintenant beaucoup plus lisible et courte !
  const validerSeance = async () => {
    if (!duree || !fatigue) {
        return Alert.alert("Erreur", "Précise la durée et ta fatigue");
    }

    try {
      // On délègue le travail sale (réseau, requêtes) à api.ts
      const donnees = await validerSeanceAPI({
        id_user: 1,
        nom_seance: "Séance Libre",
        duree_totale: parseInt(duree),
        note_fatigue: parseInt(fatigue)
      });

      // Si ça a marché, on met à jour l'interface
      setConseilIA(donnees.conseil_ia);
      setEtapeSeance(2); 

    } catch (erreur) {
      // L'erreur s'affiche si api.ts a rencontré un problème
      Alert.alert("Erreur réseau", "Impossible de joindre le serveur. Ton backend Python est-il allumé ? L'adresse IP est-elle correcte ?");
    }
  };

  // Rendu du contenu selon l'onglet
  const renderContenu = () => {
    if (ongletActif === 'historique') {
      return (
        <ScrollView style={styles.contenuScroll}>
          <Text style={styles.titreSection}>Séances Terminées</Text>
          {seancesFaites.map((seance) => (
            <View key={seance.id} style={styles.carteHistorique}>
              <View style={styles.headerCarte}>
                <Text style={styles.nomSeanceHistorique}>{seance.nom}</Text>
                <Text style={styles.dateSeance}>{seance.date}</Text>
              </View>
              <Text style={styles.statsSeance}>⏱ {seance.duree}   🏋️‍♂️ {seance.volume}</Text>
            </View>
          ))}
        </ScrollView>
      );
    }

    if (ongletActif === 'modeles') {
      return (
        <ScrollView style={styles.contenuScroll}>
          <Text style={styles.titreSection}>Mes Routines</Text>
          {modelesEnregistres.map((modele) => (
            <TouchableOpacity key={modele.id} style={styles.carteModele}>
              <Text style={styles.nomModele}>{modele.nom}</Text>
              <Text style={styles.demarrerTexte}>▶ Démarrer</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.boutonAjout}>
            <Text style={styles.boutonAjoutTexte}>+ Créer une nouvelle routine</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    // Onglet 'encours' (Par défaut)
    return (
      <View style={styles.contenuCentre}>
        {etapeSeance === 1 ? (
          <View style={styles.carteAction}>
            <Text style={styles.titreSection}>Séance Libre en cours</Text>
            <TextInput style={styles.input} placeholder="Durée totale (min)" onChangeText={setDuree} value={duree} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Fatigue ressentie RPE (1-10)" onChangeText={setFatigue} value={fatigue} keyboardType="numeric" />
            <TouchableOpacity style={styles.boutonPrincipal} onPress={validerSeance}>
              <Text style={styles.boutonTexte}>Terminer et Analyser (IA)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.carteAction}>
            <Text style={styles.titreSection}>Analyse IA 🧠</Text>
            <View style={styles.iaBox}><Text style={styles.iaTexte}>{conseilIA}</Text></View>
            <TouchableOpacity style={styles.boutonSecondaire} onPress={() => { setEtapeSeance(1); setDuree(''); setFatigue(''); }}>
              <Text style={styles.boutonSecondaireTexte}>Nouvelle séance</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.titreApp}>GROS MUSCLES</Text>
      </View>

      {/* ZONE CENTRALE */}
      <View style={styles.zoneCentrale}>
        {renderContenu()}
      </View>

      {/* BARRE DE NAVIGATION (BOTTOM TABS) */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setOngletActif('historique')}>
          <Text style={[styles.navIcone, ongletActif === 'historique' && styles.navActif]}>📋</Text>
          <Text style={[styles.navTexte, ongletActif === 'historique' && styles.navTexteActif]}>Historique</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => setOngletActif('encours')}>
          <Text style={[styles.navIcone, ongletActif === 'encours' && styles.navActif]}>⏱</Text>
          <Text style={[styles.navTexte, ongletActif === 'encours' && styles.navTexteActif]}>En cours</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => setOngletActif('modeles')}>
          <Text style={[styles.navIcone, ongletActif === 'modeles' && styles.navActif]}>📁</Text>
          <Text style={[styles.navTexte, ongletActif === 'modeles' && styles.navTexteActif]}>Routines</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { paddingTop: 50, paddingBottom: 15, backgroundColor: '#2c3e50', alignItems: 'center' },
  titreApp: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  zoneCentrale: { flex: 1, padding: 15 },
  contenuScroll: { flex: 1 },
  contenuCentre: { flex: 1, justifyContent: 'center' },
  titreSection: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#2c3e50' },
  
  // Cartes Historique
  carteHistorique: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  headerCarte: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  nomSeanceHistorique: { fontSize: 16, fontWeight: 'bold', color: '#34495e' },
  dateSeance: { color: '#7f8c8d', fontSize: 14 },
  statsSeance: { color: '#e74c3c', fontWeight: 'bold', fontSize: 14 },

  // Cartes Modèles
  carteModele: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nomModele: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  demarrerTexte: { color: '#3498db', fontWeight: 'bold' },
  boutonAjout: { backgroundColor: '#ecf0f1', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#bdc3c7' },
  boutonAjoutTexte: { color: '#7f8c8d', fontWeight: 'bold' },

  // Action / Séance
  carteAction: { backgroundColor: 'white', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  input: { borderWidth: 1, borderColor: '#ecf0f1', padding: 15, borderRadius: 8, marginBottom: 15, backgroundColor: '#fafafa', fontSize: 16 },
  boutonPrincipal: { backgroundColor: '#e74c3c', padding: 15, borderRadius: 8, alignItems: 'center' },
  boutonTexte: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  boutonSecondaire: { marginTop: 15, padding: 15, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e74c3c' },
  boutonSecondaireTexte: { color: '#e74c3c', fontWeight: 'bold', fontSize: 16 },
  
  // IA
  iaBox: { backgroundColor: '#fdf2f0', borderLeftWidth: 5, borderLeftColor: '#e74c3c', padding: 15, borderRadius: 5, marginBottom: 15 },
  iaTexte: { fontSize: 16, color: '#2c3e50', lineHeight: 24 },

  // NavBar
  navBar: { flexDirection: 'row', backgroundColor: 'white', paddingBottom: 25, paddingTop: 10, borderTopWidth: 1, borderColor: '#ecf0f1', justifyContent: 'space-around' },
  navItem: { alignItems: 'center', flex: 1 },
  navIcone: { fontSize: 24, opacity: 0.5 },
  navTexte: { fontSize: 12, color: '#95a5a6', marginTop: 4 },
  navActif: { opacity: 1 },
  navTexteActif: { color: '#e74c3c', fontWeight: 'bold' }
});