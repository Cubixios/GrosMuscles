import { Platform } from 'react-native';

// Définition de l'URL de base pour le backend FastAPI local
// - 127.0.0.1:8000 est la valeur standard pour uvicorn local
// - 10.0.2.2 est nécessaire pour Android Emulator sur Windows
const BACKEND_HOST = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
const BACKEND_PORT = 8000;
const BASE_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`;

/**
 * On décrit la forme de la réponse attendue du backend pour que VS Code comprenne
 * @typedef {Object} ReponseSeance
 * @property {string} conseil_ia
 */

/**
 * Fonction pour envoyer une nouvelle séance au backend
 * @param {Object} donneesSeance - Les infos de la séance (durée, fatigue, etc.)
 * @returns {Promise<ReponseSeance>} - La réponse de l'API (contenant le conseil IA)
 */
export const validerSeanceAPI = async (donneesSeance) => {
  try {
    const response = await fetch(`${BASE_URL}/api/seances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(donneesSeance),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data; 
  } catch (error) {
    console.error("Erreur dans validerSeanceAPI :", error);
    throw error;
  }
};

/**
 * Fonction exemple pour récupérer l'historique (si tu en as besoin plus tard)
 */
export const getHistoriqueSeances = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/seances/${userId}`);
    if (!response.ok) throw new Error("Impossible de récupérer l'historique");
    return await response.json();
  } catch (error) {
    console.error("Erreur dans getHistorique :", error);
    throw error;
  }
};

/**
 * Fonction pour récupérer les séances d'un utilisateur
 * @param {number} userId - L'ID de l'utilisateur
 * @returns {Promise<Array>} - Tableau des séances réalisées
 */
export const getSeancesUtilisateur = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/seances/${userId}`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur dans getSeancesUtilisateur :", error);
    throw error;
  }
};

/**
 * @typedef {Object} UtilisateurResponse
 * @property {number} id_user
 * @property {string} nom
 * @property {string} email
 * @property {string} environnement
 */

/**
 * @typedef {Object} ReponseInscription
 * @property {string} statut
 * @property {UtilisateurResponse} utilisateur
 */

/**
 * Fonction pour créer un nouvel utilisateur
 * @param {Object} donneesUtilisateur - Les informations du formulaire (ex: nom, email)
 * @returns {Promise<ReponseInscription>}
 */
export const creerCompteAPI = async (donneesUtilisateur) => {
  try {
    const response = await fetch(`${BASE_URL}/api/utilisateurs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(donneesUtilisateur),
    });

    if (!response.ok) {
      const erreurBody = await response.text();
      console.error('Body renvoyé par l’API:', erreurBody);
      throw new Error(`Erreur HTTP: ${response.status} - ${erreurBody}`);
    }

    const data = await response.json();
    return data; // Doit contenir l'id_user renvoyé par Python
  } catch (error) {
    console.error("Erreur dans creerCompteAPI :", error);
    throw error;
  }
};

/**
 * @typedef {Object} ReponseConnexion
 * @property {string} statut
 * @property {UtilisateurResponse} utilisateur
 */

/**
 * Fonction pour authentifier un utilisateur
 * @param {Object} donneesConnexion - Les informations de connexion (email, password)
 * @returns {Promise<ReponseConnexion>}
 */
export const loginAPI = async (donneesConnexion) => {
  try {
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(donneesConnexion),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message = errorBody?.detail || `Erreur HTTP: ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur dans loginAPI :", error);
    throw error;
  }
};

/**
 * Fonction pour calibrer le profil utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {Object} donneesCalibration - Les données de calibration
 * @returns {Promise<Object>}
 */
export const calibrerProfilAPI = async (userId, donneesCalibration) => {
  try {
    const response = await fetch(`${BASE_URL}/api/utilisateurs/${userId}/calibration`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(donneesCalibration),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur dans calibrerProfilAPI :", error);
    throw error;
  }
};