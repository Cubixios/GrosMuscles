from fastapi import FastAPI, HTTPException, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated, Optional
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel, EmailStr
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
    # On normalise l'e-mail en minuscules pour assurer la cohérence
    email_lower = user.email.lower()
    existing_user = db.query(models.Utilisateur).filter(models.Utilisateur.email == email_lower).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Cette adresse e-mail est déjà utilisée.")

    new_user = models.Utilisateur(
        nom=user.nom,
        # On sauvegarde l'e-mail en minuscules
        email=email_lower,
        environnement=user.environnement or "",
    )
    db.add(new_user)
    db.flush() # Envoie la requête à la BDD pour obtenir un ID, sans "commiter" la transaction.

    credentials = models.CredentialUtilisateur(
        id_user=new_user.id_user,
        mot_de_passe=user.password, # ATTENTION: Mot de passe en clair pour simplifier le MVP
    )
    db.add(credentials)
    db.commit() # Commit atomique : l'utilisateur et ses credentials sont sauvegardés en même temps.
    db.refresh(new_user)

    return {"statut": "succès", "utilisateur": jsonable_encoder(new_user)}


@app.post("/api/login")
def login(credentials: UserLogin, db: db_dependency):
    # On normalise aussi l'e-mail ici pour la recherche
    email_lower = credentials.email.lower()
    print(f"Tentative de connexion pour l'email : {email_lower}")
    
    # On utilise un JOIN pour récupérer l'utilisateur et ses credentials en une seule requête
    user = db.query(models.Utilisateur).options(joinedload(models.Utilisateur.credential)).filter(models.Utilisateur.email == email_lower).first()

    # Si l'utilisateur n'est pas trouvé, ou s'il n'a pas de credentials, on rejette.
    if not user or not user.credential:
        print("Échec : Utilisateur ou informations d'authentification non trouvés.")
        raise HTTPException(status_code=401, detail="Identifiants invalides.")

    # ATTENTION: On compare le mot de passe en clair pour simplifier le MVP
    password_is_valid = credentials.password == user.credential.mot_de_passe
    if not password_is_valid:
        print(f"Échec : Le mot de passe est incorrect pour l'utilisateur ID: {user.id_user}")
        raise HTTPException(status_code=401, detail="Identifiants invalides.")

    print(f"Succès : Le mot de passe est valide pour l'utilisateur ID: {user.id_user}. Connexion réussie.")
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
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
