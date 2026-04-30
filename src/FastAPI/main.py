from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated
from sqlalchemy.orm import Session # Correction de l'import ici
from pydantic import BaseModel
import models
from database import SessionLocal, engine

# Initialisation de l'API
app = FastAPI(title="MVP GROS MUSCLES", description="Boucle principale : Création -> Séance -> IA")

# Autoriser le frontend (Web et Mobile) à communiquer avec ce backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # On accepte tout pour le PoC local (Expo, Web, etc.)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schémas Pydantic ---
class UserCreate(BaseModel):
    nom: str
    email: str
    environnement: str = "salle complète"

class SeanceCreate(BaseModel):
    id_user: int
    id_modele: int = 1 # Par défaut pour le test
    duree_totale: int
    note_fatigue: int

# --- Gestion de la BDD ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

# Crée les tables dans la base SQLite au lancement
models.Base.metadata.create_all(bind=engine) 


# ==========================================
# ROUTES DE L'API
# ==========================================

# --- ÉTAPE 1 : Créer un compte ---
@app.post("/api/utilisateurs")
def creer_compte(user: UserCreate, db: db_dependency):
    # On utilise "Utilisateur" comme défini dans ton models.py précédent
    new_user = models.Utilisateur(nom=user.nom, email=user.email)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"statut": "succès", "utilisateur": new_user}


# --- ÉTAPE 2 & 3 : Saisir séance & Recevoir Conseil IA ---
@app.post("/api/seances")
def enregistrer_seance_et_analyser(seance: SeanceCreate, db: db_dependency):
    # 1. Vérification que l'utilisateur existe
    user = db.query(models.Utilisateur).filter(models.Utilisateur.id_user == seance.id_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # 2. ENREGISTREMENT DE LA SÉANCE EN BDD
    nouvelle_seance = models.SeanceRealisee(
        id_modele=1, # Valeur par défaut pour le test
        duree_totale=seance.duree_totale,
        note_fatigue=seance.note_fatigue
    )
    db.add(nouvelle_seance)
    db.commit() # On sauvegarde !

    # 3. Simulation du "cerveau" IA avec des règles métiers
    if seance.note_fatigue >= 8:
        conseil_ia = f"⚠️ Alerte fatigue pour {user.nom}. Ton RPE est très élevé ({seance.note_fatigue}/10). L'IA recommande de baisser tes charges de 10% ou de prendre un jour de repos supplémentaire."
    elif seance.duree_totale < 40:
        conseil_ia = f"⚡ Séance intense et courte ({seance.duree_totale} min) ! Si ton objectif est l'hypertrophie, l'IA te suggère d'ajouter 2 séries d'isolation la prochaine fois."
    else:
        conseil_ia = f"✅ Super séance {user.nom} ! Volume et intensité optimaux. Continue sur cette lancée."

    # 4. On renvoie la réponse au téléphone/navigateur
    return {
        "statut": "succès",
        "message": f"Séance '{seance.nom_seance}' enregistrée avec succès dans la BDD.",
        "conseil_ia": conseil_ia
    }