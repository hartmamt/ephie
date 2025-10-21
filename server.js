const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Game state management
const rooms = new Map();
const players = new Map();

// Helper classes (same as client but server-authoritative)
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
        if (this.type === 'number') {
            return isDarkSide && this.value < 5 ? this.value + 5 : this.value;
        }
        return this.type.toUpperCase();
    }
}

class Deck {
    constructor() {
        this.cards = [];
        this.initializeDeck();
        this.shuffle();
    }

    initializeDeck() {
        const LIGHT_COLORS = ['red', 'blue', 'green', 'yellow'];
        const DARK_COLORS = ['pink', 'teal', 'orange', 'purple'];

        for (let i = 0; i < 4; i++) {
            const lightColor = LIGHT_COLORS[i];
            const darkColor = DARK_COLORS[i];

            this.cards.push(new Card(0, 'number', lightColor, darkColor));

            for (let num = 1; num <= 9; num++) {
                this.cards.push(new Card(num, 'number', lightColor, darkColor));
                this.cards.push(new Card(num, 'number', lightColor, darkColor));
            }

            for (let j = 0; j < 2; j++) {
                this.cards.push(new Card(null, 'skip', lightColor, darkColor));
                this.cards.push(new Card(null, 'reverse', lightColor, darkColor));
                this.cards.push(new Card(null, 'draw', lightColor, darkColor));
            }
        }

        for (let i = 0; i < 4; i++) {
            this.cards.push(new Card(null, 'wild', 'wild', 'wild'));
            this.cards.push(new Card(null, 'flip', 'wild', 'wild'));
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw() {
        return this.cards.pop() || null;
    }

    addCard(card) {
        this.cards.unshift(card);
    }

    count() {
        return this.cards.length;
    }
}

class Room {
    constructor(roomCode) {
        this.roomCode = roomCode;
        this.players = [];
        this.deck = new Deck();
        this.discardPile = [];
        this.melds = [];
        this.currentPlayerIndex = 0;
        this.direction = 1;
        this.isDarkSide = false;
        this.gameStarted = false;
        this.maxPlayers = 6;
    }

    addPlayer(socketId, playerName) {
        if (this.players.length >= this.maxPlayers) {
            return false;
        }

        this.players.push({
            socketId,
            name: playerName,
            hand: [],
            isReady: false
        });
        return true;
    }

    removePlayer(socketId) {
        const index = this.players.findIndex(p => p.socketId === socketId);
        if (index !== -1) {
            this.players.splice(index, 1);
            return true;
        }
        return false;
    }

    startGame() {
        if (this.players.length < 2) return false;

        this.gameStarted = true;
        this.deck = new Deck();
        this.discardPile = [];
        this.melds = [];
        this.currentPlayerIndex = 0;
        this.direction = 1;
        this.isDarkSide = false;

        // Deal 7 cards to each player
        for (let i = 0; i < 7; i++) {
            this.players.forEach(player => {
                const card = this.deck.draw();
                if (card) player.hand.push(card);
            });
        }

        return true;
    }

    getPlayerBySocketId(socketId) {
        return this.players.find(p => p.socketId === socketId);
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + this.players.length) % this.players.length;
    }

    getGameState(socketId) {
        const player = this.getPlayerBySocketId(socketId);

        return {
            roomCode: this.roomCode,
            players: this.players.map(p => ({
                socketId: p.socketId,
                name: p.name,
                cardCount: p.hand.length,
                isReady: p.isReady
            })),
            myHand: player ? player.hand : [],
            currentPlayerSocketId: this.getCurrentPlayer()?.socketId,
            direction: this.direction,
            isDarkSide: this.isDarkSide,
            gameStarted: this.gameStarted,
            discardPile: this.discardPile,
            melds: this.melds,
            deckCount: this.deck.count()
        };
    }
}

// Generate random room code
function generateRoomCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Socket.io event handlers
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('createRoom', (playerName) => {
        const roomCode = generateRoomCode();
        const room = new Room(roomCode);
        room.addPlayer(socket.id, playerName);
        rooms.set(roomCode, room);
        players.set(socket.id, { roomCode, playerName });

        socket.join(roomCode);
        socket.emit('roomCreated', { roomCode, gameState: room.getGameState(socket.id) });
    });

    socket.on('joinRoom', ({ roomCode, playerName }) => {
        const room = rooms.get(roomCode);

        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        if (room.gameStarted) {
            socket.emit('error', { message: 'Game already in progress' });
            return;
        }

        if (!room.addPlayer(socket.id, playerName)) {
            socket.emit('error', { message: 'Room is full' });
            return;
        }

        players.set(socket.id, { roomCode, playerName });
        socket.join(roomCode);

        // Notify all players in room
        io.to(roomCode).emit('playerJoined', {
            playerName,
            players: room.players.map(p => ({ name: p.name, isReady: p.isReady }))
        });

        socket.emit('roomJoined', { roomCode, gameState: room.getGameState(socket.id) });
    });

