from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialisation de l'API
app = FastAPI(title="MVP GROS MUSCLES", description="Boucle principale : Création -> Séance -> IA")

# Autoriser le frontend à communiquer avec ce backend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Accepte toutes les connexions (parfait pour un PoC local)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Fausse Base de données en mémoire pour le PoC ---
users_db = {}
user_id_counter = 1

# --- Modèles de données attendus ---
class UserCreate(BaseModel):
    nom: str
    email: str

class SeanceCreate(BaseModel):
    id_user: int
    nom_seance: str
    duree_totale: int # en minutes
    note_fatigue: int # de 1 à 10 (RPE)

# --- ÉTAPE 1 : Créer un compte ---
@app.post("/api/utilisateurs")
def creer_compte(user: UserCreate):
    global user_id_counter
    new_user = {"id_user": user_id_counter, "nom": user.nom, "email": user.email}
    users_db[user_id_counter] = new_user
    user_id_counter += 1
    return {"statut": "succès", "utilisateur": new_user}

# --- ÉTAPE 2 & 3 : Saisir séance & Recevoir Conseil IA ---
@app.post("/api/seances")
def enregistrer_seance_et_analyser(seance: SeanceCreate):
    # Vérification que l'utilisateur existe
    if seance.id_user not in users_db:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    nom_user = users_db[seance.id_user]["nom"]

    # Simulation du "cerveau" IA avec des règles métiers
    if seance.note_fatigue >= 8:
        conseil_ia = f"⚠️ Alerte fatigue pour {nom_user}. Ton RPE est très élevé ({seance.note_fatigue}/10). L'IA recommande de baisser tes charges de 10% ou de prendre un jour de repos supplémentaire."
    elif seance.duree_totale < 40:
        conseil_ia = f"⚡ Séance intense et courte ({seance.duree_totale} min) ! Si ton objectif est l'hypertrophie, l'IA te suggère d'ajouter 2 séries d'isolation la prochaine fois."
    else:
        conseil_ia = f"✅ Super séance {nom_user} ! Volume et intensité optimaux. Continue sur cette lancée."

    # On renvoie la réponse au téléphone/navigateur
    return {
        "statut": "succès",
        "message": f"Séance '{seance.nom_seance}' enregistrée avec succès.",
        "conseil_ia": conseil_ia
    }