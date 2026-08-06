/**
 * DevineLePrixEngine - Moteur de jeu autonome pour "Devine le Prix"
 * Conçu pour s'intégrer facilement dans n'importe quel système de Quiz / Room.
 * Sans aucune dépendance externe ni plateforme spécifique.
 */
export class DevineLePrixEngine {
    constructor(options = {}) {
        this.roomCode = (options.roomCode || "ABCD").toUpperCase();
        this.totalRounds = options.totalRounds || 5;
        this.timerDuration = options.timerDuration || 20; // secondes
        this.products = options.products || [];
        
        // Callbacks d'événements
        this.listeners = {
            stateChange: [],
            roundStart: [],
            timerTick: [],
            guessReceived: [],
            priceRevealed: [],
            gameOver: []
        };

        if (options.onStateChange) this.on('stateChange', options.onStateChange);

        // État interne du jeu
        this.currentRound = 0;
        this.currentItem = null;
        this.deck = [];
        this.guesses = new Map(); // playerId -> { playerId, playerName, guess, timestamp }
        this.scores = new Map();  // playerId -> { playerName, totalScore, roundResults: [] }
        this.isRoundActive = false;
        this.isRevealed = false;
        this.timeRemaining = this.timerDuration;
        this.timerInterval = null;
    }

    /**
     * S'abonner à un événement du moteur
     * @param {'stateChange'|'roundStart'|'timerTick'|'guessReceived'|'priceRevealed'|'gameOver'} event 
     * @param {Function} fn 
     */
    on(event, fn) {
        if (this.listeners[event]) {
            this.listeners[event].push(fn);
        }
    }

    /**
     * Déclencher un événement
     */
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(fn => fn(data, this.getState()));
        }
    }

    /**
     * Obtenir l'état complet du jeu à tout moment
     */
    getState() {
        return {
            roomCode: this.roomCode,
            currentRound: this.currentRound,
            totalRounds: this.totalRounds,
            timeRemaining: this.timeRemaining,
            isRoundActive: this.isRoundActive,
            isRevealed: this.isRevealed,
            currentItem: this.currentItem ? {
                id: this.currentItem.id,
                name: this.currentItem.name,
                img: this.currentItem.img,
                description: this.currentItem.description || null,
                price: this.isRevealed ? this.currentItem.price : null // Masqué si non révélé
            } : null,
            guesses: Array.from(this.guesses.values()),
            scores: Array.from(this.scores.values()).sort((a, b) => b.totalScore - a.totalScore)
        };
    }

    /**
     * Mettre à jour le code de salle (ex: 4 caractères)
     */
    setRoomCode(code) {
        this.roomCode = String(code).toUpperCase().slice(0, 4);
        this.emit('stateChange');
    }

    /**
     * Initialiser et démarrer une nouvelle partie
     */
    startGame() {
        if (!this.products || this.products.length === 0) {
            console.error("DevineLePrixEngine: Aucune liste de produits fournie.");
            return;
        }

        // Mélanger les produits
        this.deck = [...this.products].sort(() => Math.random() - 0.5);
        this.currentRound = 0;
        this.scores.clear();
        this.nextRound();
    }

    /**
     * Passer à la manche suivante
     */
    nextRound() {
        this.stopTimer();

        if (this.currentRound >= this.totalRounds || this.deck.length === 0) {
            this.isRoundActive = false;
            this.emit('gameOver', this.getState());
            this.emit('stateChange');
            return;
        }

        this.currentRound++;
        this.currentItem = this.deck.pop();
        this.guesses.clear();
        this.isRoundActive = true;
        this.isRevealed = false;
        this.timeRemaining = this.timerDuration;

        this.startTimer();
        this.emit('roundStart', this.getState());
        this.emit('stateChange');
    }

    /**
     * Soumettre une proposition de prix pour un joueur
     */
    submitGuess(playerId, playerName, value) {
        if (!this.isRoundActive || this.isRevealed) return false;

        const numericGuess = parseFloat(value);
        if (isNaN(numericGuess) || numericGuess < 0) return false;

        const guessData = {
            playerId: String(playerId),
            playerName: String(playerName),
            guess: numericGuess,
            timestamp: Date.now()
        };

        this.guesses.set(String(playerId), guessData);

        // Initialiser les stats du joueur si absent
        if (!this.scores.has(String(playerId))) {
            this.scores.set(String(playerId), {
                playerId: String(playerId),
                playerName: String(playerName),
                totalScore: 0,
                roundResults: []
            });
        }

        this.emit('guessReceived', guessData);
        this.emit('stateChange');
        return true;
    }

    /**
     * Révéler le prix réel et calculer les points
     */
    revealPrice() {
        if (!this.currentItem || this.isRevealed) return;

        this.stopTimer();
        this.isRoundActive = false;
        this.isRevealed = true;

        const actualPrice = this.currentItem.price;
        const results = [];

        // Calcul des points basé sur l'écart relatif (pourcentage de précision)
        this.guesses.forEach((g) => {
            const diff = Math.abs(g.guess - actualPrice);
            const percentDiff = (diff / actualPrice) * 100;
            
            // Système de points : 1000 pts max si prix exact, dégressif selon l'erreur %
            let pointsEarned = 0;
            if (percentDiff === 0) {
                pointsEarned = 1000; // Prix exact !
            } else if (percentDiff <= 5) {
                pointsEarned = 850;
            } else if (percentDiff <= 15) {
                pointsEarned = 600;
            } else if (percentDiff <= 30) {
                pointsEarned = 350;
            } else if (percentDiff <= 50) {
                pointsEarned = 150;
            }

            const playerScore = this.scores.get(g.playerId);
            if (playerScore) {
                playerScore.totalScore += pointsEarned;
                playerScore.roundResults.push({
                    round: this.currentRound,
                    guess: g.guess,
                    actualPrice: actualPrice,
                    diff: diff,
                    points: pointsEarned
                });
            }

            results.push({
                playerId: g.playerId,
                playerName: g.playerName,
                guess: g.guess,
                diff: diff,
                points: pointsEarned
            });
        });

        this.emit('priceRevealed', {
            actualPrice: actualPrice,
            results: results.sort((a, b) => a.diff - b.diff)
        });
        this.emit('stateChange');
    }

    /**
     * Démarrer le décompte du timer
     */
    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.emit('timerTick', { timeRemaining: this.timeRemaining });
            this.emit('stateChange');

            if (this.timeRemaining <= 0) {
                this.stopTimer();
                this.revealPrice();
            }
        }, 1000);
    }

    /**
     * Arrêter le timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Réinitialiser complètement le jeu
     */
    resetGame() {
        this.stopTimer();
        this.currentRound = 0;
        this.currentItem = null;
        this.guesses.clear();
        this.scores.clear();
        this.isRoundActive = false;
        this.isRevealed = false;
        this.emit('stateChange');
    }
}

if (typeof window !== 'undefined') {
    window.DevineLePrixEngine = DevineLePrixEngine;
}
