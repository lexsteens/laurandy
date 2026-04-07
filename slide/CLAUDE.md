# Slide — Validation Prototype

## Purpose

Test whether a row-sliding vertical word puzzle is fun and satisfying.
**Key question**: Does sliding rows to align a vertical word feel good and create "aha" moments?

## The Mechanic

4–6 horizontal rows, each a real word. Each row slides left/right independently. The middle column reads vertically — slide rows until it spells a valid word.

```
→  C A [R] O T
→  T [A] B L E
→  C [I] T Y
→  P [N] K
        ↓
      RAIN
```

- No pre-designated key letter — any letter can land in center
- Dictionary-based validation: whatever's in the middle column gets checked
- Multiple valid words possible — player keeps exploring for bonus words
- Scoring: 🥉 = 1 word, 🥈 = 2, 🥇 = 3+

## Architecture

```
slide/
├── CLAUDE.md
├── README.md
├── package.json
├── vite.config.ts
├── index.html
└── src/
    ├── game/
    │   ├── engine.ts          # types + pure functions (createGame, slideRow, readCenter, checkWord)
    │   ├── engine.test.ts
    │   ├── puzzles.ts         # 15-20 puzzles (arrays of row words)
    │   └── word-list.ts       # valid 3-6 letter words for vertical checking
    └── ui/
        ├── main.tsx
        ├── App.tsx
        ├── App.css
        └── components/
            ├── Board.tsx
            ├── SlideRow.tsx   # single row with ← → buttons + drag
            └── FoundWords.tsx # list of discovered words + medal
```

## Game logic (`src/game/engine.ts`)

Pure TypeScript, zero dependencies.

```typescript
type GameState = {
  rows: { word: string; offset: number }[];
  foundWords: string[];
  status: 'playing' | 'done';
};

function createGame(words: string[]): GameState;
function slideRow(state: GameState, rowIndex: number, direction: -1 | 1): GameState;
function readCenterColumn(state: GameState): string;
function checkForNewWord(state: GameState, wordList: Set<string>): GameState;
```

## Sliding mechanics

- `offset` = integer, starts at 0. Negative = shifted left, positive = right
- Center letter = `word[Math.floor(word.length / 2) - offset]`
- Clamp so at least one letter remains in center column
- After each slide: read center column, check against word list

## Input (web only)

1. **← → arrow buttons** on each row (primary)
2. **Mouse drag** on row (secondary)
3. **Keyboard arrows** when row is focused

No touch/swipe — web validation prototype only.

## UI rules

- Dark theme, letter tiles in a grid
- Subtle vertical stripe highlighting the center column
- Brief green flash when a word is found
- Found words list below board with medal indicator
- "Give up" reveals one possible word
- "Next puzzle" button, puzzle counter
- No localStorage, no streaks, no external deps
