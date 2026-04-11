export type Grid = number[][];

export type GameState = {
  grid: Grid;
  isWon: boolean;
};

export type Action = { type: 'CLICK'; row: number; col: number } | { type: 'RESET' };
