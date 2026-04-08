export type CellType = 'wall' | 'floor';

export interface Target {
  index: number; // 0-based position in the answer word
  letter: string; // correct letter for this target (not shown to player)
}

export interface Cell {
  type: CellType;
  hasPlayer: boolean;
  letter: string | null; // letter tile currently on this cell (null if empty)
  target: Target | null; // non-null if this is a target square
  locked: boolean; // true when the correct letter is locked here
}

export type Grid = Cell[][];

export interface Pos {
  x: number;
  y: number;
}

export interface GameState {
  grid: Grid;
  playerPos: Pos;
  lockedCount: number;
  totalTargets: number;
  moves: number;
  status: 'playing' | 'won';
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Puzzle {
  id: number;
  answer: string;
  grid: string[];
}
