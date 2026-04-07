import { useEffect, useRef } from 'react';
import type { GameState } from '../../game/engine';
import './Board.css';

type BoardProps = {
  state: GameState;
  onGuess: (index: number, letter: string) => void;
  onClearFlash: (index: number) => void;
  onSetActive: (index: number | null) => void;
  onPrevBlank: (beforeIndex: number) => void;
  onUseFreeLetter: (index: number) => void;
};

function BlankTile({
  flash,
  isActive,
  freeLetterMode,
  inputRef,
  onFocus,
  onGuess,
  onBackspace,
  onClearFlash,
  onUseFreeLetter,
}: {
  flash: 'correct' | 'wrong' | undefined;
  isActive: boolean;
  freeLetterMode: boolean;
  inputRef: (el: HTMLInputElement | null) => void;
  onFocus: () => void;
  onGuess: (letter: string) => void;
  onBackspace: () => void;
  onClearFlash: () => void;
  onUseFreeLetter: () => void;
}) {
  useEffect(() => {
    if (flash) {
      const timer = setTimeout(onClearFlash, 400);
      return () => clearTimeout(timer);
    }
  }, [flash, onClearFlash]);

  if (freeLetterMode) {
    return (
      <button className="tile tile--free-pick" onClick={onUseFreeLetter}>
        ?
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      className={`tile tile--blank ${isActive ? 'tile--active' : ''} ${flash ? `tile--${flash}` : ''}`}
      type="text"
      maxLength={1}
      value=""
      onFocus={onFocus}
      onChange={(e) => {
        const val = e.target.value;
        if (val && /^[a-zA-Z]$/.test(val)) {
          onGuess(val);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Backspace') {
          e.preventDefault();
          onBackspace();
        }
      }}
      autoComplete="off"
    />
  );
}

export function Board({
  state,
  onGuess,
  onClearFlash,
  onSetActive,
  onPrevBlank,
  onUseFreeLetter,
}: BoardProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (
      !state.freeLetterMode &&
      state.activeIndex !== null &&
      inputRefs.current[state.activeIndex]
    ) {
      inputRefs.current[state.activeIndex]?.focus();
    }
  }, [state.activeIndex, state.freeLetterMode]);

  return (
    <div className="board">
      {state.tiles.map((tile, i) => {
        if (tile.visible) {
          return (
            <div key={i} className={`tile tile--revealed tile--${tile.source}`}>
              {tile.letter.toUpperCase()}
            </div>
          );
        }

        return (
          <BlankTile
            key={i}
            flash={state.flash[i]}
            isActive={state.activeIndex === i}
            freeLetterMode={state.freeLetterMode}
            inputRef={(el) => {
              inputRefs.current[i] = el;
            }}
            onFocus={() => onSetActive(i)}
            onGuess={(letter) => onGuess(i, letter)}
            onBackspace={() => onPrevBlank(i)}
            onClearFlash={() => onClearFlash(i)}
            onUseFreeLetter={() => onUseFreeLetter(i)}
          />
        );
      })}
    </div>
  );
}
