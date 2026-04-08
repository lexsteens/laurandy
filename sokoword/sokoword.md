# CLAUDE.md — Sokoword (Web Prototype)

## Purpose

This is a **web validation prototype** — the goal is to test whether the mechanic is fun, not to ship a polished product. Build fast, keep it simple. A Flutter mobile app will be built separately once the concept is validated.

This means:

- Desktop browser only — keyboard input, no touch needed
- No authentication, no backend
- No monetization hooks
- Minimal accessibility
- The only question this prototype must answer: **is pushing letters into position to spell a word satisfying to play?**

---

## Concept

Sokoword is a Sokoban-inspired daily puzzle game. Letter tiles are scattered on a grid. The player moves a character around the grid, pushing letters into target squares to spell a hidden word. Like Sokoban, letters can only be pushed — never pulled — and a misplaced letter can make the puzzle unsolvable, requiring a restart.

The target word is known from the start (shown above the grid). The challenge is purely spatial: figuring out how to maneuver the letters into position without creating deadlocks.

---

## Core Mechanic

### The Grid

- Top-down 2D grid, typically 6×6 to 8×8
- Contains: walls, floor tiles, the player, letter tiles, and target squares
- Target squares are labeled with their required letter and position (e.g. slot 1, slot 2...)

### The Player

- Moves up/down/left/right one square at a time
- Cannot move through walls or push two letters simultaneously
- Can push one letter tile at a time if the square beyond it is empty floor

### Letter Tiles

- Each tile shows a letter (e.g. [R], [A], [I], [N])
- Can be pushed by the player in any of the 4 directions
- Cannot be pulled — once pushed into a corner or against a wall, may be stuck
- There are exactly as many letter tiles as letters in the target word

### Target Squares

- Marked squares on the grid, one per letter of the target word
- Each target square has a fixed position index (1st letter goes here, 2nd letter goes there...)
- When a letter tile is pushed onto its correct target square, it locks in (turns green)
- The puzzle is solved when all letter tiles are on their correct target squares

### Example

```
Target word: RAIN

Grid (6×6):
##########
#  [R]   #
# [A]    #
#   [I]  #
#  [N]   #
#  ①②③④  #   ← target squares labeled 1,2,3,4
##########

Player (@) must push each letter onto its numbered target square:
R → target ①, A → target ②, I → target ③, N → target ④
```

### Deadlock Examples (key to good puzzle design)

```
# = wall, [ ] = letter tile

Bad: letter pushed into corner
##
#[R]  ← can never be moved again

Bad: two letters blocking each other against a wall
#[A][R]  ← can't push either one
```

---

## Tech Stack

- **Framework**: React
- **Styling**: Tailwind CSS utility classes only
- **State**: useState / useEffect / useCallback / useRef
- **Input**: Keyboard only (arrow keys to move player)
- **Storage**: localStorage — save current puzzle progress (not streak)
- **Backend**: None — puzzle list hardcoded in JS

---

## Project Structure

```
src/
  App.jsx           # Game loop, input handling, win detection
  Grid.jsx          # Renders the grid — walls, floor, player, letters, targets
  puzzles.js        # Hardcoded puzzle list
  gameLogic.js      # Pure functions: move(), pushLetter(), isDeadlock(), isSolved()
```

---

## Game State

```js
// Full state of a puzzle at any moment
const state = {
  grid: [
    // 2D array of cell types
    // Each cell: { type: 'wall'|'floor', letter: null|'R', target: null|{index:0,letter:'R'}, hasPlayer: bool }
  ],
  playerPos: { x: 2, y: 1 },
  lettersPlaced: 0, // how many letters are on correct targets
  totalLetters: 4, // total letters in the word
  moves: 0, // move counter
  status: 'playing', // 'playing' | 'won'
};
```

---

## Puzzle Format

```js
// puzzles.js
export const puzzles = [
  {
    id: 1,
    answer: 'RAIN',
    // Grid encoded as string array — easier to author
    // Legend: # = wall, . = floor, @ = player start
    //         R/A/I/N = letter tiles (must match answer letters)
    //         1/2/3/4 = target squares (numbered = position in answer)
    grid: [
      '########',
      '#  R   #',
      '#  A   #',
      '#   I  #',
      '#  N   #',
      '# @    #',
      '# 1234 #',
      '########',
    ],
  },
  {
    id: 2,
    answer: 'LAMP',
    grid: [
      '########',
      '#L     #',
      '#    A #',
      '#  M   #',
      '#     P#',
      '#  @   #',
      '# 1234 #',
      '########',
    ],
  },
  // Aim for 20 well-tested puzzles before launch
  // Each puzzle must be verified solvable by hand before adding
];
```

