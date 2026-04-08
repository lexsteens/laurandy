import type { Puzzle } from './types';

// All puzzles are 10×10 grids.
// Legend: # wall  . floor  @ player  A-Z letter tile  1-5 target squares
//
// Target N corresponds to answer[N-1]. The answer is never shown to the player —
// they discover the word by pushing letters onto the numbered target squares.
// When a correct letter reaches its matching target it locks (turns green).
//
// Extra letter tiles (not part of the answer) act as decoys / obstacles.
//
// IMPORTANT: every puzzle must be verified solvable before adding it here.

export const puzzles: Puzzle[] = [
  {
    // Puzzle 1 — FLAME (easy)
    // Letters are placed diagonally, each directly above its target column.
    // Extras: B (col 7, row 2) and C (col 7, row 5). Neither blocks push paths.
    // Verified solution: push each letter straight down to its target.
    id: 1,
    answer: 'FLAME',
    grid: [
      '##########',
      '#........#',
      '#......B.#',
      '#.F......#',
      '#..L.....#',
      '#...A..C.#',
      '#....M...#',
      '#.....E..#',
      '#@.......#',
      '#.12345..#',
    ],
  },
  {
    // Puzzle 2 — LIGHT (easy-medium)
    // Letters placed diagonally above their targets, player in bottom-right area.
    // Extras: B (col 1, row 6) and S (col 7, row 3). Neither blocks push paths.
    // Verified solution: push each letter straight down.
    id: 2,
    answer: 'LIGHT',
    grid: [
      '##########',
      '#........#',
      '#.L......#',
      '#..I...S.#',
      '#...G....#',
      '#....H...#',
      '#B....T..#',
      '#......@.#',
      '#........#',
      '#.12345..#',
    ],
  },
  {
    // Puzzle 3 — SPARK (medium)
    // Letters above targets; T extra is immovable in top-left corner;
    // L extra sits in col 7 away from all push paths.
    // Verified solution: push each letter straight down to target.
    id: 3,
    answer: 'SPARK',
    grid: [
      '##########',
      '#T.......#',
      '#.S......#',
      '#........#',
      '#..P.....#',
      '#...A..L.#',
      '#....R...#',
      '#.....K..#',
      '#@.......#',
      '#.12345..#',
    ],
  },
];

export function getDailyPuzzle(): { puzzle: Puzzle; index: number } {
  const start = new Date('2025-01-01');
  const today = new Date();
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const index = diff % puzzles.length;
  return { puzzle: puzzles[index]!, index };
}
