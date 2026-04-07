import { describe, it, expect } from 'vitest';
import {
  createGame,
  applyHint,
  guessLetter,
  toggleKeepCorrect,
  getBlankIndices,
  getNextBlankIndex,
  getPrevBlankIndex,
  clearFlash,
  revealAll,
} from './engine';

describe('createGame', () => {
  it('initializes with all blanks and correct score', () => {
    const state = createGame('PARENT');
    expect(state.target).toBe('parent');
    expect(state.score).toBe(60); // 6 letters × 10
    expect(state.maxScore).toBe(60);
    expect(state.tiles).toHaveLength(6);
    expect(state.tiles.every((t) => !t.visible)).toBe(true);
    expect(state.solved).toBe(false);
    expect(state.keepCorrect).toBe(true);
  });
});

describe('applyHint', () => {
  it('reveals even-index letters and deducts points', () => {
    const state = createGame('parent');
    const next = applyHint(state, 'even');
    // even indices: 0, 2, 4 → p, r, n
    expect(next.tiles[0].visible).toBe(true);
    expect(next.tiles[1].visible).toBe(false);
    expect(next.tiles[2].visible).toBe(true);
    expect(next.tiles[3].visible).toBe(false);
    expect(next.tiles[4].visible).toBe(true);
    expect(next.tiles[5].visible).toBe(false);
    expect(next.score).toBe(57); // 60 - 3
  });

  it('reveals odd-index letters', () => {
    const state = createGame('parent');
    const next = applyHint(state, 'odd');
    expect(next.tiles[0].visible).toBe(false);
    expect(next.tiles[1].visible).toBe(true); // a
    expect(next.tiles[3].visible).toBe(true); // e
    expect(next.tiles[5].visible).toBe(true); // t
    expect(next.score).toBe(57);
  });

  it('reveals vowels', () => {
    const state = createGame('parent');
    const next = applyHint(state, 'vowels');
    // vowels in 'parent': a(1), e(3)
    expect(next.tiles[1].visible).toBe(true);
    expect(next.tiles[3].visible).toBe(true);
    expect(next.score).toBe(58); // 60 - 2
  });

  it('reveals first letter', () => {
    const state = createGame('parent');
    const next = applyHint(state, 'first');
    expect(next.tiles[0].visible).toBe(true);
    expect(next.score).toBe(59);
  });

  it('reveals last letter', () => {
    const state = createGame('parent');
    const next = applyHint(state, 'last');
    expect(next.tiles[5].visible).toBe(true);
    expect(next.score).toBe(59);
  });

  it('does not double-count already revealed letters', () => {
    let state = createGame('parent');
    state = applyHint(state, 'first'); // reveals p, cost 1
    state = applyHint(state, 'even'); // reveals indices 0,2,4 but 0 already visible → cost 2
    expect(state.score).toBe(57); // 60 - 1 - 2
  });

  it('returns same state if hint reveals nothing new', () => {
    let state = createGame('parent');
    state = applyHint(state, 'first');
    const again = applyHint(state, 'first');
    expect(again).toBe(state); // reference equality — no change
  });

  it('does nothing when solved', () => {
    let state = createGame('ab');
    state = revealAll(state);
    const next = applyHint(state, 'first');
    expect(next).toBe(state);
  });
});

describe('guessLetter', () => {
  it('marks correct guess and deducts keepCorrect cost', () => {
    const state = createGame('parent');
    const next = guessLetter(state, 0, 'p');
    expect(next.tiles[0].visible).toBe(true); // keepCorrect is ON
    expect(next.tiles[0].source).toBe('guess');
    expect(next.flash[0]).toBe('correct');
    expect(next.score).toBe(59); // -1 for keeping
  });

  it('correct guess with keepCorrect OFF does not show letter', () => {
    let state = createGame('parent');
    state = toggleKeepCorrect(state);
    const next = guessLetter(state, 0, 'p');
    expect(next.tiles[0].visible).toBe(false);
    expect(next.tiles[0].source).toBe('guess');
    expect(next.flash[0]).toBe('correct');
    expect(next.score).toBe(60); // no cost
  });

  it('wrong guess flashes without penalty', () => {
    const state = createGame('parent');
    const next = guessLetter(state, 0, 'x');
    expect(next.tiles[0].visible).toBe(false);
    expect(next.flash[0]).toBe('wrong');
    expect(next.score).toBe(60); // no penalty
  });

  it('does not allow guessing a hinted position', () => {
    let state = createGame('parent');
    state = applyHint(state, 'first');
    const next = guessLetter(state, 0, 'p');
    expect(next).toBe(state);
  });

  it('solves game when all letters identified', () => {
    let state = createGame('ab');
    state = guessLetter(state, 0, 'a');
    expect(state.solved).toBe(false);
    state = guessLetter(state, 1, 'b');
    expect(state.solved).toBe(true);
  });

  it('is case-insensitive', () => {
    const state = createGame('parent');
    const next = guessLetter(state, 0, 'P');
    expect(next.flash[0]).toBe('correct');
  });
});

describe('toggleKeepCorrect', () => {
  it('toggles the flag', () => {
    const state = createGame('parent');
    expect(state.keepCorrect).toBe(true);
    const toggled = toggleKeepCorrect(state);
    expect(toggled.keepCorrect).toBe(false);
    expect(toggleKeepCorrect(toggled).keepCorrect).toBe(true);
  });
});

describe('blank navigation', () => {
  it('returns all blank indices', () => {
    let state = createGame('parent');
    expect(getBlankIndices(state)).toEqual([0, 1, 2, 3, 4, 5]);
    state = applyHint(state, 'first');
    expect(getBlankIndices(state)).toEqual([1, 2, 3, 4, 5]);
  });

  it('getNextBlankIndex wraps around', () => {
    let state = createGame('parent');
    state = applyHint(state, 'even'); // blanks: 1, 3, 5
    expect(getNextBlankIndex(state, 1)).toBe(3);
    expect(getNextBlankIndex(state, 5)).toBe(1); // wraps
    expect(getNextBlankIndex(state, 0)).toBe(1);
  });

  it('getPrevBlankIndex wraps around', () => {
    let state = createGame('parent');
    state = applyHint(state, 'even'); // blanks: 1, 3, 5
    expect(getPrevBlankIndex(state, 3)).toBe(1);
    expect(getPrevBlankIndex(state, 1)).toBe(5); // wraps
  });
});

describe('clearFlash', () => {
  it('removes flash for a specific index', () => {
    let state = createGame('parent');
    state = guessLetter(state, 0, 'x');
    expect(state.flash[0]).toBe('wrong');
    state = clearFlash(state, 0);
    expect(state.flash[0]).toBeUndefined();
  });
});
