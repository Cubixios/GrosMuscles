from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship
import datetime

Base = declarative_base()

class Utilisateur(Base):
    __tablename__ = "utilisateur"

    id_user = Column(Integer, primary_key=True, index=True) # Clé primaire [cite: 25]
    nom = Column(String, index=True) # [cite: 26]
    email = Column(String, unique=True, index=True) # [cite: 27]
    date_inscription = Column(Date, default=datetime.date.today) # [cite: 28]
    environnement = Column(String) # texte: salle complète, domicile [cite: 29, 30]

    # Relations (n'existent pas dans la table BDD, mais aident la navigation en Python)
    objectifs = relationship("Objectif", back_populates="utilisateur")
    suivis = relationship("SuiviPhysique", back_populates="utilisateur")
    seances_modeles = relationship("SeanceModele", back_populates="utilisateur")


class Objectif(Base):
    __tablename__ = "objectif"

    id_objectif = Column(Integer, primary_key=True, index=True) # [cite: 36]
    id_user = Column(Integer, ForeignKey("utilisateur.id_user")) # [cite: 37]
    type = Column(String) # Prise de masse, Perte de poids, Force [cite: 38]
    valeur_cible = Column(Float) # [cite: 39]
    date_echeance = Column(Date) # [cite: 40]

    utilisateur = relationship("Utilisateur", back_populates="objectifs")


class SuiviPhysique(Base):
    __tablename__ = "suivi_physique"

    id_mesure = Column(Integer, primary_key=True, index=True) # [cite: 42]
    id_user = Column(Integer, ForeignKey("utilisateur.id_user")) # Clé étrangère [cite: 43]
    date_mesure = Column(Date, default=datetime.date.today) # [cite: 44]
    poids_corps = Column(Float) # [cite: 45]
    taille = Column(Float) # [cite: 46]
    pourcentage_gras = Column(Float) # [cite: 47]

    utilisateur = relationship("Utilisateur", back_populates="suivis")


class Exercice(Base):
    __tablename__ = "exercice"

    id_exercice = Column(Integer, primary_key=True, index=True) # [cite: 66]
    nom_exo = Column(String, index=True) # [cite: 67]
    muscle_cible = Column(String) # [cite: 68]
    description = Column(Text) # [cite: 68]
    video_url = Column(String) # [cite: 68]


class SeanceModele(Base):
    __tablename__ = "seance_modele"

    id_modele = Column(Integer, primary_key=True, index=True) # [cite: 49]
    id_user = Column(Integer, ForeignKey("utilisateur.id_user")) # [cite: 50]
    nom_seance = Column(String) # [cite: 51]

    utilisateur = relationship("Utilisateur", back_populates="seances_modeles")
    compositions = relationship("CompositionSeance", back_populates="seance_modele")
    seances_realisees = relationship("SeanceRealisee", back_populates="seance_modele")


class CompositionSeance(Base):
    __tablename__ = "composition_seance"

    # Clés primaires composites (association entre Séance Modèle et Exercice)
    id_modele = Column(Integer, ForeignKey("seance_modele.id_modele"), primary_key=True) # [cite: 63]
    id_exercice = Column(Integer, ForeignKey("exercice.id_exercice"), primary_key=True) # [cite: 63]
    
    ordre_passage = Column(Integer) # [cite: 63]
    nb_series_prevues = Column(Integer) # [cite: 63]
    temps_repos_prevu = Column(Integer) # [cite: 64]

    seance_modele = relationship("SeanceModele", back_populates="compositions")
    exercice = relationship("Exercice")


class SeanceRealisee(Base):
    __tablename__ = "seance_realisee"

    id_realise = Column(Integer, primary_key=True, index=True) # [cite: 57]
    id_modele = Column(Integer, ForeignKey("seance_modele.id_modele")) # [cite: 58]
    date_heure = Column(DateTime, default=datetime.datetime.utcnow) # [cite: 59]
    duree_totale = Column(Integer) # en minutes [cite: 60]
    note_fatigue = Column(Integer) # [cite: 61]

    seance_modele = relationship("SeanceModele", back_populates="seances_realisees")
    performances = relationship("PerformanceSerie", back_populates="seance_realisee")


class PerformanceSerie(Base):
    __tablename__ = "performance_serie"

    id_perf = Column(Integer, primary_key=True, index=True) # [cite: 70]
    id_realise = Column(Integer, ForeignKey("seance_realisee.id_realise")) # [cite: 71]
    id_exercice = Column(Integer, ForeignKey("exercice.id_exercice")) # [cite: 72]
    num_serie = Column(Integer) # [cite: 73]
    poids_souleve = Column(Float) # [cite: 74]
    reps_faites = Column(Integer) # [cite: 75]
    RPE = Column(Integer) # Indice de difficulté de 1 à 10 [cite: 77]

    seance_realisee = relationship("SeanceRealisee", back_populates="performances")
    exercice = relationship("Exercice")


class VarianteExercice(Base):
    __tablename__ = "variante_exercice"

    id_exercice_principal = Column(Integer, ForeignKey("exercice.id_exercice"), primary_key=True) # [cite: 79]
    id_exercice_remplacement = Column(Integer, ForeignKey("exercice.id_exercice"), primary_key=True) # [cite: 80]
    score_similitude = Column(Float) # [cite: 80]


class ConseilIA(Base):
    __tablename__ = "conseil_ia"

    id_conseil = Column(Integer, primary_key=True, index=True) # [cite: 32]
    id_exercice = Column(Integer, ForeignKey("exercice.id_exercice"), nullable=True) # [cite: 33]
    date_genere = Column(DateTime, default=datetime.datetime.utcnow) # [cite: 33]
    message_analyse = Column(Text) # [cite: 33]

