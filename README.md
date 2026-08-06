# 📦 Kit d'Intégration Autonome : Jeu "Devine Le Prix"

Ce kit contient le moteur de jeu, la base de données de produits, les visuels et le système de style pour le jeu **Devine Le Prix**. Il est 100% autonome, sans dépendances externes (pas de Twitch, pas de TMI.js, pas de SDK propriétaire), et est conçu pour s'intégrer directement dans un système de Quiz multijoueur existant basé sur des **codes de salon à 4 caractères** (ex: `ABCD` ou `4F9B`).

---

## 🤖 Instructions Spécifiques pour l'IA d'Intégration

> **Message destiné à l'Agent IA / Assistant qui intègre ce jeu dans l'application cible :**

```
CONTEXTE ET DIRECTIVES D'INTÉGRATION :
1. Ce kit fournit une classe JS autonome 'DevineLePrixEngine' située dans `js/devine-le-prix-engine.js`.
2. Ne modifie pas la logique interne du moteur sauf si nécessaire. Utilise l'API d'événements `engine.on(event, callback)` pour lier le jeu au backend/state de ton application.
3. Code de Salle : Le moteur gère nativement le code de salon à 4 caractères via `roomCode` (passé au constructeur ou mis à jour via `engine.setRoomCode("ABCD")`).
4. Connexion Réseau (WebSockets / Sockets) :
   - Côté Serveur/Host : Instancie `DevineLePrixEngine`. Lors des soumissions de prix par les joueurs via ton réseau, appelle `engine.submitGuess(playerId, playerName, value)`.
   - À chaque événement `engine.on('stateChange', state)`, réémets `state` aux clients de la room.
5. Adaptation Visuelle (DA / UI) :
   - N'écrase pas la structure HTML si ce n'est pas nécessaire.
   - Modifie uniquement les variables CSS de `css/devine-le-prix.css` (--dlp-primary-color, --dlp-font-family, --dlp-bg-main, --dlp-border-radius) pour mapper les couleurs et la typographie sur la Charte Graphique (DA) de ton application.
```

---

## 📂 Structure du Kit

```
devine-le-prix-kit/
├── assets/
│   └── products/           # Visuels optimisés des produits (images HD)
├── data/
│   └── products.js         # Tableau JSON/JS pur des 50+ produits (id, name, price, img)
├── css/
│   └── devine-le-prix.css  # Styles modulaires avec Design Tokens CSS
├── js/
│   ├── devine-le-prix-engine.js  # Moteur de jeu autonome (Event-Driven API)
│   └── audio-manager.js          # Effets sonores Web Audio API (synthétiques, 0 fichier mp3)
├── index.html              # Démo d'intégration fonctionnelle et complète
└── README.md               # Le présent guide
```

---

## 💻 API du Moteur (`DevineLePrixEngine`)

### Constructeur & Configuration

```javascript
import { PRODUCTS_DATA } from './data/products.js';
import { DevineLePrixEngine } from './js/devine-le-prix-engine.js';

const engine = new DevineLePrixEngine({
    roomCode: "4F9B",        // Code de salle à 4 caractères
    totalRounds: 5,           // Nombre de manches par partie
    timerDuration: 20,        // Décompte en secondes par manche
    products: PRODUCTS_DATA   // Tableau des produits à faire deviner
});
```

### Méthodes Publiques

| Méthode | Paramètres | Description |
| :--- | :--- | :--- |
| `setRoomCode(code)` | `code: string` | Définit ou met à jour le code de salon à 4 caractères. |
| `startGame()` | Aucun | Mélange le paquet de produits et lance la manche 1. |
| `nextRound()` | Aucun | Passe à la manche suivante ou termine la partie si le nombre max est atteint. |
| `submitGuess(playerId, playerName, value)` | `playerId, playerName, value` | Enregistre l'estimation d'un joueur pour la manche en cours. |
| `revealPrice()` | Aucun | Interrompt le timer, révèle le vrai prix et calcule le score selon l'écart %. |
| `getState()` | Aucun | Retourne l'objet d'état complet du jeu. |
| `resetGame()` | Aucun | Réinitialise l'état du jeu. |

### Événements (`engine.on(event, callback)`)

```javascript
engine.on('stateChange', (state) => {
    // Transmis à chaque changement d'état (timer, soumission, révélation)
    console.log("Nouvel état de la room:", state);
});

engine.on('roundStart', (state) => {
    console.log("Début de manche. Produit à deviner:", state.currentItem.name);
});

engine.on('timerTick', ({ timeRemaining }) => {
    console.log("Secondes restantes:", timeRemaining);
});

engine.on('priceRevealed', ({ actualPrice, results }) => {
    console.log("Prix réel:", actualPrice, "Résultats des joueurs:", results);
});

engine.on('gameOver', (finalState) => {
    console.log("Partie terminée ! Classement final:", finalState.scores);
});
```

---

## 🔌 Intégration Réseau (WebSockets / Backend Quiz)

### 1. Côté Serveur / Host de la Room

```javascript
// Quand un joueur envoie sa réponse via WebSocket
socket.on('SUBMIT_GUESS', (payload) => {
    // payload = { playerId: "usr_123", playerName: "Alex", guess: 450 }
    engine.submitGuess(payload.playerId, payload.playerName, payload.guess);
});

// Écouter les changements d'état du moteur et diffuser à la room
engine.on('stateChange', (state) => {
    io.to(state.roomCode).emit('ROOM_STATE_UPDATE', state);
});
```

### 2. Côté Client / UI Joueur

```javascript
// Réception de l'état envoyé par le serveur
socket.on('ROOM_STATE_UPDATE', (state) => {
    document.getElementById('room-code').textContent = state.roomCode;
    document.getElementById('product-title').textContent = state.currentItem.name;
    document.getElementById('product-img').src = state.currentItem.img;
    
    if (state.isRevealed) {
        document.getElementById('price-display').textContent = state.currentItem.price + " €";
    }
});
```

---

## 🎨 Adaptation de la Charte Graphique (DA)

Pour personnaliser l'apparence selon la Direction Artistique de l'application hôte, modifiez les tokens CSS dans votre propre fichier ou au sommet de `css/devine-le-prix.css` :

```css
:root {
    /* Couleurs principales */
    --dlp-primary-color: #6366f1;   /* Couleur d'action principale */
    --dlp-primary-hover: #4f46e5;   /* État survol */
    --dlp-accent-color: #10b981;    /* Couleur de réussite / Prix révélé */
    
    /* Arrière-plan & Cartes */
    --dlp-bg-main: #0f172a;         /* Fond d'écran */
    --dlp-bg-card: #1e293b;         /* Fond des cartes */
    --dlp-border-color: #334155;     /* Bordures */
    
    /* Typographie & Rayon */
    --dlp-font-family: 'Inter', sans-serif;
    --dlp-border-radius: 12px;
}
```

---

## 📋 Données d'un Produit (`data/products.js`)

Chaque objet produit respecte la structure suivante :

```javascript
{
    id: "ps5-pro",
    name: "PlayStation 5 Pro Digital",
    price: 799.99,
    img: "assets/products/playstation_5_pro_digital.jpg",
    description: "Optionnel : description courte"
}
```