### Grid Parsing

```js
// gameLogic.js
export function parseGrid(puzzle) {
  const cells = [];
  puzzle.grid.forEach((row, y) => {
    cells[y] = [];
    row.split('').forEach((char, x) => {
      cells[y][x] = {
        type: char === '#' ? 'wall' : 'floor',
        hasPlayer: char === '@',
        letter: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(char) ? char : null,
        target: '123456'.includes(char)
          ? { index: parseInt(char) - 1, letter: puzzle.answer[parseInt(char) - 1] }
          : null,
        locked: false, // true when correct letter is on this target
      };
    });
  });
  return cells;
}
```

---

## Movement Logic

```js
// gameLogic.js — pure function, returns new state or null if move invalid
export function move(state, direction) {
  const { dx, dy } = {
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 },
    left: { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 },
  }[direction];

  const { x, y } = state.playerPos;
  const nextX = x + dx;
  const nextY = y + dy;
  const next = state.grid[nextY]?.[nextX];

  // Can't move into wall or out of bounds
  if (!next || next.type === 'wall') return null;

  // If next cell has a letter, try to push it
  if (next.letter && !next.locked) {
    const beyondX = nextX + dx;
    const beyondY = nextY + dy;
    const beyond = state.grid[beyondY]?.[beyondX];

    // Can't push into wall, out of bounds, or another letter
    if (!beyond || beyond.type === 'wall' || beyond.letter) return null;

    // Valid push — move letter to beyond, move player to next
    return applyMove(state, x, y, nextX, nextY, beyondX, beyondY);
  }

  // Empty floor — just move player
  return applyMove(state, x, y, nextX, nextY, null, null);
}

function applyMove(state, px, py, nx, ny, lx, ly) {
  // Deep clone state, update positions, increment moves
  // If letter moved to a target square with matching letter → lock it
  // Return new state
}
```

---

## Win Detection

```js
export function isSolved(state) {
  return state.grid.every((row) => row.every((cell) => !cell.target || cell.locked));
}
```

## Undo System

Essential for a Sokoban game — players make mistakes constantly.

```js
// Keep a history stack of previous states
const [history, setHistory] = useState([initialState]);
const [current, setCurrent] = useState(0);

function undo() {
  if (current > 0) setCurrent((c) => c - 1);
}
// Ctrl+Z or U key → undo
// Keep max 100 states in history
```

---

## Input Handling

```js
// In App.jsx useEffect:
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
      tryMove('up');
      break;
    case 'ArrowDown':
      tryMove('down');
      break;
    case 'ArrowLeft':
      tryMove('left');
      break;
    case 'ArrowRight':
      tryMove('right');
      break;
    case 'z':
    case 'Z':
      if (e.ctrlKey || e.metaKey) undo();
      break;
    case 'u':
    case 'U':
      undo();
      break;
    case 'r':
    case 'R':
      restartPuzzle();
      break;
  }
  e.preventDefault();
});
```

---

## Daily Puzzle

```js
export function getDailyPuzzle(puzzles) {
  const start = new Date('2025-01-01');
  const today = new Date();
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return { puzzle: puzzles[diff % puzzles.length], index: diff };
}
```

---

## Visual Design

