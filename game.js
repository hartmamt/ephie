// Game Constants
const CARD_TYPES = {
    NUMBER: 'number',
    SKIP: 'skip',
    REVERSE: 'reverse',
    DRAW: 'draw',
    WILD: 'wild',
    FLIP: 'flip'
};

const LIGHT_COLORS = ['red', 'blue', 'green', 'yellow'];
const DARK_COLORS = ['pink', 'teal', 'orange', 'purple'];

// Card Class
class Card {
    constructor(value, type, lightColor, darkColor) {
        this.value = value;
        this.type = type;
        this.lightColor = lightColor;
        this.darkColor = darkColor;
        this.id = Math.random().toString(36).substr(2, 9);
    }

    getColor(isDarkSide) {
        return isDarkSide ? this.darkColor : this.lightColor;
    }

    getDisplayValue(isDarkSide) {
        if (this.type === CARD_TYPES.NUMBER) {
            return isDarkSide && this.value < 5 ? this.value + 5 : this.value;
        }
        return this.type.toUpperCase();
    }

    getDisplaySymbol(isDarkSide) {
        const val = this.getDisplayValue(isDarkSide);
        if (this.type === CARD_TYPES.NUMBER) return val;

        const symbols = {
            'SKIP': '🚫',
            'REVERSE': '🔄',
            'DRAW': isDarkSide ? '📥+5' : '📥+1',
            'WILD': '🌈',
            'FLIP': '🔃'
        };
        return symbols[val] || val;
    }

    clone() {
        return new Card(this.value, this.type, this.lightColor, this.darkColor);
    }
}

// Deck Class
class Deck {
    constructor() {
        this.cards = [];
        this.initializeDeck();
        this.shuffle();
    }

