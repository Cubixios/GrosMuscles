# GrosMuscles
**GROS MUSCLES** est une application mobile permettant à tout pratiquant de musculation de suivre son évolution facilement. L'utilisateur peut paramétrer ses routines, saisir ses performances en temps réel pendant sa séance, et bénéficier d'une analyse automatisée grâce à l'Intelligence Artificielle pour optimiser sa progression (gestion du volume, détection de la fatigue, conseils d'hypertrophie).


## ⚙️ Configuration préalable (Réseau Local)

Pour que l'application mobile puisse communiquer avec l'API sur votre réseau local (ou via un partage de connexion), vous devez configurer l'adresse IP.

1. Ouvrez un terminal sur votre machine serveur et exécutez `ipconfig` (Windows) ou `ipconfig getifaddr en0` (Mac).
2. Récupérez l'**adresse IPv4** de votre carte réseau active (ex: `192.168.1.X` ou `172.20.10.X`).
3. Ouvrez le fichier `frontend/services/api.js` (ou `.ts`) et remplacez l'URL de base :
   ```javascript
   const BASE_URL = "http://VOTRE_ADRESSE_IP:8000";

Attention Windows : Assurez-vous que votre profil réseau est défini sur "Privé" pour que le Pare-feu autorise les connexions entrantes sur le port 8000.

🚀 1. Lancer le Backend (API Server)
Ouvrez un terminal à la racine du projet et exécutez les commandes suivantes :

Bash
# Aller dans le dossier contenant le point d'entrée de l'API
cd backend/FastAPI

# Installer les dépendances Python (si ce n'est pas déjà fait)
pip install -r ../../requirements.txt

# Lancer le serveur (l'option --host 0.0.0.0 permet d'écouter le réseau local)
uvicorn main:app --host 0.0.0.0 --port 8000
La documentation interactive de l'API sera accessible sur votre navigateur à l'adresse : http://localhost:8000/docs.


📱 2. Lancer le Frontend (App Mobile)
Ouvrez un deuxième terminal à la racine du projet :

Bash
# Aller dans le dossier du frontend
cd frontend

# Installer les dépendances Node.js (la première fois uniquement)
npm install

# Démarrer le serveur Expo
npx expo start