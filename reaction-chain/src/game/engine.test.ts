import { describe, it, expect } from 'vitest';
import { createInitialState, gameReducer } from './engine';

describe('createInitialState', () => {
  it('creates an 8x8 grid of zeros', () => {
    const state = createInitialState();
    expect(state.grid.length).toBe(8);
    expect(state.grid[0].length).toBe(8);
    expect(state.grid.every((row) => row.every((cell) => cell === 0))).toBe(true);
  });

  it('starts not won', () => {
    expect(createInitialState().isWon).toBe(false);
  });
});

describe('CLICK action', () => {
  it('increments a tile from 0 to 1', () => {
    const state = createInitialState();
    const next = gameReducer(state, { type: 'CLICK', row: 3, col: 3 });
    expect(next.grid[3][3]).toBe(1);
  });

  it('increments a tile from 2 to 3', () => {
    const state = createInitialState();
    const s1 = gameReducer(state, { type: 'CLICK', row: 0, col: 0 });
    const s2 = gameReducer(s1, { type: 'CLICK', row: 0, col: 0 });
    const s3 = gameReducer(s2, { type: 'CLICK', row: 0, col: 0 });
    expect(s3.grid[0][0]).toBe(3);
  });

  it('explodes at 4: resets tile to 0 and increments neighbors', () => {
    const state = createInitialState();
    const s1 = gameReducer(state, { type: 'CLICK', row: 4, col: 4 });
    const s2 = gameReducer(s1, { type: 'CLICK', row: 4, col: 4 });
    const s3 = gameReducer(s2, { type: 'CLICK', row: 4, col: 4 });
    // tile at (4,4) is now 3 — one more click should explode it
    const s4 = gameReducer(s3, { type: 'CLICK', row: 4, col: 4 });
    expect(s4.grid[4][4]).toBe(0);
    expect(s4.grid[3][4]).toBe(1);
    expect(s4.grid[5][4]).toBe(1);
    expect(s4.grid[4][3]).toBe(1);
    expect(s4.grid[4][5]).toBe(1);
  });

  it('corner explosion only spreads to valid neighbors', () => {
    const state = createInitialState();
    const s1 = gameReducer(state, { type: 'CLICK', row: 0, col: 0 });
    const s2 = gameReducer(s1, { type: 'CLICK', row: 0, col: 0 });
    const s3 = gameReducer(s2, { type: 'CLICK', row: 0, col: 0 });
    const s4 = gameReducer(s3, { type: 'CLICK', row: 0, col: 0 });
    expect(s4.grid[0][0]).toBe(0);
    expect(s4.grid[0][1]).toBe(1);
    expect(s4.grid[1][0]).toBe(1);
  });

  it('chain reaction: neighbor explosion propagates', () => {
    const state = createInitialState();
    // set (0,0) to 3 and (0,1) to 3 by clicking each 3 times
    let s = state;
    for (let i = 0; i < 3; i++) s = gameReducer(s, { type: 'CLICK', row: 0, col: 0 });
    for (let i = 0; i < 3; i++) s = gameReducer(s, { type: 'CLICK', row: 0, col: 1 });
    // clicking (0,0): explodes → (0,1) gets +1 → (0,1) explodes → (0,0) gets +1 again
    // final: (0,0)=1, (0,1)=0 — chain reaction confirmed because (0,1) reset to 0
    s = gameReducer(s, { type: 'CLICK', row: 0, col: 0 });
    expect(s.grid[0][1]).toBe(0); // (0,1) chain-exploded
    expect(s.grid[0][0]).toBe(1); // (0,0) got incremented back by (0,1)'s explosion
  });

  it('does nothing after win except RESET', () => {
    const state = { grid: Array.from({ length: 8 }, () => Array(8).fill(1)), isWon: true };
    const next = gameReducer(state, { type: 'CLICK', row: 0, col: 0 });
    expect(next).toBe(state);
  });
});

describe('RESET action', () => {
  it('returns a fresh initial state', () => {
    const state = createInitialState();
    const modified = gameReducer(state, { type: 'CLICK', row: 0, col: 0 });
    const reset = gameReducer(modified, { type: 'RESET' });
    expect(reset.grid[0][0]).toBe(0);
    expect(reset.isWon).toBe(false);
  });
});
