import { useReducer, useCallback } from 'react';
import {
  createGame,
  applyHint,
  guessLetter,
  toggleKeepCorrect,
  clearFlash,
  revealAll,
  getNextBlankIndex,
  getPrevBlankIndex,
  getBlankIndices,
  type GameState,
  type HintType,
} from '../../game/engine';
import { pickRandomWord } from '../../game/words';

type Action =
  | { type: 'hint'; hint: HintType }
  | { type: 'guess'; index: number; letter: string }
  | { type: 'clear-flash'; index: number }
  | { type: 'toggle-keep-correct' }
  | { type: 'new-game' }
  | { type: 'set-active'; index: number | null };

type FullState = GameState & { activeIndex: number | null };

function reducer(state: FullState, action: Action): FullState {
  switch (action.type) {
    case 'hint': {
      const next = applyHint(state, action.hint);
      if (next === state) return state;
      // if solved by hint, reveal all
      if (next.solved) return revealAll(next);
      // update active index if current one got revealed
      const blanks = getBlankIndices(next);
      const activeStillBlank = state.activeIndex !== null && blanks.includes(state.activeIndex);
      return {
        ...next,
        activeIndex: activeStillBlank ? state.activeIndex : (blanks[0] ?? null),
      };
    }
    case 'guess': {
      const next = guessLetter(state, action.index, action.letter);
      if (next === state) return state;
      if (next.solved) {
        return { ...revealAll(next), activeIndex: null };
      }
      // auto-jump to next blank
      const nextBlank = getNextBlankIndex(next, action.index);
      return { ...next, activeIndex: nextBlank };
    }
    case 'clear-flash':
      return clearFlash(state, action.index);
    case 'toggle-keep-correct':
      return toggleKeepCorrect(state);
    case 'new-game':
      return createGame(pickRandomWord());
    case 'set-active':
      return { ...state, activeIndex: action.index };
    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, null, () => createGame(pickRandomWord()));

  const hint = useCallback((h: HintType) => dispatch({ type: 'hint', hint: h }), []);
  const guess = useCallback(
    (index: number, letter: string) => dispatch({ type: 'guess', index, letter }),
    [],
  );
  const onClearFlash = useCallback((index: number) => dispatch({ type: 'clear-flash', index }), []);
  const onToggleKeep = useCallback(() => dispatch({ type: 'toggle-keep-correct' }), []);
  const newGame = useCallback(() => dispatch({ type: 'new-game' }), []);
  const setActive = useCallback(
    (index: number | null) => dispatch({ type: 'set-active', index }),
    [],
  );

  const blanks = getBlankIndices(state);
  const prevBlank = useCallback(
    (beforeIndex: number) => {
      const prev = getPrevBlankIndex(state, beforeIndex);
      if (prev !== null) dispatch({ type: 'set-active', index: prev });
    },
    [state],
  );

  return {
    state,
    blanks,
    hint,
    guess,
    onClearFlash,
    onToggleKeep,
    newGame,
    setActive,
    prevBlank,
  };
}
