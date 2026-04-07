import { describe, it, expect } from 'vitest';
import {
  createGame,
  slideRow,
  readCenterColumn,
  checkForNewWord,
  clearNewWord,
  getMinOffset,
  getMaxOffset,
  getCenterLetterIndex,
} from './engine';

describe('createGame', () => {
  it('initializes rows with offset 0 and no found words', () => {
    const state = createGame(['cargo', 'chain', 'print', 'sandy']);
    expect(state.rows).toHaveLength(4);
    expect(state.rows.every((r) => r.offset === 0)).toBe(true);
    expect(state.foundWords).toEqual([]);
    expect(state.newWord).toBeNull();
  });

  it('lowercases words', () => {
    const state = createGame(['CARGO', 'CHAIN']);
    expect(state.rows[0].word).toBe('cargo');
    expect(state.rows[1].word).toBe('chain');
  });
});

describe('getMinOffset / getMaxOffset', () => {
  it('allows all letters in center for 3-letter word', () => {
    expect(getMinOffset(3)).toBe(-1);
    expect(getMaxOffset(3)).toBe(1);
  });

  it('allows all letters in center for 5-letter word', () => {
    expect(getMinOffset(5)).toBe(-2);
    expect(getMaxOffset(5)).toBe(2);
  });

  it('allows all letters in center for 4-letter word', () => {
    expect(getMinOffset(4)).toBe(-1);
    expect(getMaxOffset(4)).toBe(2);
  });

  it('allows all letters in center for 6-letter word', () => {
    expect(getMinOffset(6)).toBe(-2);
    expect(getMaxOffset(6)).toBe(3);
  });
});

describe('getCenterLetterIndex', () => {
  it('returns middle index at offset 0 for 5-letter word', () => {
    expect(getCenterLetterIndex(5, 0)).toBe(2);
  });

  it('returns index 1 when offset=1 for 5-letter word', () => {
    expect(getCenterLetterIndex(5, 1)).toBe(1);
  });

  it('returns index 3 when offset=-1 for 5-letter word', () => {
    expect(getCenterLetterIndex(5, -1)).toBe(3);
  });
});

describe('readCenterColumn', () => {
  it('reads default center letters at offset 0', () => {
    // cargo[2]=r, chain[2]=a, print[2]=i, sandy[2]=n
    const state = createGame(['cargo', 'chain', 'print', 'sandy']);
    expect(readCenterColumn(state)).toBe('rain');
  });

  it('reads shifted center letters', () => {
    // cargo at offset 1 → cargo[1] = a
    let state = createGame(['cargo', 'chain', 'print', 'sandy']);
    state = slideRow(state, 0, 1); // offset becomes 1, center = cargo[1] = a
    expect(readCenterColumn(state)[0]).toBe('a');
  });
});

describe('slideRow', () => {
  it('slides right (direction=1) increases offset', () => {
    const state = createGame(['cargo', 'chain']);
    const next = slideRow(state, 0, 1);
    expect(next.rows[0].offset).toBe(1);
    expect(next.rows[1].offset).toBe(0); // unchanged
  });

  it('slides left (direction=-1) decreases offset', () => {
    const state = createGame(['cargo', 'chain']);
    const next = slideRow(state, 0, -1);
    expect(next.rows[0].offset).toBe(-1);
  });

  it('clamps at max offset', () => {
    let state = createGame(['cargo']); // 5-letter, max offset = 2
    state = slideRow(state, 0, 1);
    state = slideRow(state, 0, 1);
    state = slideRow(state, 0, 1); // should clamp at 2
    expect(state.rows[0].offset).toBe(2);
    // center = cargo[Math.floor(5/2) - 2] = cargo[0] = c
    expect(readCenterColumn(state)).toBe('c');
  });

  it('clamps at min offset', () => {
    let state = createGame(['cargo']); // 5-letter, min offset = -2
    state = slideRow(state, 0, -1);
    state = slideRow(state, 0, -1);
    state = slideRow(state, 0, -1); // should clamp at -2
    expect(state.rows[0].offset).toBe(-2);
    // center = cargo[4] = o
    expect(readCenterColumn(state)).toBe('o');
  });

  it('returns same reference if already at limit', () => {
    let state = createGame(['cargo']);
    state = slideRow(state, 0, 1);
    state = slideRow(state, 0, 1); // at max
    const atMax = state;
    const again = slideRow(state, 0, 1);
    expect(again).toBe(atMax);
  });

  it('does not mutate other rows', () => {
    const state = createGame(['cargo', 'chain', 'print']);
    const next = slideRow(state, 1, 1);
    expect(next.rows[0]).toBe(state.rows[0]);
    expect(next.rows[2]).toBe(state.rows[2]);
    expect(next.rows[1].offset).toBe(1);
  });
});

describe('checkForNewWord', () => {
  it('adds word to foundWords when center column matches word list', () => {
    const state = createGame(['cargo', 'chain', 'print', 'sandy']);
    // default center = 'rain'
    const wordList = new Set(['rain', 'gain']);
    const next = checkForNewWord(state, wordList);
    expect(next.foundWords).toEqual(['rain']);
    expect(next.newWord).toBe('rain');
  });

  it('does not re-add already found word', () => {
    const state = createGame(['cargo', 'chain', 'print', 'sandy']);
    const wordList = new Set(['rain']);
    const first = checkForNewWord(state, wordList);
    const second = checkForNewWord(first, wordList);
    expect(second.foundWords).toHaveLength(1);
    expect(second).toBe(first); // no change
  });

  it('returns same state when center is not a word', () => {
    const state = createGame(['cargo', 'chain', 'print', 'sandy']);
    const wordList = new Set(['ship', 'boat']);
    const next = checkForNewWord(state, wordList);
    expect(next).toBe(state);
  });

  it('accumulates multiple found words', () => {
    let state = createGame(['cargo', 'chain', 'print', 'sandy']);
    const wordList = new Set(['rain', 'gain']);
    state = checkForNewWord(state, wordList); // finds 'rain'
    state = slideRow(state, 0, -1); // cargo offset=-1, center = cargo[3] = g
    state = checkForNewWord(state, wordList); // center = g+a+i+n = 'gain'
    expect(state.foundWords).toEqual(['rain', 'gain']);
  });
});

describe('clearNewWord', () => {
  it('clears newWord', () => {
    const state = createGame(['cargo', 'chain', 'print', 'sandy']);
    const wordList = new Set(['rain']);
    const withWord = checkForNewWord(state, wordList);
    expect(withWord.newWord).toBe('rain');
    const cleared = clearNewWord(withWord);
    expect(cleared.newWord).toBeNull();
  });

  it('returns same reference when newWord is already null', () => {
    const state = createGame(['cargo', 'chain']);
    const result = clearNewWord(state);
    expect(result).toBe(state);
  });
});
