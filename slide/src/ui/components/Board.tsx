import { useCallback } from 'react';
import type { GameState } from '../../game/engine';
import { SlideRow } from './SlideRow';

type Props = {
  state: GameState;
  onSlide: (rowIndex: number, direction: -1 | 1) => void;
};

export function Board({ state, onSlide }: Props) {
  const handleSlide = useCallback(
    (rowIndex: number) => (direction: -1 | 1) => {
      onSlide(rowIndex, direction);
    },
    [onSlide],
  );

  return (
    <div className="board">
      {state.rows.map((row, i) => (
        <SlideRow
          key={i}
          word={row.word}
          offset={row.offset}
          flash={state.newWord !== null}
          onSlide={handleSlide(i)}
        />
      ))}
    </div>
  );
}
