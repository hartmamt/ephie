// Socket.io connection
let socket;
let mySocketId;
let roomCode;
let playerName;
let gameState = null;
let selectedCards = [];

// Initialize socket connection when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeSocket();
    setupEventListeners();
});

function initializeSocket() {
    socket = io();

    socket.on('connect', () => {
        console.log('Connected to server');
        mySocketId = socket.id;
    });

    socket.on('roomCreated', (data) => {
        roomCode = data.roomCode;
        showWaitingRoom(roomCode);
        updateGameState(data.gameState);
    });

    socket.on('roomJoined', (data) => {
        roomCode = data.roomCode;
        showWaitingRoom(roomCode);
        updateGameState(data.gameState);
    });

    socket.on('playerJoined', (data) => {
        showMessage(`${data.playerName} joined the room`, 2000);
        updatePlayersList(data.players);
    });

    socket.on('playerLeft', (data) => {
        showMessage(`${data.playerName} left the room`, 2000);
    });

    socket.on('gameStarted', (data) => {
        showMessage(data.message, 2000);
    });

    socket.on('gameState', (data) => {
        updateGameState(data);
    });

    socket.on('message', (data) => {
        showMessage(data.text, 2000);
    });

    socket.on('gameOver', (data) => {
        showMessage(`🎉 ${data.winner} wins the game!`, 5000);
    });

    socket.on('error', (data) => {
        showMessage(`❌ ${data.message}`, 3000);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        showMessage('Disconnected from server', 3000);
    });
}

function setupEventListeners() {
    // Lobby screen
    document.getElementById('create-room-btn').onclick = createRoom;
    document.getElementById('join-room-btn').onclick = showJoinRoomForm;
    document.getElementById('join-room-submit').onclick = joinRoom;
    document.getElementById('join-room-cancel').onclick = hideJoinRoomForm;

    // Waiting room
    document.getElementById('start-game-btn').onclick = startGame;
    document.getElementById('leave-room-btn').onclick = leaveRoom;

    // Game actions
    document.getElementById('draw-card-btn').onclick = drawCard;
    document.getElementById('play-meld-btn').onclick = playMeld;
    document.getElementById('discard-btn').onclick = discardCard;
    document.getElementById('sort-hand-btn').onclick = sortHand;

    // Draw pile
    document.getElementById('draw-pile').onclick = drawCard;

    // Enter key handlers
    document.getElementById('player-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') createRoom();
    });

    document.getElementById('room-code-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') joinRoom();
    });
}

// Lobby functions
function createRoom() {
    playerName = document.getElementById('player-name').value.trim();
    if (!playerName) {
        showMessage('Please enter your name', 2000);
        return;
    }

    socket.emit('createRoom', playerName);
}

function showJoinRoomForm() {
    document.getElementById('join-room-btn').style.display = 'none';
    document.getElementById('create-room-btn').style.display = 'none';
    document.getElementById('join-room-form').style.display = 'block';
}

function hideJoinRoomForm() {
    document.getElementById('join-room-btn').style.display = 'block';
    document.getElementById('create-room-btn').style.display = 'block';
    document.getElementById('join-room-form').style.display = 'none';
}

function joinRoom() {
    playerName = document.getElementById('player-name').value.trim();
    const code = document.getElementById('room-code-input').value.trim().toUpperCase();

    if (!playerName) {
        showMessage('Please enter your name', 2000);
        return;
    }

    if (!code) {
        showMessage('Please enter a room code', 2000);
        return;
    }

    socket.emit('joinRoom', { roomCode: code, playerName });
}

function showWaitingRoom(code) {
    document.getElementById('lobby-screen').style.display = 'none';
    document.getElementById('waiting-room').style.display = 'block';
    document.getElementById('waiting-room-code').textContent = code;
    document.getElementById('room-code').textContent = code;
    document.getElementById('room-info').style.display = 'block';
}

