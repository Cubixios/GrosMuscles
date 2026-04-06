// 1. Définition de l'URL de base (Ton IP locale)
const BASE_URL = "http://172.20.10.2:8000";

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