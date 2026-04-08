import type { Puzzle } from './types';

// All puzzles: 18 cols × 12 rows (wall border, 16×10 internal playfield).
// Legend: # wall  . floor  @ player  A-Z letter tile
//
// The answer is NEVER shown to the player — they discover it by pushing
// letters into a contiguous horizontal or vertical sequence.
// Any valid word ≥ 3 letters that forms on the grid is highlighted;
// forming the answer word wins the puzzle.
//
// Design rules:
//   - Answer letters must NOT already be adjacent at puzzle start.
//   - Decoy letters should be clearly separate from each other and from answer letters.
//   - Verify by hand that the answer word can be formed by pushing.

export const puzzles: Puzzle[] = [
  {
    // Answer: FLAME
    // Answer letters: F(2,1) L(12,2) A(7,4) M(11,6) E(8,8)
    // Decoys: B(15,1) Z(6,2) N(3,3) R(14,3) D(2,5) X(15,5) Y(2,7) P(10,7) K(6,9) V(12,9)
    // Player: (5,10)
    id: 1,
    answer: 'FLAME',
    grid: [
      '##################',
      '#.F............B.#',
      '#.....Z.....L....#',
      '#..N..........R..#',
      '#......A.........#',
      '#.D...........X..#',
      '#..........M.....#',
      '#.Y.......P......#',
      '#.......E........#',
      '#.....K.....V....#',
      '#....@...........#',
      '##################',
    ],
  },
  {
    // Answer: STORM
    // Answer letters: S(11,1) T(10,3) O(2,5) R(10,7) M(2,9)
    // Decoys: B(4,1) X(15,1) W(2,2) G(9,2) Y(14,2) N(5,3) J(6,4) D(13,4) P(8,5) V(14,5)
    //         C(6,6) K(11,6) H(3,7) Q(6,8) Z(13,8) F(9,9)
    // Player: (8,10)
    id: 2,
    answer: 'STORM',
    grid: [
      '##################',
      '#...B......S...X.#',
      '#.W......G....Y..#',
      '#....N....T......#',
      '#.....J......D...#',
      '#.O.....P.....V..#',
      '#.....C....K.....#',
      '#..H......R......#',
      '#.....Q......Z...#',
      '#.M......F.......#',
      '#.......@........#',
      '##################',
    ],
  },
  {
    // Answer: BLEND
    // Answer letters: B(3,1) L(10,3) E(6,5) N(13,7) D(4,9)
    // Decoys: A(14,1) C(7,2) H(13,2) M(2,4) P(11,4) G(3,6) W(5,6) X(14,6) R(2,7) K(9,8)
    //         T(15,8) V(7,9)
    // Player: (10,10)
    id: 3,
    answer: 'BLEND',
    grid: [
      '##################',
      '#..B..........A..#',
      '#......C.....H...#',
      '#.........L......#',
      '#.M........P.....#',
      '#.....E..........#',
      '#..G.W........X..#',
      '#.R...........N..#',
      '#........K.....T.#',
      '#...D..V.........#',
      '#.........@......#',
      '##################',
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
