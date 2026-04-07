export type LetterState = 'blank' | 'hinted' | 'correct' | 'wrong';

export type TileState = {
  letter: string; // the actual letter (from target)
  visible: boolean; // whether the player can currently see it
  source: 'hint' | 'guess' | 'none'; // how it became visible
};

export type HintType = 'odd' | 'even' | 'vowels' | 'first' | 'last';

export type HistoryEntry = {
  word: string;
  tiles: TileState[];
  score: number;
  maxScore: number;
  wrongAttempts: number;
};

export type GameState = {
  target: string;
  tiles: TileState[];
  score: number;
  maxScore: number;
  keepCorrect: boolean;
  penalizeWrong: boolean;
  solved: boolean;
  wrongAttempts: number;
  history: HistoryEntry[];
  // tracks which position the player is currently typing into
  activeIndex: number | null;
  // flash feedback: index → 'correct' | 'wrong', cleared after animation
  flash: Record<number, 'correct' | 'wrong'>;
};

export function createGame(word: string): GameState {
  const target = word.toLowerCase();
  return {
    target,
    tiles: target.split('').map((letter) => ({
      letter,
      visible: false,
      source: 'none' as const,
    })),
    score: target.length * 10,
    maxScore: target.length * 10,
    keepCorrect: true,
    penalizeWrong: true,
    solved: false,
    wrongAttempts: 0,
    history: [],
    activeIndex: null,
    flash: {},
  };
}

export function getHintIndices(state: GameState, hint: HintType): number[] {
  const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
  const len = state.target.length;

  switch (hint) {
    case 'odd':
      return Array.from({ length: len }, (_, i) => i).filter((i) => i % 2 === 1);
    case 'even':
      return Array.from({ length: len }, (_, i) => i).filter((i) => i % 2 === 0);
    case 'vowels':
      return Array.from({ length: len }, (_, i) => i).filter((i) => vowels.has(state.target[i]));
    case 'first':
      return [0];
    case 'last':
      return [len - 1];
  }
}

export function applyHint(state: GameState, hint: HintType): GameState {
  if (state.solved) return state;

  const indices = getHintIndices(state, hint);
  // only count newly revealed letters
  const newlyRevealed = indices.filter((i) => !state.tiles[i].visible);
  const cost = newlyRevealed.length;

  if (cost === 0) return state; // hint reveals nothing new

  const tiles = state.tiles.map((tile, i) => {
    if (newlyRevealed.includes(i)) {
      return { ...tile, visible: true, source: 'hint' as const };
    }
    return tile;
  });

  return {
    ...state,
    tiles,
    score: Math.max(0, state.score - cost),
    solved: tiles.every((t) => t.visible),
  };
}

export function guessLetter(state: GameState, index: number, letter: string): GameState {
  if (state.solved) return state;
  if (state.tiles[index].visible && state.tiles[index].source === 'hint') return state;

  const normalizedLetter = letter.toLowerCase();
  const isCorrect = state.target[index] === normalizedLetter;

  if (isCorrect) {
    const keepCost = state.keepCorrect ? 1 : 0;
    const tiles = state.tiles.map((tile, i) => {
      if (i === index) {
        return {
          ...tile,
          visible: state.keepCorrect,
          source: 'guess' as const,
        };
      }
      return tile;
    });

    const solved = isSolved(state.target, tiles);

    return {
      ...state,
      tiles,
      score: Math.max(0, state.score - keepCost),
      solved,
      flash: { ...state.flash, [index]: 'correct' },
    };
  }

  // wrong guess — flash, optional penalty
  const wrongPenalty = state.penalizeWrong ? 1 : 0;
  return {
    ...state,
    score: Math.max(0, state.score - wrongPenalty),
    wrongAttempts: state.wrongAttempts + 1,
    flash: { ...state.flash, [index]: 'wrong' },
  };
}

export function clearFlash(state: GameState, index: number): GameState {
  const flash = { ...state.flash };
  delete flash[index];
  return { ...state, flash };
}

export function toggleKeepCorrect(state: GameState): GameState {
  if (state.solved) return state;
  return { ...state, keepCorrect: !state.keepCorrect };
}

export function togglePenalizeWrong(state: GameState): GameState {
  if (state.solved) return state;
  return { ...state, penalizeWrong: !state.penalizeWrong };
}

export function getBlankIndices(state: GameState): number[] {
  return state.tiles.map((tile, i) => (!tile.visible ? i : -1)).filter((i) => i !== -1);
}

export function getNextBlankIndex(state: GameState, afterIndex: number): number | null {
  const blanks = getBlankIndices(state);
  const next = blanks.find((i) => i > afterIndex);
  return next ?? blanks[0] ?? null;
}

export function getPrevBlankIndex(state: GameState, beforeIndex: number): number | null {
  const blanks = getBlankIndices(state);
  const prev = [...blanks].reverse().find((i) => i < beforeIndex);
  return prev ?? blanks[blanks.length - 1] ?? null;
}

function isSolved(target: string, tiles: TileState[]): boolean {
  // solved when every position has been correctly identified
  // (visible via hint, or correctly guessed — even if not kept visible)
  return tiles.every((tile) => tile.visible || tile.source === 'guess');
}

// For revealing all letters when player solves
export function revealAll(state: GameState): GameState {
  const finalTiles = state.tiles.map((tile) => ({ ...tile, visible: true }));
  const entry: HistoryEntry = {
    word: state.target,
    tiles: finalTiles,
    score: state.score,
    maxScore: state.maxScore,
    wrongAttempts: state.wrongAttempts,
  };
  return {
    ...state,
    tiles: finalTiles,
    solved: true,
    history: [...state.history, entry],
  };
}
