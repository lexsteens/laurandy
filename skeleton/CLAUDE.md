# Skeleton — Validation Prototype

## Purpose

Test whether an alternating-letters word guessing mechanic is fun.
**Key question**: Do players enjoy deducing a word from every-other-letter hints?

## The Mechanic

Player sees a word with every other letter revealed:

```
_ A _ E _ T
```

Guess the complete word. 5 attempts max. Color feedback on hidden positions (green/yellow/grey like Wordle).

## Architecture

```
skeleton/
├── CLAUDE.md
├── README.md
├── package.json
├── vite.config.ts
├── index.html
└── src/
    ├── game/
    │   ├── engine.ts          # types + pure functions (createGame, submitGuess, getSkeleton)
    │   └── engine.test.ts     # unit tests — no DOM
    └── ui/
        ├── main.tsx
        ├── App.tsx
        ├── App.css
        └── components/
            ├── Board.tsx      # skeleton display + feedback tiles
            └── GuessInput.tsx # text input + submit
```

## Game logic (`src/game/engine.ts`)

Pure TypeScript, zero dependencies.

```typescript
type GameState = {
  target: string;
  skeleton: string; // e.g. "_A_E_T"
  guesses: Guess[];
  status: 'playing' | 'won' | 'lost';
};
type LetterResult = 'correct' | 'present' | 'absent' | 'revealed';
type Guess = { word: string; results: LetterResult[] };

function createGame(word: string): GameState;
function submitGuess(state: GameState, guess: string): GameState;
function getSkeleton(word: string): string; // reveals even-index letters
```

State managed via `useReducer` in React — game functions are the reducer.

## Word list

Hardcode 50–100 common English words (5–8 letters) in `src/game/words.ts`. Pick random word each session.

## UI rules

- Dark theme, centered, monospace tiles
- Auto-focus input, submit on Enter
- Reject guesses that aren't the right length
- Show guess count: "Guess 2 of 5"
- "New word" button after win/loss
- No localStorage, no streaks, no daily mode, no external deps
