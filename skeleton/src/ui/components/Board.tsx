import { useEffect, useRef } from 'react';
import type { GameState } from '../../game/engine';
import './Board.css';

type BoardProps = {
  state: GameState;
  blanks: number[];
  onGuess: (index: number, letter: string) => void;
  onClearFlash: (index: number) => void;
  onSetActive: (index: number | null) => void;
  onPrevBlank: (beforeIndex: number) => void;
};

function BlankTile({
  index,
  flash,
  isActive,
  inputRef,
  onFocus,
  onGuess,
  onBackspace,
  onClearFlash,
}: {
  index: number;
  flash: 'correct' | 'wrong' | undefined;
  isActive: boolean;
  inputRef: (el: HTMLInputElement | null) => void;
  onFocus: () => void;
  onGuess: (letter: string) => void;
  onBackspace: () => void;
  onClearFlash: () => void;
}) {
  useEffect(() => {
    if (flash) {
      const timer = setTimeout(onClearFlash, 400);
      return () => clearTimeout(timer);
    }
  }, [flash, onClearFlash]);

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
  blanks,
  onGuess,
  onClearFlash,
  onSetActive,
  onPrevBlank,
}: BoardProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (state.activeIndex !== null && inputRefs.current[state.activeIndex]) {
      inputRefs.current[state.activeIndex]?.focus();
    }
  }, [state.activeIndex]);

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
            index={i}
            flash={state.flash[i]}
            isActive={state.activeIndex === i}
            inputRef={(el) => {
              inputRefs.current[i] = el;
            }}
            onFocus={() => onSetActive(i)}
            onGuess={(letter) => onGuess(i, letter)}
            onBackspace={() => onPrevBlank(i)}
            onClearFlash={() => onClearFlash(i)}
          />
        );
      })}
    </div>
  );
}
