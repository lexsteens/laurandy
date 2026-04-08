export type CellType = 'wall' | 'floor';

export interface Cell {
  type: CellType;
  hasPlayer: boolean;
  letter: string | null;
  wordIndex: number | null; // which planted word this tile belongs to (0 = answer)
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
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Puzzle {
  id: number;
  answer: string; // uppercase — hidden from player until won
  words: string[]; // all planted words uppercase (answer is words[0])
  letterSources: Record<string, number>; // "x,y" → wordIndex for initial tile placement
  grid: string[];
}

// A level is a grid template: only walls (#), floor (.), and player start (@).
// No letters — they are placed at runtime by the level generator.
export interface Level {
  id: number;
  name: string;
  grid: string[];
}
