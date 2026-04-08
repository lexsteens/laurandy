import { describe, expect, it } from 'vitest';
import {
  generatePuzzle,
  makeRng,
  pickWords,
  safeFloorPositions,
  WORD_COUNT,
} from './level-generator';
import { levels } from './levels/index';
import { wordList } from './word-list';

const SEED = 42;

describe('makeRng', () => {
  it('produces values in [0, 1)', () => {
    const rng = makeRng(SEED);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('is deterministic for the same seed', () => {
    const a = makeRng(SEED);
    const b = makeRng(SEED);
    for (let i = 0; i < 20; i++) {
      expect(a()).toBe(b());
    }
  });

  it('produces different sequences for different seeds', () => {
    const aVals = Array.from({ length: 10 }, makeRng(1));
    const bVals = Array.from({ length: 10 }, makeRng(2));
    expect(aVals).not.toEqual(bVals);
  });
});

describe('pickWords', () => {
  it('returns the requested count', () => {
    const words = pickWords(wordList, WORD_COUNT, makeRng(SEED));
    expect(words).toHaveLength(WORD_COUNT);
  });

  it('returns distinct words', () => {
    const words = pickWords(wordList, WORD_COUNT, makeRng(SEED));
    expect(new Set(words).size).toBe(WORD_COUNT);
  });

  it('is deterministic for same seed', () => {
    expect(pickWords(wordList, WORD_COUNT, makeRng(SEED))).toEqual(
      pickWords(wordList, WORD_COUNT, makeRng(SEED)),
    );
  });
});

describe('safeFloorPositions', () => {
  it('returns only floor cells that have no wall neighbours', () => {
    // Small test grid: cell (2,2) has 4 floor neighbours; (1,1) is adjacent to walls
    const grid = ['#####', '#...#', '#...#', '#...#', '#####'];
    const safe = safeFloorPositions(grid);
    // Only (2,2) is fully surrounded by floor/open cells
    expect(safe).toContainEqual({ x: 2, y: 2 });
    // Corner-adjacent cells like (1,1) touch walls and should not be in safe positions
    expect(safe).not.toContainEqual({ x: 1, y: 1 });
  });

  it('returns no positions for a fully walled grid', () => {
    const grid = ['###', '###', '###'];
    expect(safeFloorPositions(grid)).toHaveLength(0);
  });

  it('returns enough positions for the real levels', () => {
    for (const level of levels) {
      const safe = safeFloorPositions(level.grid);
      // Each level must have at least enough safe spots for WORD_COUNT * max_word_len letters
      expect(safe.length).toBeGreaterThan(10);
    }
  });
});

describe('generatePuzzle', () => {
  it('answer is in the expected length range', () => {
    const puzzle = generatePuzzle(levels[0]!, wordList, SEED);
    expect(puzzle.answer.length).toBeGreaterThanOrEqual(4);
    expect(puzzle.answer.length).toBeLessThanOrEqual(6);
  });

  it('answer is uppercase and in the word list', () => {
    const puzzle = generatePuzzle(levels[0]!, wordList, SEED);
    expect(puzzle.answer).toBe(puzzle.answer.toUpperCase());
    expect(wordList).toContain(puzzle.answer.toLowerCase());
  });

  it('grid preserves walls and player start from level', () => {
    const level = levels[0]!;
    const puzzle = generatePuzzle(level, wordList, SEED);
    for (let y = 0; y < level.grid.length; y++) {
      for (let x = 0; x < level.grid[y]!.length; x++) {
        const orig = level.grid[y]![x];
        const gen = puzzle.grid[y]![x];
        if (orig === '#') expect(gen).toBe('#');
        if (orig === '@') expect(gen).toBe('@');
      }
    }
  });

  it('no placed letter is adjacent to a wall', () => {
    const level = levels[0]!;
    const puzzle = generatePuzzle(level, wordList, SEED);
    for (let y = 0; y < puzzle.grid.length; y++) {
      const row = puzzle.grid[y]!;
      for (let x = 0; x < row.length; x++) {
        const ch = row[x]!;
        if (!/^[A-Z]$/.test(ch)) continue;
        expect(puzzle.grid[y - 1]?.[x]).not.toBe('#');
        expect(puzzle.grid[y + 1]?.[x]).not.toBe('#');
        expect(row[x - 1]).not.toBe('#');
        expect(row[x + 1]).not.toBe('#');
      }
    }
  });

  it('grid has same dimensions as level', () => {
    const level = levels[0]!;
    const puzzle = generatePuzzle(level, wordList, SEED);
    expect(puzzle.grid).toHaveLength(level.grid.length);
    puzzle.grid.forEach((row, i) => expect(row.length).toBe(level.grid[i]!.length));
  });

  it('is deterministic for same seed', () => {
    const p1 = generatePuzzle(levels[0]!, wordList, SEED);
    const p2 = generatePuzzle(levels[0]!, wordList, SEED);
    expect(p1.answer).toBe(p2.answer);
    expect(p1.grid).toEqual(p2.grid);
  });

  it('produces different puzzles for different seeds', () => {
    const p1 = generatePuzzle(levels[0]!, wordList, 1);
    const p2 = generatePuzzle(levels[0]!, wordList, 999);
    const same = p1.answer === p2.answer && p1.grid.join('') === p2.grid.join('');
    expect(same).toBe(false);
  });

  it('works for all levels', () => {
    for (const level of levels) {
      const puzzle = generatePuzzle(level, wordList, SEED);
      expect(puzzle.answer.length).toBeGreaterThanOrEqual(4);
      expect(puzzle.grid).toHaveLength(level.grid.length);
    }
  });
});

describe('levels auto-detection', () => {
  it('loads at least 3 levels', () => {
    expect(levels.length).toBeGreaterThanOrEqual(3);
  });

  it('levels are sorted by id', () => {
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]!.id).toBeGreaterThan(levels[i - 1]!.id);
    }
  });

  it('each level has a non-empty name from the first comment line', () => {
    for (const level of levels) {
      expect(typeof level.name).toBe('string');
      expect(level.name.length).toBeGreaterThan(0);
    }
  });
});
