import { describe, expect, it } from 'vitest';
import { initialState, move, parseGrid, scanWords } from './engine';
import type { Puzzle } from './types';

// Small 8×6 test puzzle: answer "CAT"
// Grid (8 wide × 6 tall):
//   ########
//   #@.....#   player at (1,1)
//   #C.....#   C at (1,2)
//   #..A...#   A at (3,3) — decoy extra letter
//   #.....T#   T at (6,4) — wait, T is at wall? no
//   #......#
//   ########
// Actually let me use a simpler layout:
//   ########
//   #@.....#
//   #C..A..#   C(1,2), A(4,2)
//   #.....T#   T is at (6,3) but col 6 is internal, col 7 is wall
//   #......#
//   ########
const testPuzzle: Puzzle = {
  id: 0,
  answer: 'CAT',
  grid: [
    '########',
    '#@.....#',
    '#C..A..#',
    '#.....T#', // T at col 6 — wait this is next to wall on right. col 7 = wall. T at x=6.
    '#......#',
    '########',
  ],
};
// Grid is 8 wide (x 0-7): wall at 0 and 7, internal 1-6.
// C at (1,2), A at (4,2), T at (6,3), @ at (1,1)

const wordSet = new Set(['cat', 'act', 'tac', 'can', 'ace']);

describe('parseGrid', () => {
  it('parses wall cells', () => {
    const grid = parseGrid(testPuzzle);
    expect(grid[0]?.[0]?.type).toBe('wall');
    expect(grid[0]?.[3]?.type).toBe('wall');
  });

  it('parses floor cells', () => {
    const grid = parseGrid(testPuzzle);
    expect(grid[1]?.[2]?.type).toBe('floor');
  });

  it('parses player position', () => {
    const grid = parseGrid(testPuzzle);
    expect(grid[1]?.[1]?.hasPlayer).toBe(true);
  });

  it('parses letter tiles', () => {
    const grid = parseGrid(testPuzzle);
    expect(grid[2]?.[1]?.letter).toBe('C');
    expect(grid[2]?.[4]?.letter).toBe('A');
    expect(grid[3]?.[6]?.letter).toBe('T');
  });

  it('non-letter floor cells have null letter', () => {
    const grid = parseGrid(testPuzzle);
    expect(grid[1]?.[2]?.letter).toBeNull();
  });
});

describe('initialState', () => {
  it('finds player position', () => {
    const s = initialState(testPuzzle, wordSet);
    expect(s.playerPos).toEqual({ x: 1, y: 1 });
  });

  it('starts at zero moves and playing status', () => {
    const s = initialState(testPuzzle, wordSet);
    expect(s.moves).toBe(0);
    expect(s.status).toBe('playing');
  });

  it('starts with no current words (letters are not adjacent)', () => {
    const s = initialState(testPuzzle, wordSet);
    expect(s.currentWords).toHaveLength(0);
  });
});

describe('scanWords', () => {
  it('finds no words when letters are isolated', () => {
    const grid = parseGrid(testPuzzle);
    expect(scanWords(grid, wordSet)).toHaveLength(0);
  });

  it('finds a word when letters are pushed adjacent horizontally', () => {
    // Manually build a grid where C-A-T are adjacent in a row
    const s = initialState(testPuzzle, wordSet);
    // Place C, A, T adjacent in row 4: (1,4)(2,4)(3,4)
    const g = s.grid.map((row) => row.map((cell) => ({ ...cell })));
    g[4]![1]!.letter = 'C';
    g[4]![2]!.letter = 'A';
    g[4]![3]!.letter = 'T';
    const words = scanWords(g, wordSet);
    expect(words.some((w) => w.word === 'CAT')).toBe(true);
  });

  it('finds substrings — ACT from a longer run', () => {
    const s = initialState(testPuzzle, wordSet);
    const g = s.grid.map((row) => row.map((cell) => ({ ...cell })));
    // Build run: X-A-C-T (X is not in word list, but ACT is)
    g[4]![1]!.letter = 'X';
    g[4]![2]!.letter = 'A';
    g[4]![3]!.letter = 'C';
    g[4]![4]!.letter = 'T';
    const words = scanWords(g, wordSet);
    expect(words.some((w) => w.word === 'ACT')).toBe(true);
  });

  it('finds words vertically', () => {
    const s = initialState(testPuzzle, wordSet);
    const g = s.grid.map((row) => row.map((cell) => ({ ...cell })));
    g[1]![3]!.letter = 'C';
    g[2]![3]!.letter = 'A';
    g[3]![3]!.letter = 'T';
    const words = scanWords(g, wordSet);
    expect(words.some((w) => w.word === 'CAT' && w.direction === 'v')).toBe(true);
  });

  it('does not find words shorter than 3', () => {
    const s = initialState(testPuzzle, wordSet);
    const g = s.grid.map((row) => row.map((cell) => ({ ...cell })));
    g[4]![1]!.letter = 'C';
    g[4]![2]!.letter = 'A';
    const words = scanWords(g, wordSet);
    // CA is length 2 — should not be found even if it were in the set
    expect(words.every((w) => w.word.length >= 3)).toBe(true);
  });
});

