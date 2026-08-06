# 🤖 INSTRUCTIONS D'INTÉGRATION IA : JEU "DEVINE LE PRIX"

> **Instructions à copier-coller directement dans votre IA (ChatGPT, Claude, Cursor, Antigravity, Gemini) pour intégrer ce jeu dans votre application de Quiz à Code de Salon.**

---

<SYSTEM_PROMPT_INTEGRATION>

## 🎯 OBJECTIF DE L'AGENT IA
Tu es un assistant virtuel expert en développement Web. Ton objectif est d'analyser le projet hôte et d'intégrer le jeu **"Devine Le Prix"** (fourni dans ce kit) dans notre application de Quiz existante. 

Notre application utilise un système de salon multijoueur identifié par un **code de salle à 4 caractères** (ex: `ABCD` ou `8F2K`).

---

## 🎨 DIRECTIVE OBLIGATOIRE : ADAPTATION AUTOMATIQUE DE LA DIRECTION ARTISTIQUE (DA)

> **MANDAT AUTOMATIQUE POUR L'IA D'INTÉGRATION :**
> Avant d'injecter l'interface du jeu, tu DOIS obligatoirement lire et analyser les fichiers de style du projet hôte (ex: `global.css`, `tailwind.config.js`, variables `:root`, polices Google Fonts, thèmes sombres/clairs).
> 
> **Actions automatiques à exécuter :**
> 1. Détecte la palette de couleurs principale (Primary), secondaire, d'accentuation (Success/Warning), la typographie de titre/corps et les rayons de bordure (`border-radius`) du projet hôte.
> 2. Mappe automatiquement ces valeurs sur les variables CSS de `css/devine-le-prix.css` (ou convertis-les en classes Tailwind / CSS-in-JS selon le framework utilisé).
> 3. Ajuste visuellement le composant pour qu'il semble avoir été développé sur-mesure pour l'application hôte, sans aucune rupture visuelle ni incohérence de style.

---

## 📁 FICHIERS ET STRUCTURE DU KIT À UTILISER
- `js/devine-le-prix-engine.js` : Moteur de jeu pur en classe JavaScript (`DevineLePrixEngine`).
- `data/products.js` : Tableau d'objets des 50+ produits (`id`, `name`, `price`, `img`).
- `assets/products/` : Dossier contenant l'ensemble des photos HD des produits.
- `css/devine-le-prix.css` : Feuille de style du jeu avec variables CSS (Design Tokens).
- `js/audio-manager.js` : Synthétiseur d'effets sonores Web Audio API (sans fichiers MP3).
- `_TOOLS/` : Scripts Node.js d'automatisation pour générer et télécharger de nouveaux visuels de produits via SerpApi.
- `index.html` : Démo de référence du composant d'affichage.

---

## 🛠️ OUTILS ET SCRIPTS D'AUTOMATISATION (`_TOOLS/`)

Le dossier `_TOOLS/` contient des utilitaires Node.js permettant d'étendre facilement la base de produits :

1. **`_TOOLS/fetch_images.js`** :
   - **Rôle** : Script d'acquisition automatique d'images HD via l'API SerpApi (Google Images / Shopping).
   - **Utilisation** : `node _TOOLS/fetch_images.js`
   - **Ajout de nouveaux produits** : Ajouter un objet `{ name: "Nom", query: "Recherche Google", price: 100 }` dans le tableau `products` du script.

2. **`_TOOLS/fetch_missing.js`** :
   - **Rôle** : Script de secours ciblé pour récupérer des visuels spécifiques haute résolution.
   - **Utilisation** : `node _TOOLS/fetch_missing.js`

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

## 🎨 MAPPAGE DES TOKENS DE DESIGN (ADAPTATION DA)

Exemple de mappage automatique des variables CSS sur le thème de notre projet :

```css
:root {
    /* Mappage automatique sur les variables de notre application */
    --dlp-primary-color: var(--app-primary, #6366f1);
    --dlp-primary-hover: var(--app-primary-hover, #4f46e5);
    --dlp-accent-color: var(--app-success, #10b981);
    
    --dlp-bg-main: var(--app-background, #0f172a);
    --dlp-bg-card: var(--app-surface, #1e293b);
    --dlp-font-family: var(--app-font-family, 'Inter', sans-serif);
    --dlp-border-radius: var(--app-radius-lg, 12px);
}
```

---

## 🚀 ÉTAPES D'INTÉGRATION À RÉALISER PAR L'IA

1. **Analyse DA** : Lis la charte graphique du projet hôte et mappe la feuille de style du jeu dessus.
2. **Copie des Fichiers** : Copie les dossiers `assets/products/`, `data/` et `js/devine-le-prix-engine.js` dans le projet.
3. **Contrôleur de Salon** : Déclare et instancie `DevineLePrixEngine` avec le `roomCode` à 4 caractères.
4. **Binding Réseau** : Raccorde les soumissions de prix des joueurs vers `engine.submitGuess()`.
5. **Vérification UI** : Valide l'affichage harmonieux du composant et du code de salle.

</SYSTEM_PROMPT_INTEGRATION>