- **Dark theme**: background #0a0a0f
- **Grid cells**: ~56px squares, clearly distinct wall/floor/target colors
- **Walls**: dark gray or charcoal (#333)
- **Floor**: slightly lighter (#1a1a2e)
- **Target squares**: subtle glow, labeled with their required letter
- **Letter tiles**: bright white tiles with bold letter, clearly distinguishable from floor
- **Locked tiles**: green background when correctly placed
- **Player**: distinct character — a simple colored circle or emoji (👤)
- **Target word**: displayed prominently above the grid, with placed letters filling in as they lock
- **Move counter**: shown below the grid
- **Controls reminder**: "Arrow keys to move · U to undo · R to restart"

```
┌─────────────────────────┐
│  Sokoword #42           │
│  Spell: R A I N         │
│  [R][ ][ ][ ] ← fills in│
├─────────────────────────┤
│  ████████████████████   │
│  █  [R]            █   │
│  █  [A]            █   │
│  █      [I]        █   │
│  █  [N]            █   │
│  █  👤             █   │
│  █  ①②③④          █   │
│  ████████████████████   │
├─────────────────────────┤
│  Moves: 12              │
│  ↑↓←→ move · U undo    │
└─────────────────────────┘
```

---

## Minimal Persistence

```js
// Save progress on each move, restore on reload
localStorage.setItem(
  'sokoword',
  JSON.stringify({
    date: todayStr,
    puzzleId: puzzle.id,
    history: history, // full undo stack
    current: current,
    status: status,
  }),
);
```

---

## Share Card (on win)

```
🔠 Sokoword #42
RAIN in 34 moves
sokoword.game
```

---

## Puzzle Design Rules (CRITICAL)

Sokoban puzzles are notoriously easy to make unsolvable. Follow these rules strictly:

1. **Every puzzle must be solved by hand before adding it** — do not add unverified puzzles
2. **Avoid corners without targets** — a letter pushed into a corner is stuck forever
3. **Avoid edge traps** — letters against a wall can only move in one direction
4. **Leave enough space** — cramped grids create accidental deadlocks
5. **Test the hardest letter first** — the letter that's hardest to position determines difficulty
6. **Start simple** — first 5 puzzles should be solvable in under 10 moves
7. **One solution is enough** — don't worry about multiple paths, just verify one works

### Deadlock Detection (nice to have, not required for prototype)

```js
// Simple corner deadlock detection — letter in corner with no target there
function isCornerDeadlock(grid, x, y) {
  const cell = grid[y][x];
  if (!cell.letter || cell.locked) return false;
  const blockedH = grid[y][x - 1]?.type === 'wall' || grid[y][x + 1]?.type === 'wall';
  const blockedV = grid[y - 1]?.[x]?.type === 'wall' || grid[y + 1]?.[x]?.type === 'wall';
  return blockedH && blockedV && !cell.target;
}
// If detected, show a warning: "Dead end! Press R to restart or U to undo"
```

---

## Puzzle Generation Notes (LLM pipeline — harder than other games)

LLMs are poor at generating valid Sokoban puzzles because they cannot simulate spatial reasoning reliably. Options:

**Option A — Hand-craft all puzzles (recommended for prototype)**

- Author 20 puzzles by hand using the string grid format
- Verify each one manually
- This is feasible for a prototype — 20 good puzzles take ~2–3 hours

**Option B — LLM-assisted + solver validation (for scale)**

```
Prompt: "Generate a Sokoban puzzle on a 7x7 grid where the player must push
letters R, A, I, N onto 4 target squares to spell RAIN.
Place letters and targets so there is a clear solution path.
Avoid placing letters in corners or against walls near non-target edges.
Output as a string grid using the format: # wall, . floor, @ player,
letters as themselves, targets as 1/2/3/4."

Then: run a BFS/DFS solver to verify the puzzle is actually solvable.
Reject and regenerate if unsolvable.
```

**Option C — Procedural generator (future)**
Generate random valid configurations using a reverse-Sokoban approach:
start from the solved state and work backwards to create the start state.
This guarantees solvability by construction.

---

## Solver (for puzzle validation — implement as a separate script, not in the game)

```js
// solver.js — BFS solver to verify puzzles are solvable
// State = { playerPos, letterPositions }
// Explore all reachable states via BFS
// If any state matches solved condition → puzzle is valid
// If state space exhausted → puzzle is unsolvable, reject it

function solve(puzzle) {
  const initial = parseToSolverState(puzzle);
  const queue = [initial];
  const visited = new Set();

  while (queue.length > 0) {
    const state = queue.shift();
    const key = stateToKey(state);
    if (visited.has(key)) continue;
    visited.add(key);
    if (isSolvedState(state, puzzle)) return true;
    for (const dir of ['up', 'down', 'left', 'right']) {
      const next = applyMoveToSolverState(state, dir, puzzle);
      if (next) queue.push(next);
    }
  }
  return false; // unsolvable
}
```

Run this solver on every puzzle before adding it to puzzles.js.

---

## Do NOT build

- Touch/swipe controls
- User accounts or login
- Streak tracking
- Hint system
- Animations beyond simple color transitions
- Any external UI library
- Multiplayer
- Level editor (nice future feature, not for prototype)
