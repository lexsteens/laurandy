import { useRef, useLayoutEffect } from 'react';
import type { Grid } from '../../game/types';
import './Board.css';

export type Particle = {
  id: string;
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  duration: number;
};

type Props = {
  grid: Grid;
  onTileClick: (row: number, col: number) => void;
  particles: Particle[];
};

const FONT_SIZES = ['0px', '14px', '22px', '34px'];
const BG_COLORS = ['#111827', '#1e3a5f', '#7c3aed', '#dc2626'];
const GAP = 4;

type ParticleElProps = { fromX: number; fromY: number; dx: number; dy: number; duration: number };

function ParticleEl({ fromX, fromY, dx, dy, duration }: ParticleElProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    ref.current?.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1.2)', opacity: '1' },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`,
          opacity: '0',
        },
      ],
      { duration, easing: 'ease-in', fill: 'both' },
    );
  }, [dx, dy, duration]);

  return <div ref={ref} className="particle" style={{ left: `${fromX}px`, top: `${fromY}px` }} />;
}

export function Board({ grid, onTileClick, particles }: Props) {
  const boardRef = useRef<HTMLDivElement>(null);

  function cellCenter(row: number, col: number) {
    const board = boardRef.current;
    if (!board) return { x: 0, y: 0 };
    const { width, height } = board.getBoundingClientRect();
    const cellW = (width - 7 * GAP) / 8;
    const cellH = (height - 7 * GAP) / 8;
    return {
      x: col * (cellW + GAP) + cellW / 2,
      y: row * (cellH + GAP) + cellH / 2,
    };
  }

  return (
    <div className="board" ref={boardRef}>
      {grid.map((row, r) =>
        row.map((value, c) => (
          <button
            key={`${r}-${c}`}
            className="tile"
            style={{ backgroundColor: BG_COLORS[value], fontSize: FONT_SIZES[value] }}
            onClick={() => onTileClick(r, c)}
            aria-label={`tile ${r},${c} value ${value}`}
          >
            {value > 0 ? value : ''}
          </button>
        )),
      )}
      {particles.map((p) => {
        const from = cellCenter(p.fromRow, p.fromCol);
        const to = cellCenter(p.toRow, p.toCol);
        return (
          <ParticleEl
            key={p.id}
            fromX={from.x}
            fromY={from.y}
            dx={to.x - from.x}
            dy={to.y - from.y}
            duration={p.duration}
          />
        );
      })}
    </div>
  );
}