    socket.on('startGame', () => {
        const playerData = players.get(socket.id);
        if (!playerData) return;

        const room = rooms.get(playerData.roomCode);
        if (!room) return;

        if (room.startGame()) {
            io.to(playerData.roomCode).emit('gameStarted', {
                message: 'Game started!'
            });

            // Send game state to all players
            room.players.forEach(player => {
                io.to(player.socketId).emit('gameState', room.getGameState(player.socketId));
            });
        }
    });

    socket.on('drawCard', () => {
        const playerData = players.get(socket.id);
        if (!playerData) return;

        const room = rooms.get(playerData.roomCode);
        if (!room) return;

        const player = room.getPlayerBySocketId(socket.id);
        const currentPlayer = room.getCurrentPlayer();

        if (player.socketId !== currentPlayer.socketId) {
            socket.emit('error', { message: 'Not your turn' });
            return;
        }

        const card = room.deck.draw();
        if (card) {
            player.hand.push(card);

            // Update all players
            room.players.forEach(p => {
                io.to(p.socketId).emit('gameState', room.getGameState(p.socketId));
            });

            io.to(playerData.roomCode).emit('message', {
                text: `${player.name} drew a card`
            });
        }
    });

    socket.on('playMeld', ({ cardIds }) => {
        const playerData = players.get(socket.id);
        if (!playerData) return;

        const room = rooms.get(playerData.roomCode);
        if (!room) return;

        const player = room.getPlayerBySocketId(socket.id);
        const cards = cardIds.map(id => player.hand.find(c => c.id === id)).filter(c => c);

        // Validate meld (simplified - should use proper validation)
        if (cards.length >= 3) {
            room.melds.push({
                cards: cards,
                player: player.name
            });

            // Remove cards from hand
            cardIds.forEach(id => {
                const index = player.hand.findIndex(c => c.id === id);
                if (index !== -1) player.hand.splice(index, 1);
            });

            // Update all players
            room.players.forEach(p => {
                io.to(p.socketId).emit('gameState', room.getGameState(p.socketId));
            });

            io.to(playerData.roomCode).emit('message', {
                text: `${player.name} played a meld!`
            });

            // Check for winner
            if (player.hand.length === 0) {
                io.to(playerData.roomCode).emit('gameOver', {
                    winner: player.name
                });
            }
        }
    });

    socket.on('discard', ({ cardId }) => {
        const playerData = players.get(socket.id);
        if (!playerData) return;

        const room = rooms.get(playerData.roomCode);
        if (!room) return;

        const player = room.getPlayerBySocketId(socket.id);
        const currentPlayer = room.getCurrentPlayer();

        if (player.socketId !== currentPlayer.socketId) {
            socket.emit('error', { message: 'Not your turn' });
            return;
        }

        const cardIndex = player.hand.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return;

        const card = player.hand.splice(cardIndex, 1)[0];
        room.discardPile.push(card);

        // Handle special cards
        if (card.type === 'skip') {
            room.nextPlayer();
            if (room.isDarkSide) {
                // Skip all - same player again
            } else {
                room.nextPlayer();
            }
        } else if (card.type === 'reverse') {
            room.direction *= -1;
            room.nextPlayer();
        } else if (card.type === 'draw') {
            room.nextPlayer();
            const nextPlayer = room.getCurrentPlayer();
            const drawCount = room.isDarkSide ? 5 : 1;
            for (let i = 0; i < drawCount; i++) {
                const drawnCard = room.deck.draw();
                if (drawnCard) nextPlayer.hand.push(drawnCard);
            }
            room.nextPlayer();
        } else if (card.type === 'flip') {
            room.isDarkSide = !room.isDarkSide;
            room.nextPlayer();
        } else {
            room.nextPlayer();
        }

        // Check for winner
        if (player.hand.length === 0) {
            io.to(playerData.roomCode).emit('gameOver', {
                winner: player.name
            });
            return;
        }

        // Update all players
        room.players.forEach(p => {
            io.to(p.socketId).emit('gameState', room.getGameState(p.socketId));
        });

        const nextPlayerName = room.getCurrentPlayer().name;
        io.to(playerData.roomCode).emit('message', {
            text: `${player.name} discarded. ${nextPlayerName}'s turn.`
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        const playerData = players.get(socket.id);
        if (playerData) {
            const room = rooms.get(playerData.roomCode);
            if (room) {
                room.removePlayer(socket.id);

                io.to(playerData.roomCode).emit('playerLeft', {
                    playerName: playerData.playerName
                });

                // If room is empty, delete it
                if (room.players.length === 0) {
                    rooms.delete(playerData.roomCode);
                }
            }
            players.delete(socket.id);
        }
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
