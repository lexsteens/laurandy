# CLAUDE.md — Sokoword (Web Prototype)

## Purpose

Web validation prototype — test whether pushing letters into position to spell a hidden word is satisfying to play. Desktop browser only, keyboard input.

---

## Concept

Sokoban-inspired puzzle. Letter tiles are scattered on a grid. The player moves a character around, pushing letters. When any contiguous horizontal or vertical sequence of letters spells a valid word, it lights up. When the hidden answer word forms, the puzzle is won.

Unlike classic Sokoban, **there are no target squares**. The win condition is purely word-based: letters must touch to form the word, in any direction.

---

## Core Mechanic

- **Grid**: 18×12, wall border, open internal playfield (with optional obstacle pillars/walls)
- **Player**: moves up/down/left/right one cell at a time
- **Letter tiles**: pushed (never pulled) one step at a time; cannot push through walls or another letter
- **Words**: any contiguous H/V run of ≥ 3 letters matching a dictionary word lights up blue
- **Answer**: the hidden target word; lights up green when formed — wins the puzzle
- **Decoys**: extra letter tiles from other chosen words act as obstacles and red herrings

---

## Puzzle Generation

Each puzzle is generated at runtime from a **level template** + a **random seed**:

1. A level template defines the grid shape (walls, floor, player start) — no letters
2. The generator picks `WORD_COUNT` (default 3) random words from the word list using a seeded RNG
3. The first word in the 4–6 letter range becomes the hidden answer
4. All letters from all words are scattered on **safe floor cells** (no wall neighbours) so every letter starts pushable in all 4 directions
5. If any chosen word is accidentally pre-formed, it reshuffles (up to 20 attempts)
6. The seed is random per game (`Math.random()`), stored in localStorage so reload restores the same puzzle
7. Pressing `R` generates a fresh random seed → new puzzle on the same level

---

## Levels

Levels live in `src/game/levels/level-N.ts`. They are **auto-detected** at runtime via `import.meta.glob('./level-*.ts', { eager: true })`.

### Adding a new level

Create `src/game/levels/level-N.ts` — no other registration needed:

```ts
// My Level Name        ← first line is the display name
import type { Level } from '../types';

export const name = 'My Level Name';

export const level: Level = {
  id: N,
  name,
  grid: [
    '##################', // 18 cols × 12 rows
    '#................#',
    // ... floor (.), walls (#), player start (@)
    '##################',
  ],
};
```

**Grid rules:**

- Exactly 18 columns × 12 rows
- Outer border = `#` (walls)
- Internal walls/pillars must leave enough safe floor cells for all letters
- One `@` for player start
- No letters in the template — placed by generator at runtime

---

## Project Structure

```
sokoword/
├── CLAUDE.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
└── src/
    ├── game/                        # LAYER 1 — pure TypeScript, no React/DOM
    │   ├── types.ts                 # Cell, Grid, GameState, Puzzle, Level, ...
    │   ├── engine.ts                # parseGrid, initialState, move, scanWords
    │   ├── engine.test.ts
    │   ├── level-generator.ts       # generatePuzzle, makeRng, safeFloorPositions, ...
    │   ├── level-generator.test.ts
    │   ├── word-list.ts             # ~1700 English words (3–6 letters)
    │   └── levels/
    │       ├── index.ts             # auto-detects level-*.ts via import.meta.glob
    │       ├── level-1.ts           # Open Field
    │       ├── level-2.ts           # Divided Room
    │       └── level-3.ts           # Pillars
    └── ui/                          # LAYER 2 — React renderer
        ├── main.tsx
        ├── App.tsx
        ├── App.css
        └── components/
            ├── Grid.tsx
            └── Grid.css
```

---

## Game State

```ts
interface GameState {
  grid: Grid; // Cell[][] — current positions of player + letters
  playerPos: Pos;
  moves: number;
  status: 'playing' | 'won';
  currentWords: WordMatch[]; // words formed on the grid right now
  allFoundWords: string[]; // all distinct words ever formed (uppercase)
}
```

---

## Word Detection

After every move, `scanWords(grid, wordSet)` scans all contiguous horizontal and vertical runs of letters. For each run it checks every substring of length ≥ 3 against the word set. Words found this way are highlighted on the grid. The answer word winning is checked via `newWordStrings.has(answer)`.

---

## Level Generator API

```ts
// Configurable
export const WORD_COUNT = 3;

// Core functions
export function generatePuzzle(level: Level, wordList: string[], seed: number): Puzzle;
export function safeFloorPositions(levelGrid: string[]): Array<{ x: number; y: number }>;
export function makeRng(seed: number): () => number; // Mulberry32, deterministic
export function randomSeed(): number; // Math.random()-based
export function pickWords(wordList: string[], count: number, rng: () => number): string[];
```

---

## Persistence

```ts
// localStorage key: 'sokoword-v4'
interface SavedData {
  seed: number; // random seed used for this puzzle
  levelId: number;
  history: GameState[]; // full undo stack (max 100 states)
}
```

Seed + history are restored on page reload. `R` generates a new random seed and clears history.

---

## Input

| Key             | Action                       |
| --------------- | ---------------------------- |
| `↑↓←→`          | Move player / push letter    |
| `U` or `Ctrl+Z` | Undo last move               |
| `R`             | New puzzle (new random seed) |

---

## Visual Design

- **Dark theme**: background `#0a0a0f`
- **Letter tiles**: bright white with 3D shadow
- **Found word (not answer)**: blue glow
- **Answer word formed**: pulsing green glow → win screen
- **Found words strip**: shown below grid (answer excluded until won)
- **Header**: `Sokoword` + level name (dim) + move counter

---

## Stack

- TypeScript + React + Vite
- Plain CSS (no UI library)
- Vitest for tests
- `import.meta.glob` for level auto-detection

---

## Do NOT build

- Touch/swipe controls
- User accounts, streaks, leaderboards
- Hint system
- Animations beyond CSS transitions
- Any external UI library
- Multiplayer or level editor (future)
