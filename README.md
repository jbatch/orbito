# Orbito Game

Orbito is a strategic board game where players compete to create lines of four pieces while navigating unique orbital movement patterns.

## Game Rules

### Setup

- The game is played on a 4x4 board
- Two players (Black and White) take turns
- The board contains two orbital paths - an outer and inner orbit

### Turn Structure

Each player's turn consists of three phases:

1. **Move Opponent (Optional)**

   - You may move one of your opponent's pieces to an adjacent empty space
   - Movement can be horizontal or vertical (not diagonal)

2. **Place Piece (Required)**

   - Place one of your pieces on any empty space on the board

3. **Rotate (Required)**
   - At the end of your turn, all pieces on the board move along their orbital paths
   - Pieces move according to their orbit (arrows)

### Winning

A player wins by creating a line (after rotation) of four pieces of their color in any of these ways:

- Horizontally (along a row)
- Vertically (along a column)
- Diagonally (from corner to corner)

## Technical Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone git@github.com:jbatch/orbito.git
cd orbito
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

### Required Dependencies

- React
- Tailwind CSS
- Lucide React (for icons)
- TypeScript

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

### Building for Production

Build the project:

```bash
npm run build
# or
yarn build
```
