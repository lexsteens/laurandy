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

export type ExplosionEvent = {
  stepIndex: number;
  row: number;
  col: number;
  toNeighbors: [number, number][];
};

// Returns one Grid snapshot per wave (all cells in a wave update simultaneously)
// and explosion events. Wave-based BFS ensures that all 4 neighbors of an explosion
// are shown in the same step.
export function applyChainSteps(
  grid: Grid,
  startRow: number,
  startCol: number,
): { steps: Grid[]; explosions: ExplosionEvent[] } {
  const steps: Grid[] = [];
  const explosions: ExplosionEvent[] = [];
  let current = grid.map((r) => [...r]);
  let wave: [number, number][] = [[startRow, startCol]];

  while (wave.length > 0) {
    const nextWave: [number, number][] = [];
    current = current.map((r) => [...r]);

    for (const [r, c] of wave) {
      current[r][c] += 1;
      if (current[r][c] >= MAX) {
        current[r][c] = 0;
        const nbrs = neighbors(r, c);
        for (const n of nbrs) nextWave.push(n);
        explosions.push({ stepIndex: steps.length, row: r, col: c, toNeighbors: nbrs });
      }
    }

    steps.push(current.map((r) => [...r]));
    wave = nextWave;
  }

  return { steps, explosions };
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
