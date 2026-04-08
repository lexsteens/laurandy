import type { Cell, Direction, GameState, Grid, Pos, Puzzle, WordMatch } from './types';

const LETTER_RE = /^[A-Z]$/;

export function parseGrid(puzzle: Puzzle): Grid {
  return puzzle.grid.map((row) =>
    row.split('').map((char) => {
      const cell: Cell = {
        type: char === '#' ? 'wall' : 'floor',
        hasPlayer: char === '@',
        letter: LETTER_RE.test(char) ? char : null,
      };
      return cell;
    }),
  );
}

// ── Word scanning ─────────────────────────────────────────────────────────────

interface Run {
  cells: Array<{ x: number; y: number; letter: string }>;
  direction: 'h' | 'v';
}

function getContiguousRuns(grid: Grid): Run[] {
  const runs: Run[] = [];
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  // Horizontal
  for (let y = 0; y < rows; y++) {
    let run: Run['cells'] = [];
    for (let x = 0; x < cols; x++) {
      const letter = grid[y]?.[x]?.letter ?? null;
      if (letter !== null) {
        run.push({ x, y, letter });
      } else {
        if (run.length >= 2) runs.push({ cells: run, direction: 'h' });
        run = [];
      }
    }
    if (run.length >= 2) runs.push({ cells: run, direction: 'h' });
  }

  // Vertical
  for (let x = 0; x < cols; x++) {
    let run: Run['cells'] = [];
    for (let y = 0; y < rows; y++) {
      const letter = grid[y]?.[x]?.letter ?? null;
      if (letter !== null) {
        run.push({ x, y, letter });
      } else {
        if (run.length >= 2) runs.push({ cells: run, direction: 'v' });
        run = [];
      }
    }
    if (run.length >= 2) runs.push({ cells: run, direction: 'v' });
  }

  return runs;
}

export function scanWords(grid: Grid, wordSet: Set<string>): WordMatch[] {
  const found: WordMatch[] = [];
  for (const { cells, direction } of getContiguousRuns(grid)) {
    const seq = cells.map((c) => c.letter).join('');
    for (let i = 0; i < seq.length; i++) {
      for (let j = i + 3; j <= seq.length; j++) {
        const sub = seq.slice(i, j);
        if (wordSet.has(sub.toLowerCase())) {
          found.push({
            word: sub,
            startPos: { x: cells[i]!.x, y: cells[i]!.y },
            direction,
          });
        }
      }
    }
  }
  return found;
}

// ── State ─────────────────────────────────────────────────────────────────────

export function initialState(puzzle: Puzzle, wordSet: Set<string>): GameState {
  const grid = parseGrid(puzzle);
  let playerPos: Pos = { x: 0, y: 0 };

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < (grid[y]?.length ?? 0); x++) {
      if (grid[y]?.[x]?.hasPlayer) playerPos = { x, y };
    }
  }

  const currentWords = scanWords(grid, wordSet);

  return {
    grid,
    playerPos,
    moves: 0,
    status: 'playing',
    currentWords,
  };
}

// ── Movement ──────────────────────────────────────────────────────────────────

const DIRS: Record<Direction, Pos> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.map((cell) => ({ ...cell })));
}

export function move(
  state: GameState,
  direction: Direction,
  wordSet: Set<string>,
  answer: string,
): GameState | null {
  if (state.status === 'won') return null;

  const { x, y } = state.playerPos;
  const d = DIRS[direction];
  const nx = x + d.x;
  const ny = y + d.y;

  const next = state.grid[ny]?.[nx];
  if (!next || next.type === 'wall') return null;

  const newGrid = cloneGrid(state.grid);

  if (next.letter !== null) {
    // Try to push the letter tile one step further
    const bx = nx + d.x;
    const by = ny + d.y;
    const beyond = state.grid[by]?.[bx];

    if (!beyond || beyond.type === 'wall' || beyond.letter !== null) return null;

    const movingLetter = next.letter;
    newGrid[y]![x]!.hasPlayer = false;
    newGrid[ny]![nx]!.letter = null;
    newGrid[ny]![nx]!.hasPlayer = true;
    newGrid[by]![bx]!.letter = movingLetter;
  } else {
    // Normal move onto empty floor
    newGrid[y]![x]!.hasPlayer = false;
    newGrid[ny]![nx]!.hasPlayer = true;
  }

  const currentWords = scanWords(newGrid, wordSet);
  const won = currentWords.some((w) => w.word === answer);

  return {
    grid: newGrid,
    playerPos: { x: nx, y: ny },
    moves: state.moves + 1,
    status: won ? 'won' : 'playing',
    currentWords,
  };
}