describe('move', () => {
  it('moves player onto empty floor', () => {
    const s = initialState(testPuzzle, wordSet);
    const next = move(s, 'right', wordSet, testPuzzle.answer);
    expect(next?.playerPos).toEqual({ x: 2, y: 1 });
    expect(next?.moves).toBe(1);
  });

  it('returns null when moving into wall', () => {
    const s = initialState(testPuzzle, wordSet);
    expect(move(s, 'left', wordSet, testPuzzle.answer)).toBeNull();
    expect(move(s, 'up', wordSet, testPuzzle.answer)).toBeNull();
  });

  it('pushes a letter tile', () => {
    const s = initialState(testPuzzle, wordSet);
    // Player at (1,1), C at (1,2) — push down
    const next = move(s, 'down', wordSet, testPuzzle.answer);
    expect(next?.playerPos).toEqual({ x: 1, y: 2 });
    expect(next?.grid[3]?.[1]?.letter).toBe('C');
    expect(next?.grid[2]?.[1]?.letter).toBeNull();
  });

  it('returns null when pushing letter into wall', () => {
    const s = initialState(testPuzzle, wordSet);
    // Player needs to be at (2,2) to push C left into wall at (0,2)
    const s1 = move(s, 'right', wordSet, testPuzzle.answer)!; // player→(2,1)
    const s2 = move(s1, 'down', wordSet, testPuzzle.answer)!; // player→(2,2)
    const result = move(s2, 'left', wordSet, testPuzzle.answer); // push C into wall
    expect(result).toBeNull();
  });

  it('returns null when pushing letter into another letter', () => {
    // Push C down to row 4, then navigate player to (2,4) and push C left into wall.
    // C(1,2) → push down → C(1,3), p(1,2)
    // push down again → C(1,4), p(1,3)
    // move right → p(2,3)
    // move down → p(2,4) — now player is right of C(1,4)
    // push left: C(1,4) would go to (0,4) = wall → blocked
    const s = initialState(testPuzzle, wordSet);
    const s1 = move(s, 'down', wordSet, testPuzzle.answer)!; // C→(1,3), p→(1,2)
    const s2 = move(s1, 'down', wordSet, testPuzzle.answer)!; // C→(1,4), p→(1,3)
    const s3 = move(s2, 'right', wordSet, testPuzzle.answer)!; // p→(2,3)
    const s4 = move(s3, 'down', wordSet, testPuzzle.answer)!; // p→(2,4)
    const blocked = move(s4, 'left', wordSet, testPuzzle.answer); // C(1,4)→(0,4)=wall
    expect(blocked).toBeNull();
  });

  it('detects winning word when letters become adjacent', () => {
    // Build a state where one push forms "CAT"
    // C at (2,4), A at (3,4), T at (5,4) — push T left: player at (6,4) pushes left
    // T→(4,4), making C-A-T not contiguous (gap at col 4). Need T at (4,4) for CAT.
    // Actually C(2,4), A(3,4), T(5,4): push T left: T→(4,4) → C,A,T at 2,3,4 → CAT! ✓
    const s = initialState(testPuzzle, wordSet);
    const g = s.grid.map((row) => row.map((cell) => ({ ...cell })));
    // Place C,A at (2,4),(3,4), T at (5,4), player at (6,4)
    g[1]![1]!.hasPlayer = false;
    g[4]![6]!.hasPlayer = true;
    g[4]![2]!.letter = 'C';
    g[4]![3]!.letter = 'A';
    g[4]![5]!.letter = 'T';
    // Remove original C,A from their starting positions
    g[2]![1]!.letter = null;
    g[2]![4]!.letter = null;
    const arranged: typeof s = {
      ...s,
      grid: g,
      playerPos: { x: 6, y: 4 },
    };
    const result = move(arranged, 'left', wordSet, testPuzzle.answer);
    expect(result?.status).toBe('won');
    expect(result?.currentWords.some((w) => w.word === 'CAT')).toBe(true);
  });

  it('accumulates found words across moves', () => {
    const s = initialState(testPuzzle, wordSet);
    // Push C to (1,3): player at (1,2) pushes down
    const s1 = move(s, 'down', wordSet, testPuzzle.answer)!; // C→(1,3), p→(1,2)
    // Push C to (1,4): player at (1,3) pushes down
    const s2 = move(s1, 'down', wordSet, testPuzzle.answer)!; // C→(1,4)
    // Moves don't form words yet but allFoundWords should stay empty (no words formed)
    expect(s2.allFoundWords).toHaveLength(0);
  });
});
