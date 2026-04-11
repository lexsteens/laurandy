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
  explodingCells: Set<string>;
  rotationPeriod: number; // seconds per full orbit
  showBalls: boolean;
};

const TILE_BG = ['#111827', '#1e3a5f', '#7c3aed', '#b91c1c'];
const EXPLODING_BG = '#dc2626';
const GAP = 4;

// Ball anchor positions [left%, top%] within the tile. Balls are centered on
// these points via translate(-50%,-50%). For n=2,3 the container spins so
// positions only define the initial arrangement.
const BALL_POSITIONS: Record<number, Array<[number, number]>> = {
  1: [[50, 50]],
  2: [
    [50, 26],
    [50, 74],
  ],
  3: [
    [50, 26],
    [71, 62],
    [29, 62],
  ],
  // Cardinal N/E/S/W — match particle flight directions
  4: [
    [50, 26],
    [74, 50],
    [50, 74],
    [26, 50],
  ],
};

function TileBalls({
  value,
  exploding,
  rotationPeriod,
  rotationOffset,
}: {
  value: number;
  exploding: boolean;
  rotationPeriod: number;
  rotationOffset: number;
}) {
  if (value === 0 && !exploding) return null;
  const count = exploding ? 4 : value;
  const positions = BALL_POSITIONS[count];
  const spinning = !exploding && count > 1;

  const spinStyle = spinning
    ? {
        animationDuration: `${rotationPeriod}s`,
        animationDelay: `-${rotationOffset * rotationPeriod}s`,
      }
    : undefined;

  return (
    <div className={`tile-balls${spinning ? ' tile-balls-spinning' : ''}`} style={spinStyle}>
      {positions.map(([x, y], i) => (
        <div
          key={i}
          className={`tile-ball${exploding ? ' tile-ball-exploding' : ''}`}
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      ))}
    </div>
  );
}

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

export function Board({
  grid,
  onTileClick,
  particles,
  explodingCells,
  rotationPeriod,
  showBalls,
}: Props) {
  const boardRef = useRef<HTMLDivElement>(null);

  // Stable random offsets (0–1) per cell, set once on mount
  const offsetsRef = useRef<number[][] | null>(null);
  if (!offsetsRef.current) {
    offsetsRef.current = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => Math.random()),
    );
  }

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
        row.map((value, c) => {
          const isExploding = explodingCells.has(`${r},${c}`);
          return (
            <button
              key={`${r}-${c}`}
              className={`tile${isExploding ? ' tile--exploding' : ''}`}
              style={{
                backgroundColor: isExploding ? EXPLODING_BG : TILE_BG[value],
                fontSize: showBalls ? '0px' : ['0px', '14px', '22px', '34px'][value],
                color: '#fff',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => onTileClick(r, c)}
              aria-label={`tile ${r},${c} value ${value}`}
            >
              {showBalls ? (
                <TileBalls
                  value={value}
                  exploding={isExploding}
                  rotationPeriod={rotationPeriod}
                  rotationOffset={offsetsRef.current![r][c]}
                />
              ) : value > 0 ? (
                value
              ) : (
                ''
              )}
            </button>
          );
        }),
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
