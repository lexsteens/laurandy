# Skeleton — Validation Prototype

## Purpose

Test whether a progressive-hint word guessing mechanic is fun.
**Key question**: Is the hint-vs-score tradeoff engaging? Do players want to play again?

## The Mechanic

1. Player sees all blanks: `_ _ _ _ _ _` (word length is known)
2. Hint buttons reveal letters (cost 1 point each): "show odd", "show even", "show vowels", "show first", "show last"
3. At any point, player types into remaining blank positions (auto-jump between blanks)
4. Per-letter feedback: correct → green + locked, wrong → red flash + clears (no penalty)
5. Toggle "keep correct letters" — ON: greens stay visible (costs 1 point per kept letter). OFF: flash green then disappear

## Scoring

- Start with `10 × word.length` points
- Each letter revealed by a hint: −1 point
- Each correct letter kept visible (toggle ON): −1 point
- Wrong letters: no penalty (just flash red and clear)
- Final score = starting points − hints used − letters kept

## Architecture

```
skeleton/
├── src/
│   ├── game/
│   │   ├── engine.ts        # types + pure functions
│   │   ├── engine.test.ts   # unit tests
│   │   └── words.ts         # word list
│   └── ui/
│       ├── main.tsx
│       ├── App.tsx
│       ├── App.css
│       ├── hooks/
│       │   └── use-game.ts  # useReducer wrapping engine
│       └── components/
│           ├── Board.tsx     # letter tiles (blank, revealed, correct)
│           ├── HintBar.tsx   # hint buttons with labels
│           └── ScoreBar.tsx  # score + keep-correct toggle
```

## Game logic (`src/game/engine.ts`)

Pure TypeScript, zero dependencies. Import rules: `ui/` imports `game/`, never reverse.

## UI rules

- Dark theme, centered, monospace tiles
- Auto-jump to next blank after typing a letter
- Backspace jumps to previous blank
- Show current score prominently
- "New word" button after solving
- No localStorage, no streaks, no external deps
