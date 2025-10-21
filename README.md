# UNO RUMMY FLIP - Multiplayer Web Party Game

A unique **real-time multiplayer** web party game that combines the exciting mechanics of **UNO Flip** and **Rummy** into one fun experience!

## Game Overview

Uno Rummy Flip blends the colorful, action-packed gameplay of UNO Flip with the strategic meld-building of Rummy. Players must form sets and runs while dealing with special cards and the dramatic FLIP mechanic that changes the game!

## 🎮 Play Online (Multiplayer)

This game features **real-time multiplayer** using Socket.io! Play with friends from anywhere.

### Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the server**
   ```bash
   npm start
   ```

3. **Play the game**
   - Open `http://localhost:3000` in your browser
   - Create a room or join with a room code
   - Share the code with friends!

### Deploy Online

Want to play with friends online? See **[DEPLOYMENT.md](DEPLOYMENT.md)** for detailed instructions on deploying to:
- Railway (Recommended - Free & Easy)
- Render
- Fly.io

**Note**: Vercel doesn't fully support WebSocket apps. Use Railway instead!

## How to Play

### Setup
1. Enter your name
2. Create a room or join with a room code
3. Wait for friends to join (2-6 players)
4. Start the game!

### Objective
Be the first player to play all your cards by forming valid melds (sets and runs)!

### Game Mechanics

#### The Deck
The deck features two sides:
- **Light Side**: Red, Blue, Green, Yellow cards
- **Dark Side**: Pink, Teal, Orange, Purple cards

Each card exists on both sides with potentially different values!

#### Your Turn
1. **Draw** a card from the draw pile
2. **Play Melds** (optional) - Form sets or runs from your hand
3. **Discard** exactly one card to end your turn

#### Valid Melds

**SET** - 3 or more cards of the same number, different colors
- Example: Red 5, Blue 5, Green 5

**RUN** - 3 or more consecutive numbers of the same color
- Example: Red 3, Red 4, Red 5, Red 6

### Special Cards

#### Light Side Cards
- **Skip** (🚫) - Skip the next player's turn
- **Reverse** (🔄) - Reverse the direction of play
- **Draw +1** (📥+1) - Next player draws 1 card and loses their turn
- **Wild** (🌈) - Can be used in any meld
- **Flip** (🔃) - Flip the entire deck to the Dark Side!

#### Dark Side Cards
- **Skip All** (🚫) - Skip all other players, you get another turn!
- **Reverse** (🔄) - Reverse the direction of play
- **Draw +5** (📥+5) - Next player draws 5 cards and loses their turn
- **Wild Draw Color** (🌈) - Wild card with extra power
- **Flip** (🔃) - Flip the entire deck back to the Light Side!

### The FLIP Mechanic

When a FLIP card is played, ALL cards in the game flip to their opposite side:
- Light Side → Dark Side (or vice versa)
- Number cards may change values
- Special cards become more powerful (or less powerful)

This creates dramatic shifts in strategy and keeps everyone on their toes!

### Winning

The first player to empty their hand wins the game!

## Features

- **Real-Time Multiplayer**: Play with 2-6 friends online using WebSockets
- **Room System**: Create or join games with simple room codes
- **Live Game State**: See all players' moves in real-time
- **Beautiful UI**: Colorful cards with smooth animations
- **Responsive Design**: Works on desktop and mobile devices
- **Turn Indicators**: Always know whose turn it is
- **Card Sorting**: Organize your hand by color and number
- **Persistent Rooms**: Games continue until all players leave

## Tips & Strategy

1. **Plan Your Melds**: Try to hold cards that can form multiple possible sets or runs
2. **Use Special Cards Wisely**: Save powerful cards like Draw +5 for crucial moments
3. **Watch the Flip**: Keep track of which side you're on and plan accordingly
4. **Discard High Cards**: If you can't use them in melds, get rid of high-value cards
5. **Build on Existing Melds**: Look for opportunities to extend runs or sets already on the table

## Technical Details

- **Backend**: Node.js + Express + Socket.io
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Real-Time Communication**: WebSocket connections via Socket.io
- **Game State**: Server-authoritative (prevents cheating)
- **Deployment**: Compatible with Railway, Render, Fly.io, and more

## Browser Compatibility

Works best in modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Credits

Created by combining the best elements of:
- **UNO Flip** - The card game by Mattel
- **Rummy** - The classic meld-building card game

---

Enjoy playing UNO RUMMY FLIP! 🎮🎴