function updatePlayersList(players) {
    const ul = document.getElementById('players-list-ul');
    ul.innerHTML = '';

    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player.name;
        ul.appendChild(li);
    });

    // Enable start button if enough players
    const startBtn = document.getElementById('start-game-btn');
    if (players.length >= 2) {
        startBtn.disabled = false;
        document.querySelector('.waiting-message').textContent = 'Ready to start!';
    } else {
        startBtn.disabled = true;
        document.querySelector('.waiting-message').textContent = 'Waiting for players... (Min 2 players needed)';
    }
}

function startGame() {
    socket.emit('startGame');
}

function leaveRoom() {
    location.reload();
}

// Game functions
function updateGameState(state) {
    gameState = state;

    if (state.gameStarted) {
        document.getElementById('waiting-room').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        document.getElementById('game-info').style.display = 'flex';
    }

    // Update game info
    document.getElementById('deck-side').textContent = state.isDarkSide ? '🌙 DARK' : '☀️ LIGHT';
    document.getElementById('deck-side').className = state.isDarkSide ? 'value dark-side' : 'value light-side';

    const currentPlayer = state.players.find(p => p.socketId === state.currentPlayerSocketId);
    if (currentPlayer) {
        document.getElementById('current-player').textContent = currentPlayer.name;

        // Highlight if it's your turn
        const playerArea = document.getElementById('player-area');
        if (currentPlayer.socketId === mySocketId) {
            playerArea.classList.add('your-turn');
        } else {
            playerArea.classList.remove('your-turn');
        }
    }

    document.getElementById('game-direction').textContent = state.direction === 1 ? '→' : '←';

    // Update UI
    updatePlayerHand(state.myHand, state.isDarkSide);
    updateOtherPlayers(state.players, state.currentPlayerSocketId);
    updateMelds(state.melds, state.isDarkSide);
    updateDiscardPile(state.discardPile, state.isDarkSide);
    updateButtons(state);
}

function updatePlayerHand(hand, isDarkSide) {
    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = '';

    hand.forEach(card => {
        const cardElement = createCardElement(card, isDarkSide);
        cardElement.onclick = () => toggleCardSelection(card.id);

        if (selectedCards.includes(card.id)) {
            cardElement.classList.add('selected');
        }

        handContainer.appendChild(cardElement);
    });
}

