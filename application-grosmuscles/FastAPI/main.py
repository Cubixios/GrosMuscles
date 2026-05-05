from fastapi import FastAPI, HTTPException, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated, Optional
from sqlalchemy.orm import Session # Correction de l'import ici
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
import datetime
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

# --- Sécurité : Hachage des mots de passe ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Schémas Pydantic ---
class UserCreate(BaseModel):
    nom: str
    email: EmailStr # Validation automatique du format email
    password: str
    environnement: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr # Validation automatique du format email
    password: str

class CalibrationData(BaseModel):
    poids: float
    taille: int
    age: int
    sexe: str
    sport_pratique: str
    environnement: str
    objectif: str

class SeanceCreate(BaseModel):
    id_user: int
    nom_seance: str
    duree_totale: int # en minutes
    note_fatigue: int # de 1 à 10 (RPE)

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
    existing_user = db.query(models.Utilisateur).filter(models.Utilisateur.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Cette adresse e-mail est déjà utilisée.")

    new_user = models.Utilisateur(
        nom=user.nom,
        email=user.email,
        environnement=user.environnement or "",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    credentials = models.CredentialUtilisateur(
        id_user=new_user.id_user,
        mot_de_passe=pwd_context.hash(user.password), # On hashe le mot de passe
    )
    db.add(credentials)
    db.commit()

    return {"statut": "succès", "utilisateur": jsonable_encoder(new_user)}


@app.post("/api/login")
def login(credentials: UserLogin, db: db_dependency):
    user = db.query(models.Utilisateur).filter(models.Utilisateur.email == credentials.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Identifiants invalides.")

    auth = db.query(models.CredentialUtilisateur).filter(models.CredentialUtilisateur.id_user == user.id_user).first()
    # On vérifie le mot de passe hashé
    if not auth or not pwd_context.verify(credentials.password, auth.mot_de_passe):
        raise HTTPException(status_code=401, detail="Identifiants invalides.")

    return {"statut": "succès", "utilisateur": jsonable_encoder(user)}


@app.put("/api/utilisateurs/{user_id}/calibration")
def calibrer_profil(user_id: int, calibration: CalibrationData, db: db_dependency):
    user = db.query(models.Utilisateur).filter(models.Utilisateur.id_user == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")

    user.environnement = calibration.environnement

    profil = db.query(models.ProfilUtilisateur).filter(models.ProfilUtilisateur.id_user == user_id).first()
    if not profil:
        profil = models.ProfilUtilisateur(
            id_user=user_id,
            age=calibration.age,
            sexe=calibration.sexe,
            sport_pratique=calibration.sport_pratique,
            objectif=calibration.objectif,
            poids_corps=calibration.poids,
            taille=calibration.taille,
        )
        db.add(profil)
    else:
        profil.age = calibration.age
        profil.sexe = calibration.sexe
        profil.sport_pratique = calibration.sport_pratique
        profil.objectif = calibration.objectif
        profil.poids_corps = calibration.poids
        profil.taille = calibration.taille
    db.commit()

    return {"statut": "succès", "profil": jsonable_encoder(profil)}


# --- ÉTAPE 2 & 3 : Saisir séance & Recevoir Conseil IA ---
@app.post("/api/seances")
def enregistrer_seance_et_analyser(seance: SeanceCreate, db: db_dependency):
    # 1. Vérification que l'utilisateur existe
    user = db.query(models.Utilisateur).filter(models.Utilisateur.id_user == seance.id_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # 2. ENREGISTREMENT DE LA SÉANCE EN BDD
    nouvelle_seance = models.SeanceRealisee(
        id_user=seance.id_user,
        id_modele=1, # Valeur par défaut pour le test
        nom_seance=seance.nom_seance, # On enregistre le nom de la séance
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

# --- ÉTAPE 4 : Récupérer l'historique ---
@app.get("/api/seances/{user_id}")
def get_seances_par_utilisateur(user_id: int, db: db_dependency):
    user = db.query(models.Utilisateur).filter(models.Utilisateur.id_user == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    seances = db.query(models.SeanceRealisee).filter(models.SeanceRealisee.id_user == user_id).order_by(models.SeanceRealisee.date_heure.desc()).all()
    return jsonable_encoder(seances)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