    initializeDeck() {
        // Create number cards (0-9) for each color
        for (let i = 0; i < 4; i++) {
            const lightColor = LIGHT_COLORS[i];
            const darkColor = DARK_COLORS[i];

            // 0 appears once, 1-9 appear twice
            this.cards.push(new Card(0, CARD_TYPES.NUMBER, lightColor, darkColor));

            for (let num = 1; num <= 9; num++) {
                this.cards.push(new Card(num, CARD_TYPES.NUMBER, lightColor, darkColor));
                this.cards.push(new Card(num, CARD_TYPES.NUMBER, lightColor, darkColor));
            }

            // Special cards - 2 of each per color
            for (let j = 0; j < 2; j++) {
                this.cards.push(new Card(null, CARD_TYPES.SKIP, lightColor, darkColor));
                this.cards.push(new Card(null, CARD_TYPES.REVERSE, lightColor, darkColor));
                this.cards.push(new Card(null, CARD_TYPES.DRAW, lightColor, darkColor));
            }
        }

        // Wild cards - 4 of each
        for (let i = 0; i < 4; i++) {
            this.cards.push(new Card(null, CARD_TYPES.WILD, 'wild', 'wild'));
            this.cards.push(new Card(null, CARD_TYPES.FLIP, 'wild', 'wild'));
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw() {
        if (this.cards.length === 0) {
            return null;
        }
        return this.cards.pop();
    }

    addCard(card) {
        this.cards.unshift(card);
    }

    isEmpty() {
        return this.cards.length === 0;
    }

    count() {
        return this.cards.length;
    }
}

// Player Class
class Player {
    constructor(name, isHuman = false) {
        this.name = name;
        this.hand = [];
        this.isHuman = isHuman;
        this.score = 0;
    }

    addCard(card) {
        this.hand.push(card);
    }

    removeCard(cardId) {
        const index = this.hand.findIndex(c => c.id === cardId);
        if (index !== -1) {
            return this.hand.splice(index, 1)[0];
        }
        return null;
    }

    removeCards(cardIds) {
        return cardIds.map(id => this.removeCard(id)).filter(c => c !== null);
    }

    sortHand(isDarkSide) {
        this.hand.sort((a, b) => {
            const colorA = a.getColor(isDarkSide);
            const colorB = b.getColor(isDarkSide);

            if (colorA !== colorB) {
                return colorA.localeCompare(colorB);
            }

            const valA = a.type === CARD_TYPES.NUMBER ? a.getDisplayValue(isDarkSide) : 100;
            const valB = b.type === CARD_TYPES.NUMBER ? b.getDisplayValue(isDarkSide) : 100;

            return valA - valB;
        });
    }

    hasCards() {
        return this.hand.length > 0;
    }

    getCardCount() {
        return this.hand.length;
    }
}

// Game Class
class Game {
    constructor(playerCount) {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.direction = 1; // 1 for clockwise, -1 for counter-clockwise
        this.deck = new Deck();
        this.discardPile = [];
        this.melds = [];
        this.isDarkSide = false;
        this.hasDrawnThisTurn = false;
        this.selectedCards = [];
        this.gameStarted = false;

        this.initializePlayers(playerCount);
        this.dealCards();
    }

    initializePlayers(count) {
        this.players.push(new Player('You', true));
        for (let i = 1; i < count; i++) {
            this.players.push(new Player(`Player ${i + 1}`, false));
        }
    }

    dealCards() {
        // Deal 7 cards to each player
        for (let i = 0; i < 7; i++) {
            this.players.forEach(player => {
                const card = this.deck.draw();
                if (card) player.addCard(card);
            });
        }
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + this.players.length) % this.players.length;
        this.hasDrawnThisTurn = false;
        this.selectedCards = [];
    }

    reverseDirection() {
        this.direction *= -1;
    }

    flipDeck() {
        this.isDarkSide = !this.isDarkSide;
        showMessage(`🔃 FLIP! The deck is now ${this.isDarkSide ? 'DARK' : 'LIGHT'}!`, 2000);
    }

    drawCard(player) {
        if (this.deck.isEmpty()) {
            this.reshuffleDiscardPile();
        }

        const card = this.deck.draw();
        if (card) {
            player.addCard(card);
            return card;
        }
        return null;
    }

    reshuffleDiscardPile() {
        if (this.discardPile.length > 1) {
            const topCard = this.discardPile.pop();
            this.discardPile.forEach(card => this.deck.addCard(card));
            this.discardPile = [topCard];
            this.deck.shuffle();
            showMessage('Reshuffling discard pile into deck...', 1500);
        }
    }

    discard(player, card) {
        this.discardPile.push(card);
        this.hasDrawnThisTurn = false;
    }

    // Meld validation
    isValidSet(cards) {
        if (cards.length < 3) return false;

        const value = cards[0].type === CARD_TYPES.NUMBER ? cards[0].value : null;
        if (value === null) return false;

        const colors = new Set();
        for (const card of cards) {
            if (card.type !== CARD_TYPES.NUMBER || card.value !== value) {
                return false;
            }
            const color = card.getColor(this.isDarkSide);
            if (colors.has(color)) {
                return false; // Duplicate color
            }
            colors.add(color);
        }

        return true;
    }

    isValidRun(cards) {
        if (cards.length < 3) return false;

        // All cards must be same color
        const color = cards[0].getColor(this.isDarkSide);
        for (const card of cards) {
            if (card.type !== CARD_TYPES.NUMBER || card.getColor(this.isDarkSide) !== color) {
                return false;
            }
        }

        // Sort by value
        const sorted = [...cards].sort((a, b) => {
            return a.getDisplayValue(this.isDarkSide) - b.getDisplayValue(this.isDarkSide);
        });

        // Check for consecutive values
        for (let i = 1; i < sorted.length; i++) {
            const prevVal = sorted[i - 1].getDisplayValue(this.isDarkSide);
            const currVal = sorted[i].getDisplayValue(this.isDarkSide);
            if (currVal !== prevVal + 1) {
                return false;
            }
        }

        return true;
    }

    isValidMeld(cards) {
        return this.isValidSet(cards) || this.isValidRun(cards);
    }

    getMeldType(cards) {
        if (this.isValidSet(cards)) return 'SET';
        if (this.isValidRun(cards)) return 'RUN';
        return null;
    }

    playMeld(player, cards) {
        if (!this.isValidMeld(cards)) {
            return false;
        }

        const meld = {
            cards: cards,
            type: this.getMeldType(cards),
            player: player.name
        };

        this.melds.push(meld);
        return true;
    }

    // Special card effects
    handleSpecialCard(card) {
        const type = card.type;

        switch (type) {
            case CARD_TYPES.SKIP:
                if (this.isDarkSide) {
                    // Skip all other players
                    showMessage('🚫 SKIP ALL! You get another turn!', 2000);
                    return;
                } else {
                    // Skip next player
                    showMessage('🚫 Next player skipped!', 1500);
                    this.nextPlayer();
                }
                break;

            case CARD_TYPES.REVERSE:
                this.reverseDirection();
                showMessage('🔄 Direction reversed!', 1500);
                break;

            case CARD_TYPES.DRAW:
                const drawCount = this.isDarkSide ? 5 : 1;
                this.nextPlayer();
                const nextPlayer = this.getCurrentPlayer();
                for (let i = 0; i < drawCount; i++) {
                    this.drawCard(nextPlayer);
                }
                showMessage(`📥 ${nextPlayer.name} draws ${drawCount} card${drawCount > 1 ? 's' : ''}!`, 2000);
                return; // Don't advance turn again

            case CARD_TYPES.FLIP:
                this.flipDeck();
                break;

            case CARD_TYPES.WILD:
                showMessage('🌈 Wild card played!', 1500);
                break;
        }
    }

    checkWinner() {
        for (const player of this.players) {
            if (!player.hasCards()) {
                return player;
            }
        }
        return null;
    }

    // AI Logic for computer players
    aiTurn(player) {
        // Draw a card
        this.drawCard(player);

        // Try to play a meld
        const possibleMelds = this.findPossibleMelds(player);
        if (possibleMelds.length > 0) {
            const meld = possibleMelds[0];
            const cards = meld.cardIds.map(id => player.hand.find(c => c.id === id));
            if (this.playMeld(player, cards)) {
                player.removeCards(meld.cardIds);
            }
        }

        // Discard a card (prefer special cards or high numbers)
        let cardToDiscard = player.hand.find(c => c.type !== CARD_TYPES.NUMBER) || player.hand[0];
        player.removeCard(cardToDiscard.id);
        this.discard(player, cardToDiscard);

        // Handle special card effects
        if (cardToDiscard.type !== CARD_TYPES.NUMBER) {
            this.handleSpecialCard(cardToDiscard);
        }
    }

    findPossibleMelds(player) {
        const melds = [];
        const hand = player.hand;

        // Check all combinations of 3+ cards
        for (let i = 0; i < hand.length - 2; i++) {
            for (let j = i + 1; j < hand.length - 1; j++) {
                for (let k = j + 1; k < hand.length; k++) {
                    const cards = [hand[i], hand[j], hand[k]];
                    if (this.isValidMeld(cards)) {
                        melds.push({
                            cardIds: [hand[i].id, hand[j].id, hand[k].id],
                            type: this.getMeldType(cards)
                        });
                    }

                    // Try with 4 cards
                    for (let l = k + 1; l < hand.length; l++) {
                        const cards4 = [hand[i], hand[j], hand[k], hand[l]];
                        if (this.isValidMeld(cards4)) {
                            melds.push({
                                cardIds: [hand[i].id, hand[j].id, hand[k].id, hand[l].id],
                                type: this.getMeldType(cards4)
                            });
                        }
                    }
                }
            }
        }

        return melds;
    }
}

// UI Controller
let game = null;

function startGame() {
    const playerCount = parseInt(document.getElementById('player-count').value);
    game = new Game(playerCount);
    game.gameStarted = true;

    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';

    updateUI();
}

function updateUI() {
    if (!game) return;

    // Update game info
    document.getElementById('deck-side').textContent = game.isDarkSide ? '🌙 DARK' : '☀️ LIGHT';
    document.getElementById('deck-side').className = game.isDarkSide ? 'value dark-side' : 'value light-side';
    document.getElementById('current-player').textContent = game.getCurrentPlayer().name;
    document.getElementById('game-direction').textContent = game.direction === 1 ? '→' : '←';

    // Update player hand
    updatePlayerHand();

    // Update other players
    updateOtherPlayers();

    // Update melds
    updateMelds();

    // Update discard pile
    updateDiscardPile();

    // Update button states
    updateButtons();
}

function updatePlayerHand() {
    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = '';

    const humanPlayer = game.players.find(p => p.isHuman);
    if (!humanPlayer) return;

    humanPlayer.hand.forEach(card => {
        const cardElement = createCardElement(card, game.isDarkSide);
        cardElement.onclick = () => toggleCardSelection(card.id);

        if (game.selectedCards.includes(card.id)) {
            cardElement.classList.add('selected');
        }

        handContainer.appendChild(cardElement);
    });
}

function updateOtherPlayers() {
    const container = document.getElementById('other-players-container');
    container.innerHTML = '';

    game.players.forEach((player, index) => {
        if (!player.isHuman) {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'other-player';
            if (index === game.currentPlayerIndex) {
                playerDiv.classList.add('active');
            }

            const nameDiv = document.createElement('div');
            nameDiv.className = 'other-player-name';
            nameDiv.textContent = `${player.name} (${player.getCardCount()} cards)`;

            const cardsDiv = document.createElement('div');
            cardsDiv.className = 'other-player-cards';

            // Show card backs
            for (let i = 0; i < Math.min(player.getCardCount(), 5); i++) {
                const cardBack = document.createElement('div');
                cardBack.className = 'card back';
                cardsDiv.appendChild(cardBack);
            }

            playerDiv.appendChild(nameDiv);
            playerDiv.appendChild(cardsDiv);
            container.appendChild(playerDiv);
        }
    });
}

function updateMelds() {
    const container = document.getElementById('melds-container');
    container.innerHTML = '';

    if (game.melds.length === 0) {
        container.innerHTML = '<p style="color: #6c757d; text-align: center;">No melds played yet</p>';
        return;
    }

    game.melds.forEach((meld, index) => {
        const meldDiv = document.createElement('div');
        meldDiv.className = 'meld';

        const labelDiv = document.createElement('div');
        labelDiv.className = 'meld-label';
        labelDiv.textContent = `${meld.type} by ${meld.player}`;
        meldDiv.appendChild(labelDiv);

        meld.cards.forEach(card => {
            const cardElement = createCardElement(card, game.isDarkSide);
            cardElement.style.cursor = 'default';
            cardElement.onclick = null;
            meldDiv.appendChild(cardElement);
        });

        container.appendChild(meldDiv);
    });
}

function updateDiscardPile() {
    const pile = document.getElementById('discard-pile');
    pile.innerHTML = '<span class="pile-label">Discard Pile</span>';

    if (game.discardPile.length > 0) {
        const topCard = game.discardPile[game.discardPile.length - 1];
        const cardElement = createCardElement(topCard, game.isDarkSide);
        cardElement.style.cursor = 'default';
        cardElement.onclick = null;
        pile.appendChild(cardElement);
    }
}

function updateButtons() {
    const currentPlayer = game.getCurrentPlayer();
    const isHumanTurn = currentPlayer.isHuman;

    document.getElementById('draw-card-btn').disabled = !isHumanTurn || game.hasDrawnThisTurn;
    document.getElementById('play-meld-btn').disabled = !isHumanTurn || game.selectedCards.length < 3;
    document.getElementById('discard-btn').disabled = !isHumanTurn || !game.hasDrawnThisTurn || game.selectedCards.length !== 1;
}

function createCardElement(card, isDarkSide) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${card.getColor(isDarkSide)}`;
    cardDiv.dataset.cardId = card.id;

    const valueSpan = document.createElement('span');
    valueSpan.className = 'card-value';
    valueSpan.textContent = card.getDisplaySymbol(isDarkSide);

    cardDiv.appendChild(valueSpan);
    return cardDiv;
}

function toggleCardSelection(cardId) {
    const index = game.selectedCards.indexOf(cardId);
    if (index === -1) {
        game.selectedCards.push(cardId);
    } else {
        game.selectedCards.splice(index, 1);
    }
    updateUI();
}

function drawCardAction() {
    const currentPlayer = game.getCurrentPlayer();
    if (!currentPlayer.isHuman || game.hasDrawnThisTurn) return;

    game.drawCard(currentPlayer);
    game.hasDrawnThisTurn = true;
    updateUI();
}

function playMeldAction() {
    const currentPlayer = game.getCurrentPlayer();
    if (!currentPlayer.isHuman || game.selectedCards.length < 3) return;

    const selectedCardObjects = game.selectedCards.map(id =>
        currentPlayer.hand.find(c => c.id === id)
    );

    if (game.playMeld(currentPlayer, selectedCardObjects)) {
        currentPlayer.removeCards(game.selectedCards);
        game.selectedCards = [];
        showMessage('✅ Meld played successfully!', 1500);

        // Check for winner
        const winner = game.checkWinner();
        if (winner) {
            showMessage(`🎉 ${winner.name} wins!`, 5000);
            return;
        }
    } else {
        showMessage('❌ Invalid meld! Must be a SET (same number, different colors) or RUN (consecutive numbers, same color)', 2500);
    }

    updateUI();
}

function discardAction() {
    const currentPlayer = game.getCurrentPlayer();
    if (!currentPlayer.isHuman || !game.hasDrawnThisTurn || game.selectedCards.length !== 1) {
        if (game.selectedCards.length !== 1) {
            showMessage('❌ Select exactly 1 card to discard', 2000);
        }
        return;
    }

    const cardToDiscard = currentPlayer.hand.find(c => c.id === game.selectedCards[0]);
    currentPlayer.removeCard(cardToDiscard.id);
    game.discard(currentPlayer, cardToDiscard);

    // Handle special card effects
    if (cardToDiscard.type !== CARD_TYPES.NUMBER) {
        game.handleSpecialCard(cardToDiscard);
    }

    // Check for winner
    const winner = game.checkWinner();
    if (winner) {
        showMessage(`🎉 ${winner.name} wins the game!`, 5000);
        return;
    }

    // Move to next player
    game.nextPlayer();
    updateUI();

    // If next player is AI, play their turn
    setTimeout(() => {
        playAITurns();
    }, 1000);
}

function playAITurns() {
    if (!game.getCurrentPlayer().isHuman) {
        const currentPlayer = game.getCurrentPlayer();
        showMessage(`${currentPlayer.name}'s turn...`, 1000);

