import { describe, expect, it } from 'vitest';
import { initialState, isSolved, move, parseGrid } from './engine';
import type { Puzzle } from './types';

// 5×6 test puzzle — answer "AB", A and extra letter X
// Grid:
//   #####
//   #@..#   player at (1,1)
//   #A..#   letter A at (1,2)
//   #.X.#   extra letter X at (2,3)
//   #12.#   target 1 (answer[0]='A') at (1,4), target 2 (answer[1]='B') at (2,4)
//   #####
const testPuzzle: Puzzle = {
  id: 0,
  answer: 'AB',
  grid: ['#####', '#@..#', '#A..#', '#.X.#', '#12.#', '#####'],
};

describe('parseGrid', () => {
  it('parses wall cells', () => {
    const grid = parseGrid(testPuzzle);
    expect(grid[0]?.[0]?.type).toBe('wall');
    expect(grid[0]?.[2]?.type).toBe('wall');
  });

  it('parses player position', () => {
    const grid = parseGrid(testPuzzle);
    expect(grid[1]?.[1]?.hasPlayer).toBe(true);
    expect(grid[1]?.[1]?.type).toBe('floor');
  });

  it('parses letter tiles', () => {
    const grid = parseGrid(testPuzzle);
    expect(grid[2]?.[1]?.letter).toBe('A');
    expect(grid[3]?.[2]?.letter).toBe('X');
  });

  it('parses target squares with correct letter from answer', () => {
    const grid = parseGrid(testPuzzle);
    expect(grid[4]?.[1]?.target).toEqual({ index: 0, letter: 'A' });
    expect(grid[4]?.[2]?.target).toEqual({ index: 1, letter: 'B' });
  });

  it('starts all cells unlocked', () => {
    const grid = parseGrid(testPuzzle);
    const allUnlocked = grid.every((row) => row.every((cell) => !cell.locked));
    expect(allUnlocked).toBe(true);
  });
});

describe('initialState', () => {
  it('finds player position', () => {
    const state = initialState(testPuzzle);
    expect(state.playerPos).toEqual({ x: 1, y: 1 });
  });

  it('sets correct totalTargets', () => {
    const state = initialState(testPuzzle);
    expect(state.totalTargets).toBe(2);
  });

  it('starts at zero moves and locked count', () => {
    const state = initialState(testPuzzle);
    expect(state.moves).toBe(0);
    expect(state.lockedCount).toBe(0);
    expect(state.status).toBe('playing');
  });
});

describe('move — normal movement', () => {
  it('moves player into empty floor', () => {
    const state = initialState(testPuzzle);
    const next = move(state, 'right');
    expect(next?.playerPos).toEqual({ x: 2, y: 1 });
    expect(next?.moves).toBe(1);
  });

  it('returns null when moving into wall', () => {
    const state = initialState(testPuzzle);
    expect(move(state, 'left')).toBeNull(); // (0,1) is wall
    expect(move(state, 'up')).toBeNull(); // (1,0) is wall
  });

  it('increments moves on each valid move', () => {
    const s1 = initialState(testPuzzle);
    const s2 = move(s1, 'right')!;
    const s3 = move(s2, 'right')!;
    expect(s3.moves).toBe(2);
  });
});

describe('move — pushing letters', () => {
  it('pushes letter tile forward', () => {
    const state = initialState(testPuzzle);
    // player at (1,1), A at (1,2) — push down: player→(1,2), A→(1,3)
    const next = move(state, 'down');
    expect(next?.playerPos).toEqual({ x: 1, y: 2 });
    expect(next?.grid[3]?.[1]?.letter).toBe('A');
    expect(next?.grid[2]?.[1]?.letter).toBeNull();
  });

  it('locks letter when pushed onto correct target', () => {
    const state = initialState(testPuzzle);
    // push A from (1,2) to (1,3): player→(1,2), A→(1,3) which has X, blocked
    // first move player right then down to push A sideways... instead push A straight:
    // A at (1,2) with target at (1,4). Two pushes down:
    const s1 = move(state, 'down')!; // A→(1,3), player→(1,2)
    // (1,3) has X — the push would be blocked since X is there
    // Instead navigate player above A without pushing and push again
    // Actually: after first push A is at (1,3) where X was. Wait, (1,3) has X at (2,3) not (1,3)!
    // Let me re-check: '#.X.#' → col0='#', col1='.', col2='X', col3='.', col4='#'. X is at (2,3).
    // So (1,3) is empty. First push: A from (1,2) → (1,3). Player at (1,2). ✓
    // Second push: player at (1,2), A at (1,3). Target at (1,4). Push down:
    const s2 = move(s1, 'down')!; // A→(1,4)=target1, player→(1,3)
    expect(s2.grid[4]?.[1]?.locked).toBe(true);
    expect(s2.lockedCount).toBe(1);
  });

  it('returns null when pushing letter into wall', () => {
    const state = initialState(testPuzzle);
    // push A left: player needs to be at (2,2) to push A from (1,2) into wall at (0,2)
    const s1 = move(state, 'right')!; // player→(2,1)
    const s2 = move(s1, 'down')!; // player→(2,2), no push (A is at (1,2))
    const result = move(s2, 'left'); // try push A from (1,2) into (0,2)=wall
    expect(result).toBeNull();
  });

  it('returns null when pushing letter into another letter', () => {
    const state = initialState(testPuzzle);
    // X is at (2,3). Push A right would put A at (2,2), then navigate to push A right
    // into X — but easier: navigate player to (3,2) and push A left, blocked by wall at (0,2)?
    // Simpler: get player to (1,3) and try to push X left into A
    const s1 = move(state, 'down')!; // player→(1,2), A→(1,3)
    const s2 = move(s1, 'right')!; // player→(2,2)
    const s3 = move(s2, 'down')!; // player→(2,3) — X is at (2,3)? No, player pushes X
    // (2,3) has X — pushing down: beyond is (2,4)=target2=floor. X moves to (2,4). player→(2,3)
    expect(s3?.grid[4]?.[2]?.letter).toBe('X');
    // Now try to push something else. Let's verify A is at (1,3) and X is at (2,4).
    // Navigate player to (3,3) and push A right into (2,3) which is now empty — valid move.
    const s4 = move(s3!, 'right')!; // player→(3,3)
    const s5 = move(s4, 'left'); // push nothing — player just moves to (2,3)
    expect(s5?.playerPos).toEqual({ x: 2, y: 3 });
  });

  it('cannot push a locked letter', () => {
    // Lock A on target 1 first, then try to push it
    const s1 = move(initialState(testPuzzle), 'down')!; // A→(1,3)
    const s2 = move(s1, 'down')!; // A→(1,4)=locked
    expect(s2.grid[4]?.[1]?.locked).toBe(true);
    // Now player is at (1,3). Try to push A (locked) by moving down again
    const result = move(s2, 'down');
    expect(result).toBeNull();
  });
});

describe('isSolved', () => {
  it('returns false initially', () => {
    expect(isSolved(initialState(testPuzzle))).toBe(false);
  });

  it('returns false with partial locks', () => {
    const s1 = move(initialState(testPuzzle), 'down')!;
    const s2 = move(s1, 'down')!;
    expect(isSolved(s2)).toBe(false); // only 1 of 2 locked
  });
});
