export type CellType = 'wall' | 'floor';

export interface Cell {
  type: CellType;
  hasPlayer: boolean;
  letter: string | null;
}

export type Grid = Cell[][];

export interface Pos {
  x: number;
  y: number;
}

export interface WordMatch {
  word: string; // uppercase letters as on grid
  startPos: Pos;
  direction: 'h' | 'v';
}

export interface GameState {
  grid: Grid;
  playerPos: Pos;
  moves: number;
  status: 'playing' | 'won';
  currentWords: WordMatch[]; // words currently formed on the grid
  allFoundWords: string[]; // all unique words seen since game start (uppercase)
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Puzzle {
  id: number;
  answer: string; // uppercase — hidden from player until won
  grid: string[];
}
