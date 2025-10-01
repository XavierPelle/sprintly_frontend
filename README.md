# Ticket Management System - Frontend

Frontend Vue.js pour le système de gestion de tickets.

## 🚀 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📁 Structure du projet

```
src/
├── assets/          # Fichiers statiques (CSS, images)
├── components/      # Composants réutilisables
├── router/          # Configuration des routes
├── services/        # Services API
├── stores/          # Stores Pinia (state management)
├── views/           # Pages de l'application
├── App.vue          # Composant racine
└── main.ts          # Point d'entrée
```

## 🎯 Fonctionnalités

### Authentification
- ✅ Login
- ✅ Register
- ✅ JWT token management
- ✅ Auto-refresh token

### Dashboard
- ✅ Vue d'ensemble personnalisée
- ✅ Tickets assignés
- ✅ Sprints actifs
- ✅ Tests à valider
- ✅ Statistiques

### Tickets
- ✅ Liste des tickets
- ✅ Création de tickets
- ✅ Détails complets d'un ticket
- ✅ Changer le statut
- ✅ Assigner à un utilisateur
- ✅ Ajouter des commentaires
- ✅ Ajouter des tests
- ✅ Valider/Rejeter des tests

### Sprints
- ✅ Liste des sprints
- ✅ Création de sprints
- ✅ Détails du sprint
- ✅ Burndown chart
- ✅ Gestion des tickets
- ✅ Clôture de sprint

## 🔧 Configuration

### Tailwind CSS

Le projet utilise Tailwind CSS pour le styling. La configuration est dans `tailwind.config.js`.

### TypeScript

Le projet est entièrement typé avec TypeScript pour une meilleure maintenabilité.

### Pinia

Utilise Pinia pour la gestion d'état, notamment pour l'authentification.

## 📝 Scripts disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualise le build de production

## 🌐 Routes disponibles

| Route | Description | Auth requise |
|-------|-------------|--------------|
| `/login` | Page de connexion | Non |
| `/register` | Page d'inscription | Non |
| `/` | Dashboard | Oui |
| `/tickets` | Liste des tickets | Oui |
| `/tickets/:id` | Détails d'un ticket | Oui |
| `/sprints` | Liste des sprints | Oui |
| `/sprints/:id` | Détails d'un sprint | Oui |

## 🔐 Authentification

Le système utilise JWT pour l'authentification :
- Access token (15 minutes)
- Refresh token (7 jours)
- Auto-refresh automatique en cas d'expiration

## 🎨 Personnalisation

### Couleurs

Les couleurs principales sont configurées dans Tailwind et utilisent la palette Indigo :
- Primary: `indigo-600`
- Hover: `indigo-700`

### Status des tickets

Les couleurs des status sont définies dans les composants :
- To Do: Gris
- In Progress: Bleu
- Review: Jaune
- Test: Violet
- Test OK: Vert
- Production: Vert foncé

## 📦 Build de production

```bash
npm run build
```

Les fichiers de production seront dans le dossier `dist/`.

## 🚢 Déploiement

Le projet peut être déployé sur :
- Vercel
- Netlify
- GitHub Pages
- Ou tout autre hébergeur supportant les applications Vue.js

## ⚙️ Variables d'environnement

| Variable | Description | Par défaut |
|----------|-------------|------------|
| `VITE_API_BASE_URL` | URL de l'API backend | `http://localhost:3000/api` |

## 🐛 Dépannage

### Erreur de connexion à l'API

Vérifiez que :
1. Le backend est bien lancé sur le port 3000
2. L'URL dans `.env` est correcte
3. CORS est bien configuré sur le backend

### Erreur d'authentification

Si vous rencontrez des erreurs d'authentification :
1. Supprimez les tokens du localStorage
2. Reconnectez-vous

## 📚 Technologies utilisées

- **Vue 3** - Framework JavaScript
- **TypeScript** - Typage statique
- **Vite** - Build tool
- **Vue Router** - Routing
- **Pinia** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

## 👥 Contribution

Pour contribuer au projet :
1. Fork le repository
2. Créez une branche pour votre feature
3. Committez vos changements
4. Pushez vers la branche
5. Ouvrez une Pull Request