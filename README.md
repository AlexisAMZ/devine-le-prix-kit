# 🤖 INSTRUCTIONS D'INTÉGRATION IA : JEU "DEVINE LE PRIX"

> **Instructions à copier-coller directement dans votre IA (ChatGPT, Claude, Cursor, Antigravity, Gemini) pour intégrer ce jeu dans votre application de Quiz à Code de Salon.**

---

<SYSTEM_PROMPT_INTEGRATION>

## 🎯 OBJECTIF DE L'AGENT IA
Tu es un assistant virtuel expert en développement Web. Ton objectif est d'intégrer le jeu **"Devine Le Prix"** (fourni dans ce kit) dans notre application de Quiz existante. 

Notre application utilise un système de salon multijoueur identifié par un **code de salle à 4 caractères** (ex: `ABCD` ou `8F2K`).

---

## 📁 FICHIERS ET STRUCTURE DU KIT À UTILISER
- `js/devine-le-prix-engine.js` : Moteur de jeu pur en classe JavaScript (`DevineLePrixEngine`).
- `data/products.js` : Tableau d'objets des 50+ produits (`id`, `name`, `price`, `img`).
- `assets/products/` : Dossier contenant l'ensemble des photos HD des produits.
- `css/devine-le-prix.css` : Feuille de style du jeu avec variables CSS (Design Tokens).
- `js/audio-manager.js` : Synthétiseur d'effets sonores Web Audio API (sans fichiers MP3).
- `_TOOLS/` : Scripts Node.js d'automatisation pour générer et télécharger de nouveaux visuels de produits.
- `index.html` : Démo de référence du composant d'affichage.

---

## 🛠️ OUTILS ET SCRIPTS D'AUTOMATISATION (`_TOOLS/`)

Le dossier `_TOOLS/` contient des utilitaires Node.js permettant d'étendre facilement la base de produits :

1. **`_TOOLS/fetch_images.js`** :
   - **Rôle** : Script d'acquisition automatique d'images HD via l'API SerpApi (Google Images / Shopping).
   - **Fonctionnement** : Lit la liste des produits avec leurs requêtes de recherche et télécharge directement les images dans `assets/products/`.
   - **Utilisation** :
     ```bash
     node _TOOLS/fetch_images.js
     ```
   - **Ajout de nouveaux produits** : Ajouter simplement un objet `{ name: "Nom", query: "Recherche Google", price: 100 }` dans le tableau `products` du script.

2. **`_TOOLS/fetch_missing.js`** :
   - **Rôle** : Script de secours ciblé pour récupérer des fonds et visuels haute résolution specifiques.
   - **Utilisation** :
     ```bash
     node _TOOLS/fetch_missing.js
     ```

---

## ⚙️ INSTRUCTIONS DE BRANCHEMENT TECHNIQUE

### 1. Instanciation du Moteur de Jeu
Dans le composant ou module de gestion de salon de notre application :

```javascript
import { PRODUCTS_DATA } from './data/products.js';
import { DevineLePrixEngine } from './js/devine-le-prix-engine.js';

// Instancier le moteur avec le code de salle à 4 caractères de notre app
const engine = new DevineLePrixEngine({
    roomCode: CURRENT_ROOM_CODE, // Code à 4 caractères de la room actuelle (ex: "4F9B")
    totalRounds: 5,               // Nombre de manches souhaité
    timerDuration: 20,            // Durée par manche (secondes)
    products: PRODUCTS_DATA       // Liste des produits
});
```

### 2. Gestion des Soumissions de Prix (Réseau / WebSockets)
Lorsque les joueurs envoient leur réponse depuis notre interface ou backend :

```javascript
// À la réception de l'estimation d'un joueur
function handlePlayerGuess(playerId, playerName, guessedPrice) {
    // Transmettre la saisie au moteur
    engine.submitGuess(playerId, playerName, parseFloat(guessedPrice));
}
```

### 3. Synchronisation d'État avec Notre Application
Écoute l'événement `stateChange` émis par le moteur pour mettre à jour l'UI ou diffuser l'état de la salle à tous les clients connectés :

```javascript
engine.on('stateChange', (state) => {
    // state contient : roomCode, currentRound, totalRounds, timeRemaining, isRoundActive, isRevealed, currentItem, guesses, scores
    
    // Diffusion aux clients de la room (ex: WebSockets / State Management)
    broadcastToRoom(state.roomCode, 'GAME_STATE_UPDATED', state);
});

// Événement déclenché à la fin du décompte ou de la manche
engine.on('priceRevealed', ({ actualPrice, results }) => {
    // actualPrice : Prix réel de l'objet
    // results : Tableau ordonné des écarts et points attribués aux joueurs
    showRoundResults(actualPrice, results);
});
```

---

## 🎨 ADAPTATION À NOTRE CHARTE GRAPHIQUE (DESIGN AUTHORITY)

Pour que le jeu adopte automatiquement la Direction Artistique (DA) de notre projet, surcharge les variables CSS suivantes avec les tokens de notre Design System :

```css
:root {
    /* Adapter avec les couleurs de notre application */
    --dlp-primary-color: var(--my-app-primary, #6366f1);
    --dlp-primary-hover: var(--my-app-primary-dark, #4f46e5);
    --dlp-accent-color: var(--my-app-success, #10b981);
    
    /* Adapter avec les fonds et typographies de notre application */
    --dlp-bg-main: var(--my-app-bg, #0f172a);
    --dlp-bg-card: var(--my-app-card-bg, #1e293b);
    --dlp-font-family: var(--my-app-font, 'Inter', sans-serif);
    --dlp-border-radius: var(--my-app-radius, 12px);
}
```

---

## 🚀 ÉTAPES D'INTÉGRATION À RÉALISER PAR L'IA

1. Copie les dossiers `assets/products/`, `data/` et `js/devine-le-prix-engine.js` dans notre projet.
2. Déclare et instancie `DevineLePrixEngine` dans le contrôleur de salon multijoueur.
3. Raccorde les entrées utilisateurs de notre formulaire de quiz vers `engine.submitGuess()`.
4. Mappe les variables CSS de `devine-le-prix.css` sur la charte graphique de notre application.
5. Vérifie que le code de salon à 4 caractères s'affiche correctement dans l'en-tête.

</SYSTEM_PROMPT_INTEGRATION>
