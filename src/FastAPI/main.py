from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime

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

# ==========================================
# 2. INITIALISATION DE FASTAPI
# ==========================================
app = FastAPI(title="API GROS MUSCLES", description="Backend connecté avec SQLAlchemy")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fonction super importante : elle ouvre la porte de la BDD et la referme proprement après
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================
# 3. SCHÉMAS PYDANTIC (Validation des données)
# ==========================================
class UserCreate(BaseModel):
    nom: str
    email: str
    environnement: str = "salle complète"

class SeanceCreate(BaseModel):
    id_user: int
    id_modele: int = 1 # Par défaut pour le test
    duree_totale: int
    note_fatigue: int

# ==========================================
# 4. LES ROUTES DE L'API
# ==========================================

@app.post("/api/utilisateurs")
def creer_compte(user: UserCreate, db: Session = Depends(get_db)):
    # On vérifie si l'email existe déjà
    db_user = db.query(models.Utilisateur).filter(models.Utilisateur.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    # On crée le "vrai" objet de la base de données
    nouvel_utilisateur = models.Utilisateur(
        nom=user.nom, 
        email=user.email, 
        environnement=user.environnement
    )
    
    # On l'ajoute dans le classeur et on sauvegarde (commit)
    db.add(nouvel_utilisateur)
    db.commit()
    db.refresh(nouvel_utilisateur) # Pour récupérer l'ID généré automatiquement
    
    return {"statut": "succès", "utilisateur": nouvel_utilisateur}


@app.post("/api/seances")
def enregistrer_seance(seance: SeanceCreate, db: Session = Depends(get_db)):
    # 1. On cherche l'utilisateur dans la base
    user = db.query(models.Utilisateur).filter(models.Utilisateur.id_user == seance.id_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    # 2. On sauvegarde la vraie séance en BDD
    nouvelle_seance = models.SeanceRealisee(
        id_modele=seance.id_modele,
        duree_totale=seance.duree_totale,
        note_fatigue=seance.note_fatigue,
        date_heure=datetime.utcnow()
    )
    
    # ASTUCE RELATIONNELLE : Au lieu de forcer l'id_user à la main, 
    # on lie directement la séance à l'utilisateur !
    user.seances_modeles.append(nouvelle_seance) # (Exemple simplifié pour le lien)
    # Plus proprement pour cette table : 
    # En théorie, SeanceRealisee est liée à SeanceModele, qui est liée à Utilisateur.
    # Pour le MVP on garde ça simple.
    
    db.add(nouvelle_seance)
    db.commit()

    # 3. Logique de l'IA basée sur la fatigue
    if seance.note_fatigue >= 8:
        conseil = f"⚠️ Alerte fatigue pour {user.nom}. Ton RPE est très élevé ({seance.note_fatigue}/10). L'IA recommande du repos."
    else:
        conseil = f"✅ Super séance {user.nom} ! Continue sur cette lancée."

    return {
        "statut": "succès",
        "message": "Séance enregistrée dans SQLite avec succès !",
        "conseil_ia": conseil
    }