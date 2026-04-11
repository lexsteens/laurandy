import type { Grid, GameState, Action } from './types';

const ROWS = 8;
const COLS = 8;
const MAX = 4;

export function createInitialState(): GameState {
  const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  return { grid, isWon: false };
}

function neighbors(r: number, c: number): [number, number][] {
  return (
    [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ] as [number, number][]
  ).filter(([nr, nc]) => nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS);
}

function applyChain(grid: Grid, startRow: number, startCol: number): Grid {
  const next = grid.map((r) => [...r]);
  const queue: [number, number][] = [[startRow, startCol]];

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    next[r][c] += 1;
    if (next[r][c] >= MAX) {
      next[r][c] = 0;
      for (const n of neighbors(r, c)) queue.push(n);
    }
  }

  return next;
}

// Returns one Grid snapshot per queue step — used by UI to animate the chain.
export function applyChainSteps(grid: Grid, startRow: number, startCol: number): Grid[] {
  const steps: Grid[] = [];
  let current = grid.map((r) => [...r]);
  const queue: [number, number][] = [[startRow, startCol]];

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    current = current.map((row) => [...row]);
    current[r][c] += 1;
    if (current[r][c] >= MAX) {
      current[r][c] = 0;
      for (const n of neighbors(r, c)) queue.push(n);
    }
    steps.push(current.map((row) => [...row]));
  }

  return steps;
}

function checkWin(grid: Grid): boolean {
  return grid.every((row) => row.every((cell) => cell > 0));
}

export function gameReducer(state: GameState, action: Action): GameState {
  if (state.isWon && action.type !== 'RESET') return state;

  switch (action.type) {
    case 'CLICK': {
      const grid = applyChain(state.grid, action.row, action.col);
      return { grid, isWon: checkWin(grid) };
    }
    case 'RESET':
      return createInitialState();
    default:
      return state;
  }
}
