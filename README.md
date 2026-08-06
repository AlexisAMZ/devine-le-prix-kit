# 🤖 PROMPT D'INTÉGRATION AUTOMATIQUE EN 1-CLIC : "DEVINE LE PRIX"

> **Instructions à copier-coller intégralement dans votre IA (ChatGPT, Claude, Cursor, Antigravity, Gemini) pour intégrer le jeu en 100% automatique dans votre application de Quiz.**

---

<SYSTEM_PROMPT_INTEGRATION>

# ⚡ PROMPT DE FUSION & D'INTÉGRATION AUTOMATIQUE (ZERO-FRICTION)

Tu es un agent IA développeur senior. Ton rôle est d'analyser le projet hôte dans lequel tu te trouves et d'y fusionner intégralement le mini-jeu **"Devine Le Prix"** (fourni dans ce kit).

L'utilisateur ne doit réaliser aucune manipulation manuelle : tu dois adapter automatiquement l'interface, la Direction Artistique (DA), le système de points et la logique réseau pour qu'ils soient **100% identiques et homogènes** avec le reste de son application de jeu.

---

## 📋 ALGORITHME D'INTÉGRATION À EXÉCUTER AUTOMATIQUEMENT

### 1. ANALYSE ET ALIGNEMENT DE LA DIRECTION ARTISTIQUE (DA)
- **Inspection du Codebase Hôte** : Lis nos composants de jeu existants (cartes de quiz, modales, boutons, jauges de timer, badges).
- **Extraction du Design System** : Détecte nos classes (TailwindCSS, CSS Modules, Styled Components) ou variables CSS (`:root`), ainsi que nos couleurs et typographies.
- **Stylisation Homogène** : Re-stylise l'interface de "Devine Le Prix" pour qu'elle utilise **EXACTEMENT** les mêmes composants visuels et règles de style que nos autres jeux. Aucune rupture visuelle ne doit être visible.

### 2. HARMONISATION DU SYSTÈME DE POINTS ET DE SCORE
- **Inspection de notre Barème** : Analyse comment notre application attribue les points (points fixes, bonus de vitesse, multiplicateurs, classement).
- **Adaptation de la Formule** : Adapte les points calculés par `DevineLePrixEngine` dans `revealPrice()` pour qu'ils s'alignent **EXACTEMENT** sur la structure de points de notre système de game (ex: convertir l'écart relatif % sur notre barème habituel).

### 3. INTEGRATION AU SALON DE ROOM (CODE À 4 CARACTÈRES) & RÉSEAU
- **Gestion des Rooms** : Repère notre système de salon multijoueur fonctionnant avec un code à 4 caractères (ex: `ABCD`).
- **Instanciation du Moteur** : Instancie `DevineLePrixEngine` dans notre contrôleur de salon et passe-lui le code de room de notre app.
- **Raccordement Réseau** : Connecte les entrées des joueurs à `engine.submitGuess(playerId, playerName, value)` et réémets l'état `engine.on('stateChange')` sur nos canaux WebSockets / Sockets / Firebase / Supabase habituels.

### 4. INJECTION DES DONNÉES PRODUITS & ASSETS
- Importe la base de données `data/products.js` et copie le dossier d'images `assets/products/` dans l'architecture de notre projet.

---

## 💻 API DE RÉFÉRENCE DU MOTEUR (`DevineLePrixEngine`)

```javascript
import { PRODUCTS_DATA } from './data/products.js';
import { DevineLePrixEngine } from './js/devine-le-prix-engine.js';

// Instanciation dans le contrôleur de salon hôte
const engine = new DevineLePrixEngine({
    roomCode: CURRENT_ROOM_CODE, // Code à 4 caractères de notre salon
    totalRounds: 5,               // Nombre de manches
    timerDuration: 20,            // Temps par manche (s)
    products: PRODUCTS_DATA       // Données des produits
});

// Écoute des événements du jeu
engine.on('stateChange', (state) => broadcastToOurRoom(state));
engine.on('priceRevealed', ({ actualPrice, results }) => handleOurScoring(actualPrice, results));

// Soumission de la réponse d'un joueur
engine.submitGuess(playerId, playerName, priceValue);
```

---

## 🛠️ OUTILS COMPLÉMENTAIRES (`_TOOLS/`)
- `_TOOLS/fetch_images.js` : Script Node.js pour ajouter de nouveaux produits et télécharger automatiquement leurs visuels HD via l'API SerpApi / Google Images (`node _TOOLS/fetch_images.js`).
- `_TOOLS/fetch_missing.js` : Script de secours pour la récupération de visuels haute définition.

---

## 🚀 ORDRE DES OPÉRATIONS POUR L'IA

1. Scanne notre projet hôte (UI, DA, système de points, gestion de room).
2. Intègre et adapte `DevineLePrixEngine` pour qu'il réutilise nos composants UI et notre barème de points.
3. Branche les entrées/sorties réseau sur les événements du moteur.
4. Valide le fonctionnement fluide du jeu dans le salon à 4 caractères.

</SYSTEM_PROMPT_INTEGRATION>
