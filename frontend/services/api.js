// 1. Définition de l'URL de base (Ton IP locale)
const BASE_URL = "http://10.31.67.156:8001";

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