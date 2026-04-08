import { parseGrid, scanWords } from './engine';
import type { Level, Puzzle } from './types';

// ── Configurable constants ────────────────────────────────────────────────────

export const WORD_COUNT = 3;

const ANSWER_MIN_LEN = 4;
const ANSWER_MAX_LEN = 6;
const MAX_SCATTER_ATTEMPTS = 20;

// ── Seeded RNG (Mulberry32) ───────────────────────────────────────────────────

export function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function pickWords(wordList: string[], count: number, rng: () => number): string[] {
  return shuffle(wordList, rng).slice(0, count);
}

// ── Letter placement filtering ────────────────────────────────────────────────

// Returns all floor cells (.) that have no wall (#) among their 4 neighbours.
// This ensures every placed letter can be pushed in all 4 directions and
// avoids immediately-deadlocked starting positions.
export function safeFloorPositions(levelGrid: string[]): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < levelGrid.length; y++) {
    const row = levelGrid[y]!;
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== '.') continue;
      const up = levelGrid[y - 1]?.[x] ?? '#';
      const down = levelGrid[y + 1]?.[x] ?? '#';
      const left = row[x - 1] ?? '#';
      const right = row[x + 1] ?? '#';
      if (up !== '#' && down !== '#' && left !== '#' && right !== '#') {
        positions.push({ x, y });
      }
    }
  }
  return positions;
}

function placeLetters(
  levelGrid: string[],
  placements: Array<{ x: number; y: number; letter: string }>,
): string[] {
  const rows = levelGrid.map((row) => row.split(''));
  for (const { x, y, letter } of placements) {
    rows[y]![x] = letter;
  }
  return rows.map((row) => row.join(''));
}

// ── Puzzle generation ─────────────────────────────────────────────────────────

/**
 * Generate a puzzle from a level template.
 *
 * Picks WORD_COUNT random words. The first word in the answer length range
 * becomes the hidden answer. All letters from all words are scattered on
 * safe floor cells (no wall neighbours). Reshuffles if any chosen word is
 * accidentally pre-formed in the initial layout.
 */
export function generatePuzzle(level: Level, wordList: string[], seed: number): Puzzle {
  const rng = makeRng(seed);

  const answerCandidates = wordList.filter(
    (w) => w.length >= ANSWER_MIN_LEN && w.length <= ANSWER_MAX_LEN,
  );

  const shuffledAnswers = shuffle(answerCandidates, rng);
  const answer = (shuffledAnswers[0] ?? 'flame').toUpperCase();

  const remaining = shuffle(
    wordList.filter((w) => w.toUpperCase() !== answer),
    rng,
  );
  const decoys = remaining.slice(0, WORD_COUNT - 1);

  const allLetters = [answer, ...decoys.map((w) => w.toUpperCase())].flatMap((w) => w.split(''));

  const safe = safeFloorPositions(level.grid);
  const wordSetLower = new Set(wordList.map((w) => w.toLowerCase()));

  let lastGrid = level.grid;

  for (let attempt = 0; attempt < MAX_SCATTER_ATTEMPTS; attempt++) {
    const positions = shuffle(safe, rng).slice(0, allLetters.length);
    const letters = shuffle(allLetters, rng);
    const placements = positions.map((pos, i) => ({ ...pos, letter: letters[i]! }));
    const grid = placeLetters(level.grid, placements);
    lastGrid = grid;

    const parsed = parseGrid({ id: level.id, answer, grid });
    const preFormed = new Set(scanWords(parsed, wordSetLower).map((w) => w.word));
    const anyPreFormed = [answer, ...decoys.map((w) => w.toUpperCase())].some((w) =>
      preFormed.has(w),
    );

    if (!anyPreFormed) {
      return { id: level.id * 10000 + (seed % 10000), answer, grid };
    }
  }

  return { id: level.id * 10000 + (seed % 10000), answer, grid: lastGrid };
}

// ── Day index (for display only) ──────────────────────────────────────────────

export function getDayIndex(): number {
  const start = new Date('2025-01-01');
  const today = new Date();
  return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
