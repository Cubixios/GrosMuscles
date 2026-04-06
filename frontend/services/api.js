// 1. Définition de l'URL de base (À CHANGER AVEC TON VRAIE IP LOCALE)
// Exemple : "http://192.168.1.50:8000" ou "http://10.84.64.19:8000"
const BASE_URL = "http://10.84.64.19:8000";

/**
 * Fonction pour envoyer une nouvelle séance au backend
 * @param {Object} donneesSeance - Les infos de la séance (durée, fatigue, etc.)
 * @returns {Promise<Object>} - La réponse de l'API (contenant le conseil IA)
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
    throw error; // On renvoie l'erreur pour que l'interface puisse afficher une alerte
  }
};

/**
 * Fonction exemple pour récupérer l'historique (si ton backend a cette route)
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