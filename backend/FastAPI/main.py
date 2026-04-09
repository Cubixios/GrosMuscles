from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated
from sqlalchemy.orm import Session # Correction de l'import ici
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
import datetime
import models
from database import SessionLocal, engine

# Import de ton fichier models.py
import models

# ==========================================
# 1. CONFIGURATION DE LA BASE DE DONNÉES
# ==========================================
SQLALCHEMY_DATABASE_URL = "sqlite:///./gros_muscles.db"

# Création du "moteur" qui va parler à SQLite
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# Création de l'usine à sessions (pour parler à la BDD)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Création magique de toutes les tables définies dans models.py !
models.Base.metadata.create_all(bind=engine)

# Assurer la présence de la colonne password sur l'ancienne base SQLite
with engine.begin() as conn:
    result = conn.exec_driver_sql("PRAGMA table_info(utilisateur)")
    columns = [row[1] for row in result.fetchall()]
    if 'password' not in columns:
        conn.exec_driver_sql("ALTER TABLE utilisateur ADD COLUMN password VARCHAR")

# ==========================================
# 2. INITIALISATION DE FASTAPI
# ==========================================
app = FastAPI(title="API GROS MUSCLES", description="Backend connecté avec SQLAlchemy")

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
    email: str | None = None
    password: str
    environnement: str | None = None

class UserLogin(BaseModel):
    email: str
    password: str

class CalibrationUpdate(BaseModel):
    poids: float
    taille: int
    age: int
    sexe: str
    sport_pratique: str
    environnement: str
    objectif: str

class UtilisateurResponse(BaseModel):
    id_user: int
    nom: str
    email: str
    environnement: str | None
    poids: float | None
    taille: int | None
    age: int | None
    sexe: str | None
    sport_pratique: str | None
    objectif: str | None
    date_inscription: datetime.date

    class Config:
        from_attributes = True

class UserCreateResponse(BaseModel):
    statut: str
    utilisateur: UtilisateurResponse

class SeanceCreate(BaseModel):
    id_user: int
    id_modele: int = 1 # Par défaut pour le test
    duree_totale: int
    note_fatigue: int

# ==========================================
# 4. LES ROUTES DE L'API
# ==========================================

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
@app.post("/api/utilisateurs", response_model=UserCreateResponse)
def creer_compte(user: UserCreate, db: db_dependency):
    # Générer un email par défaut si non fourni, avec un suffixe unique
    suffix = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    email = user.email or f"{user.nom.lower().replace(' ', '')}_{suffix}@grosmuscles.com"
    # On utilise "Utilisateur" comme défini dans ton models.py précédent
    new_user = models.Utilisateur(nom=user.nom, email=email, password=user.password, environnement=user.environnement or 'salle complète')
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"statut": "succès", "utilisateur": new_user}


# --- AUTHENTIFICATION ---
@app.post("/api/login")
def login_utilisateur(credentials: UserLogin, db: db_dependency):
    user = db.query(models.Utilisateur).filter(models.Utilisateur.email == credentials.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Adresse e-mail non associée à un compte.")
    if user.password != credentials.password:
        raise HTTPException(status_code=401, detail="Mot de passe incorrect.")

    return {"statut": "succès", "utilisateur": user}


# --- ÉTAPE 1.5 : Calibration du profil ---
@app.put("/api/utilisateurs/{user_id}/calibration")
def calibrer_profil(user_id: int, calibration: CalibrationUpdate, db: db_dependency):
    user = db.query(models.Utilisateur).filter(models.Utilisateur.id_user == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Mettre à jour les champs de calibration
    user.poids = calibration.poids
    user.taille = calibration.taille
    user.age = calibration.age
    user.sexe = calibration.sexe
    user.sport_pratique = calibration.sport_pratique
    user.environnement = calibration.environnement
    user.objectif = calibration.objectif
    
    db.commit()
    db.refresh(user)
    return {"statut": "succès", "utilisateur": user}


# --- ÉTAPE 2 & 3 : Saisir séance & Recevoir Conseil IA ---
@app.post("/api/seances")
def enregistrer_seance_et_analyser(seance: SeanceCreate, db: db_dependency):
    # 1. Vérification que l'utilisateur existe
    user = db.query(models.Utilisateur).filter(models.Utilisateur.id_user == seance.id_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # 2. ENREGISTREMENT DE LA SÉANCE EN BDD (C'est ce qu'il manquait !)
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