        setTimeout(() => {
            game.aiTurn(currentPlayer);

            // Check for winner
            const winner = game.checkWinner();
            if (winner) {
                showMessage(`🎉 ${winner.name} wins the game!`, 5000);
                updateUI();
                return;
            }

            game.nextPlayer();
            updateUI();

            // Continue if still AI turn
            if (!game.getCurrentPlayer().isHuman) {
                setTimeout(playAITurns, 1500);
            }
        }, 1000);
    }
}

function sortHandAction() {
    const humanPlayer = game.players.find(p => p.isHuman);
    if (humanPlayer) {
        humanPlayer.sortHand(game.isDarkSide);
        updateUI();
    }
}

function showMessage(text, duration = 2000) {
    const messageBox = document.getElementById('message-box');
    messageBox.innerHTML = `<div class="message-content">${text}</div>`;
    messageBox.classList.add('show');

    setTimeout(() => {
        messageBox.classList.remove('show');
    }, duration);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-game-btn').onclick = startGame;
    document.getElementById('draw-card-btn').onclick = drawCardAction;
    document.getElementById('play-meld-btn').onclick = playMeldAction;
    document.getElementById('discard-btn').onclick = discardAction;
    document.getElementById('sort-hand-btn').onclick = sortHandAction;

    // Draw pile click
    document.getElementById('draw-pile').onclick = drawCardAction;
});
