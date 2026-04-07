import { useCallback, useEffect, useRef, useState } from 'react';
import { getCenterLetterIndex } from '../../game/engine';

const TILE_WIDTH = 44;
const TILE_GAP = 6;
const TILE_STEP = TILE_WIDTH + TILE_GAP;

type Props = {
  word: string;
  offset: number;
  flash: boolean;
  onSlide: (direction: -1 | 1) => void;
};

export function SlideRow({ word, offset, flash, onSlide }: Props) {
  const centerIndex = getCenterLetterIndex(word.length, offset);
  const tilesRef = useRef<HTMLDivElement>(null);
  const [dragStartX, setDragStartX] = useState<number | null>(null);

  // Position tiles so the center letter always aligns with 50% of the parent.
  // left: 50% puts the tile group's LEFT edge at parent center.
  // We then shift so tile[centerIndex] center lands at parent center:
  //   shift = -(centerIndex * TILE_STEP + TILE_WIDTH / 2)
  // As offset changes, the whole group shifts by offset * TILE_STEP relative to the
  // base where centerIndex=Math.floor(word.length/2).
  const baseCenterIndex = Math.floor(word.length / 2);
  const translateX = (offset - baseCenterIndex) * TILE_STEP - TILE_WIDTH / 2;
  const tileStyle = { transform: `translateX(${translateX}px)` };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragStartX(e.clientX);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onSlide(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onSlide(1);
      }
    },
    [onSlide],
  );

  useEffect(() => {
    if (dragStartX === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - dragStartX;
      if (delta > TILE_STEP / 2) {
        onSlide(1);
        setDragStartX(e.clientX);
      } else if (delta < -TILE_STEP / 2) {
        onSlide(-1);
        setDragStartX(e.clientX);
      }
    };

    const handleMouseUp = () => setDragStartX(null);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragStartX, onSlide]);

  return (
    <div className={`slide-row${flash ? ' slide-row--flash' : ''}`}>
      <button className="slide-row__btn" onClick={() => onSlide(-1)} aria-label="Slide left">
        ←
      </button>

      <div
        className="slide-row__tiles-area"
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label={`Row: ${word.toUpperCase()}`}
      >
        {/* center column stripe */}
        <div className="slide-row__stripe" />

        <div ref={tilesRef} className="slide-row__tiles" style={tileStyle}>
          {word.split('').map((letter, i) => (
            <div
              key={i}
              className={`slide-row__tile${i === centerIndex ? ' slide-row__tile--center' : ''}`}
            >
              {letter.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      <button className="slide-row__btn" onClick={() => onSlide(1)} aria-label="Slide right">
        →
      </button>
    </div>
  );
}
