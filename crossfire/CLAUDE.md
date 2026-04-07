# Crossfire — Validation Prototype

## Purpose

Test whether a compound-word bridge puzzle mechanic is fun. The one question this prototype must answer: **Do players enjoy finding a hidden word that connects two other words?**

## The Mechanic

Two words are shown — a LEFT word and a RIGHT word. The player must find the HIDDEN word that bridges them, forming valid compound words or common phrases on both sides.

```
FIRE _____ WORKS
       ↓
     WORK
→ FIREWORK + WORKSHOP?
```

Wait — let me be more precise. The hidden word completes both:
- LEFT + HIDDEN = a real compound word or phrase
- HIDDEN + RIGHT = a real compound word or phrase

Example: `SUN _ BURN` → HIDDEN = `FLOWER`? No. → HIDDEN = `BURN`? That's RIGHT itself.

Better example puzzles:

| LEFT | HIDDEN | RIGHT | LEFT+HIDDEN | HIDDEN+RIGHT |
|------|--------|-------|-------------|--------------|
| FIRE | WORK | SHOP | FIREWORK | WORKSHOP |
| SNOW | BALL | ROOM | SNOWBALL | BALLROOM |
| BOOK | MARK | DOWN | BOOKMARK | MARKDOWN |
| SUN | LIGHT | HOUSE | SUNLIGHT | LIGHTHOUSE |
| WATER | FALL | OUT | WATERFALL | FALLOUT |
| BACK | GROUND | WORK | BACKGROUND | GROUNDWORK |
| HEAD | BAND | WIDTH | HEADBAND | BANDWIDTH |
| OVER | TIME | LINE | OVERTIME | TIMELINE |

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Backend | None — all client-side |
| Styling | Plain CSS, dark theme |

## Project structure

```
crossfire/
├── CLAUDE.md
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── index.css
    ├── data/
    │   └── puzzles.js        # hardcoded puzzle list (20–30 puzzles)
    └── components/
        ├── GameBoard.jsx      # puzzle display + guess input + feedback
        └── GameBoard.css
```

## Puzzle data format

```js
export const puzzles = [
  { left: "FIRE", right: "SHOP", answer: "WORK" },
  { left: "SNOW", right: "ROOM", answer: "BALL" },
  // ...
];
```

## UI layout

- Dark background, centered content
- Title: "CROSSFIRE"
- The puzzle displayed as: `LEFT  ______  RIGHT` in large text
- LEFT in warm color (orange), RIGHT in cool color (blue)
- Below: text input for typing the hidden word + submit button
- Below: list of previous wrong guesses (crossed out)
- Max 5 guesses per puzzle
- "Next puzzle" button after win/loss
- Puzzle counter: "Puzzle 3 of 20"

## Key rules

- Case-insensitive comparison
- Input auto-focuses, submit on Enter
- On correct guess: reveal the hidden word in green between LEFT and RIGHT, show the two compound words formed below
- On wrong guess: add to wrong guesses list, shake input
- After 5 wrong guesses: reveal the answer
- Cycle through puzzles randomly (don't repeat until all played)
- Save nothing to localStorage — stateless prototype

## What NOT to build

- No streak tracking or daily mode
- No share card
- No hint system
- No animations beyond basic feedback
- No external dependencies
