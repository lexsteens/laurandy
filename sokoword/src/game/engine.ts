import type { Cell, Direction, GameState, Grid, Pos, Puzzle } from './types';

const LETTER_RE = /^[A-Z]$/;
const TARGET_RE = /^[1-9]$/;

export function parseGrid(puzzle: Puzzle): Grid {
  return puzzle.grid.map((row) =>
    row.split('').map((char) => {
      const isWall = char === '#';
      const hasPlayer = char === '@';
      const isLetter = LETTER_RE.test(char);
      const isTarget = TARGET_RE.test(char);

      const cell: Cell = {
        type: isWall ? 'wall' : 'floor',
        hasPlayer,
        letter: isLetter ? char : null,
        target: isTarget
          ? { index: parseInt(char, 10) - 1, letter: puzzle.answer[parseInt(char, 10) - 1] }
          : null,
        locked: false,
      };
      return cell;
    }),
  );
}

export function initialState(puzzle: Puzzle): GameState {
  const grid = parseGrid(puzzle);
  let playerPos: Pos = { x: 0, y: 0 };

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < (grid[y]?.length ?? 0); x++) {
      if (grid[y]?.[x]?.hasPlayer) {
        playerPos = { x, y };
      }
    }
  }

  return {
    grid,
    playerPos,
    lockedCount: 0,
    totalTargets: puzzle.answer.length,
    moves: 0,
    status: 'playing',
  };
}

const DIRS: Record<Direction, Pos> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function cloneGrid(grid: Grid): Grid {
  return grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      target: cell.target !== null ? { ...cell.target } : null,
    })),
  );
}

export function move(state: GameState, direction: Direction): GameState | null {
  if (state.status === 'won') return null;

  const { x, y } = state.playerPos;
  const d = DIRS[direction];
  const nx = x + d.x;
  const ny = y + d.y;

  const next = state.grid[ny]?.[nx];
  if (!next || next.type === 'wall') return null;

  if (next.letter !== null && next.locked) return null; // locked tiles block movement

  if (next.letter !== null && !next.locked) {
    // Try to push the letter tile
    const bx = nx + d.x;
    const by = ny + d.y;
    const beyond = state.grid[by]?.[bx];

    if (!beyond || beyond.type === 'wall' || beyond.letter !== null) return null;

    const newGrid = cloneGrid(state.grid);
    const movingLetter = next.letter;

    newGrid[y][x]!.hasPlayer = false;
    newGrid[ny][nx]!.letter = null;
    newGrid[ny][nx]!.hasPlayer = true;
    newGrid[by][bx]!.letter = movingLetter;

    let newLockedCount = state.lockedCount;
    if (newGrid[by][bx]?.target?.letter === movingLetter) {
      newGrid[by][bx]!.locked = true;
      newLockedCount++;
    }

    const won = newLockedCount >= state.totalTargets;
    return {
      grid: newGrid,
      playerPos: { x: nx, y: ny },
      lockedCount: newLockedCount,
      totalTargets: state.totalTargets,
      moves: state.moves + 1,
      status: won ? 'won' : 'playing',
    };
  }

  // Normal move into empty floor
  const newGrid = cloneGrid(state.grid);
  newGrid[y][x]!.hasPlayer = false;
  newGrid[ny][nx]!.hasPlayer = true;

  return {
    ...state,
    grid: newGrid,
    playerPos: { x: nx, y: ny },
    moves: state.moves + 1,
  };
}

export function isSolved(state: GameState): boolean {
  return state.lockedCount >= state.totalTargets;
}
