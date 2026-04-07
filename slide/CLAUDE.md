# Slide — Validation Prototype

## Purpose

Test whether a row-sliding vertical word puzzle mechanic is fun and satisfying to interact with. The one question this prototype must answer: **Does sliding rows to align a vertical word feel good and create interesting "aha" moments?**

## The Mechanic

The board shows 4–6 horizontal rows, each containing a real word. Each row can slide left and right independently. The middle column reads vertically — the player must slide rows until the middle column spells a valid word.

```
→  C A [R] O T        slide row 1
→  T [A] B L E        slide row 2
→  C [I] T Y          slide row 3
→  P [N] K            slide row 4
        ↓
      RAIN ← hidden vertical word
```

### Key design decisions

- **No key letter index**: the puzzle format is just `{ word }` per row. Any letter in the row can land in the center — the game doesn't pre-designate which letter is "correct"
- **Dictionary-based validation**: whatever lands in the middle column gets checked against a word list. If it's a valid word, it counts
- **Multiple valid words**: rows don't lock when a word is found. The player keeps sliding to hunt for bonus words. Scoring: 🥉 = 1 word, 🥈 = 2 words, 🥇 = 3+ words

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Backend | None — all client-side |
| Styling | Plain CSS, dark theme |

## Project structure

```
slide/
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
    │   ├── puzzles.js        # 15–20 puzzles, each is an array of row words
    │   └── wordList.js       # dictionary of valid 4–6 letter words for vertical checking
    └── components/
        ├── GameBoard.jsx      # sliding rows + vertical column check
        ├── GameBoard.css
        ├── SlideRow.jsx       # single row with slide controls
        └── SlideRow.css
```

## Puzzle data format

```js
export const puzzles = [
  {
    rows: ["CARROT", "TABLE", "CITY", "PINK"],
    // no key indices — any vertical alignment that forms a word counts
  },
  // ...
];
```

Each row word can be different lengths. The middle column position is `Math.floor(word.length / 2)` at the initial (centered) position. As the row slides, different letters pass through the center.

## UI layout

- Dark background, centered content
- Title: "SLIDE"
- The board: rows of letter tiles, horizontally scrollable
- Each row has **← and → arrow buttons** on the sides (primary input method)
- Mouse drag to slide a row (secondary — mousedown/mousemove/mouseup on the row)
- The middle column highlighted with a subtle vertical stripe or different background
- Below the board: found words list (shows words discovered so far)
- Medal indicator: 🥉🥈🥇 based on words found
- "Next puzzle" button
- Puzzle counter

## Input handling (web only)

1. **Arrow buttons** — always visible on each side of each row. Click to shift row by one position
2. **Mouse drag** — mousedown on a row, mousemove shifts it, mouseup snaps to nearest letter alignment
3. **Keyboard** — click a row to select it, then use ← → arrow keys

No touch/swipe handling — this is a web validation prototype.

## Sliding mechanics

- Each row has an `offset` (integer, starts at 0)
- offset -1 = shifted one letter left, offset +1 = shifted one letter right
- Clamp offset so at least one letter remains visible in the center column
- The letter at position `Math.floor(word.length / 2) - offset` is in the center column
- After each slide, read the center column top-to-bottom and check against the word list

## Word detection

- After any row slides, read the vertical word from the center column
- Check if it exists in the word list (case-insensitive)
- If it's a new valid word: add to found words, flash the column green briefly
- Don't lock rows — player keeps exploring

## Key rules

- Show the center column letters clearly at all times
- Visual feedback when a word is found (brief highlight)
- Show all found words in a list below the board
- "Give up" button reveals one possible valid word
- Save nothing to localStorage

## What NOT to build

- No touch/swipe handling
- No streak tracking or daily mode
- No share card
- No complex animations (just basic CSS transitions for sliding)
- No external dependencies