function updateOtherPlayers(players, currentPlayerSocketId) {
    const container = document.getElementById('other-players-container');
    container.innerHTML = '';

    players.forEach(player => {
        if (player.socketId !== mySocketId) {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'other-player';

            if (player.socketId === currentPlayerSocketId) {
                playerDiv.classList.add('active');
            }

            const nameDiv = document.createElement('div');
            nameDiv.className = 'other-player-name';
            nameDiv.textContent = `${player.name} (${player.cardCount} cards)`;

            const cardsDiv = document.createElement('div');
            cardsDiv.className = 'other-player-cards';

            // Show card backs
            for (let i = 0; i < Math.min(player.cardCount, 5); i++) {
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

function updateMelds(melds, isDarkSide) {
    const container = document.getElementById('melds-container');
    container.innerHTML = '';

    if (melds.length === 0) {
        container.innerHTML = '<p style="color: #6c757d; text-align: center;">No melds played yet</p>';
        return;
    }

    melds.forEach(meld => {
        const meldDiv = document.createElement('div');
        meldDiv.className = 'meld';

        const labelDiv = document.createElement('div');
        labelDiv.className = 'meld-label';
        labelDiv.textContent = `Meld by ${meld.player}`;
        meldDiv.appendChild(labelDiv);

        meld.cards.forEach(card => {
            const cardElement = createCardElement(card, isDarkSide);
            cardElement.style.cursor = 'default';
            cardElement.onclick = null;
            meldDiv.appendChild(cardElement);
        });

        container.appendChild(meldDiv);
    });
}

function updateDiscardPile(discardPile, isDarkSide) {
    const pile = document.getElementById('discard-pile');
    pile.innerHTML = '<span class="pile-label">Discard Pile</span>';

    if (discardPile.length > 0) {
        const topCard = discardPile[discardPile.length - 1];
        const cardElement = createCardElement(topCard, isDarkSide);
        cardElement.style.cursor = 'default';
        cardElement.onclick = null;
        pile.appendChild(cardElement);
    }
}

function updateButtons(state) {
    const isMyTurn = state.currentPlayerSocketId === mySocketId;

    document.getElementById('draw-card-btn').disabled = !isMyTurn;
    document.getElementById('play-meld-btn').disabled = !isMyTurn || selectedCards.length < 3;
    document.getElementById('discard-btn').disabled = !isMyTurn || selectedCards.length !== 1;
}

function createCardElement(card, isDarkSide) {
    const cardDiv = document.createElement('div');
    const color = isDarkSide ? card.darkColor : card.lightColor;
    cardDiv.className = `card ${color}`;
    cardDiv.dataset.cardId = card.id;

    const valueSpan = document.createElement('span');
    valueSpan.className = 'card-value';
    valueSpan.textContent = getCardSymbol(card, isDarkSide);

    cardDiv.appendChild(valueSpan);
    return cardDiv;
}

function getCardSymbol(card, isDarkSide) {
    if (card.type === 'number') {
        return isDarkSide && card.value < 5 ? card.value + 5 : card.value;
    }

    const symbols = {
        'skip': '🚫',
        'reverse': '🔄',
        'draw': isDarkSide ? '📥+5' : '📥+1',
        'wild': '🌈',
        'flip': '🔃'
    };

    return symbols[card.type] || card.type.toUpperCase();
}

function toggleCardSelection(cardId) {
    const index = selectedCards.indexOf(cardId);
    if (index === -1) {
        selectedCards.push(cardId);
    } else {
        selectedCards.splice(index, 1);
    }
    updatePlayerHand(gameState.myHand, gameState.isDarkSide);
    updateButtons(gameState);
}

// Game actions
function drawCard() {
    if (gameState.currentPlayerSocketId !== mySocketId) {
        showMessage('Not your turn!', 1500);
        return;
    }

    socket.emit('drawCard');
}

function playMeld() {
    if (gameState.currentPlayerSocketId !== mySocketId) {
        showMessage('Not your turn!', 1500);
        return;
    }

    if (selectedCards.length < 3) {
        showMessage('Select at least 3 cards for a meld', 1500);
        return;
    }

    socket.emit('playMeld', { cardIds: selectedCards });
    selectedCards = [];
}

function discardCard() {
    if (gameState.currentPlayerSocketId !== mySocketId) {
        showMessage('Not your turn!', 1500);
        return;
    }

    if (selectedCards.length !== 1) {
        showMessage('Select exactly 1 card to discard', 1500);
        return;
    }

    socket.emit('discard', { cardId: selectedCards[0] });
    selectedCards = [];
}

function sortHand() {
    if (!gameState || !gameState.myHand) return;

    const isDarkSide = gameState.isDarkSide;
    gameState.myHand.sort((a, b) => {
        const colorA = isDarkSide ? a.darkColor : a.lightColor;
        const colorB = isDarkSide ? b.darkColor : b.lightColor;

        if (colorA !== colorB) {
            return colorA.localeCompare(colorB);
        }

        const valA = a.type === 'number' ? (isDarkSide && a.value < 5 ? a.value + 5 : a.value) : 100;
        const valB = b.type === 'number' ? (isDarkSide && b.value < 5 ? b.value + 5 : b.value) : 100;

        return valA - valB;
    });

    updatePlayerHand(gameState.myHand, isDarkSide);
}

function showMessage(text, duration = 2000) {
    const messageBox = document.getElementById('message-box');
    messageBox.innerHTML = `<div class="message-content">${text}</div>`;
    messageBox.classList.add('show');

    setTimeout(() => {
        messageBox.classList.remove('show');
    }, duration);
}
