# Crossfire — Validation Prototype

## Purpose

Test whether a compound-word bridge puzzle is fun.
**Key question**: Do players enjoy finding a hidden word that connects two other words?

## The Mechanic

Two words shown: LEFT and RIGHT. Find HIDDEN such that:

- LEFT + HIDDEN = a compound word/phrase
- HIDDEN + RIGHT = a compound word/phrase

Example: `FIRE ___ SHOP` → **WORK** (firework + workshop)

## Architecture

```
crossfire/
├── CLAUDE.md
├── README.md
├── package.json
├── vite.config.ts
├── index.html
└── src/
    ├── game/
    │   ├── engine.ts          # types + pure functions (createGame, submitGuess, checkAnswer)
    │   ├── engine.test.ts
    │   └── puzzles.ts         # hardcoded puzzle data (20-30 puzzles)
    └── ui/
        ├── main.tsx
        ├── App.tsx
        ├── App.css
        └── components/
            ├── PuzzleDisplay.tsx  # LEFT ___ RIGHT display
            └── GuessInput.tsx
```

## Game logic (`src/game/engine.ts`)

Pure TypeScript, zero dependencies.

```typescript
type Puzzle = { left: string; right: string; answer: string };
type GameState = {
  puzzle: Puzzle;
  guesses: string[];
  status: 'playing' | 'won' | 'lost';
};

function createGame(puzzle: Puzzle): GameState;
function submitGuess(state: GameState, guess: string): GameState;
```

## Starter puzzles (`src/game/puzzles.ts`)

| LEFT  | HIDDEN | RIGHT |
| ----- | ------ | ----- |
| FIRE  | WORK   | SHOP  |
| SNOW  | BALL   | ROOM  |
| BOOK  | MARK   | DOWN  |
| SUN   | LIGHT  | HOUSE |
| WATER | FALL   | OUT   |
| BACK  | GROUND | WORK  |
| HEAD  | BAND   | WIDTH |
| OVER  | TIME   | LINE  |

Add 12–22 more to reach 20–30 total.

## UI rules

- Dark theme, centered
- LEFT in orange, RIGHT in blue, input between them
- Case-insensitive comparison
- Auto-focus input, submit on Enter
- Max 5 guesses. Wrong guesses shown crossed out
- On win: reveal hidden word in green, show both compound words
- "Next puzzle" button, puzzle counter
- No localStorage, no streaks, no external deps
