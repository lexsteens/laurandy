export type Row = {
  word: string;
  offset: number;
};

export type GameState = {
  rows: Row[];
  foundWords: string[];
  newWord: string | null; // just-found word, for flash animation
};

export function createGame(words: string[]): GameState {
  return {
    rows: words.map((word) => ({ word: word.toLowerCase(), offset: 0 })),
    foundWords: [],
    newWord: null,
  };
}

export function getMinOffset(wordLength: number): number {
  // clamp so center index stays within [0, wordLength-1]
  // center index = Math.floor(wordLength/2) - offset >= 0
  // offset <= Math.floor(wordLength/2)
  // center index = Math.floor(wordLength/2) - offset <= wordLength - 1
  // offset >= Math.floor(wordLength/2) - (wordLength - 1)
  return Math.floor(wordLength / 2) - (wordLength - 1);
}

export function getMaxOffset(wordLength: number): number {
  return Math.floor(wordLength / 2);
}

export function getCenterLetterIndex(wordLength: number, offset: number): number {
  return Math.floor(wordLength / 2) - offset;
}

export function slideRow(state: GameState, rowIndex: number, direction: -1 | 1): GameState {
  const row = state.rows[rowIndex];
  const min = getMinOffset(row.word.length);
  const max = getMaxOffset(row.word.length);
  const newOffset = Math.max(min, Math.min(max, row.offset + direction));

  if (newOffset === row.offset) return state;

  const rows = state.rows.map((r, i) => (i === rowIndex ? { ...r, offset: newOffset } : r));
  return { ...state, rows };
}

export function readCenterColumn(state: GameState): string {
  return state.rows
    .map(({ word, offset }) => {
      const idx = getCenterLetterIndex(word.length, offset);
      return word[idx] ?? '';
    })
    .join('');
}

export function checkForNewWord(state: GameState, wordList: Set<string>): GameState {
  const center = readCenterColumn(state);
  if (center.length >= 3 && wordList.has(center) && !state.foundWords.includes(center)) {
    return {
      ...state,
      foundWords: [...state.foundWords, center],
      newWord: center,
    };
  }
  return state;
}

export function clearNewWord(state: GameState): GameState {
  if (state.newWord === null) return state;
  return { ...state, newWord: null };
}
