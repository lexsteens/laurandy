import { useRef, useState } from 'react';
import {
  createInitialState,
  applyChainSteps,
  generateDropPositions,
  ballsPerRound,
} from '../game/engine';
import type { Grid } from '../game/types';
import { Board } from './components/Board';
import type { Particle } from './components/Board';
import './App.css';

const MAX_HEARTS = 5;
const WIN_STARS = 10;
const CLICKS_PER_ROUND = 3;
const INTER_DROP_PAUSE = 300;

type Phase = 'idle' | 'dropping' | 'gameover' | 'won';

export function SurvivalMode({ onBack }: { onBack: () => void }) {
  const [grid, setGrid] = useState<Grid>(() => createInitialState().grid);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [stars, setStars] = useState(0);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<Phase>('idle');
  const [clicksDone, setClicksDone] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [explodingCells, setExplodingCells] = useState<Set<string>>(new Set());

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const gridRef = useRef<Grid>(createInitialState().grid);
  const clicksDoneRef = useRef(0);

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function animateDrop(row: number, col: number, onComplete: (explosionCount: number) => void) {
    const { steps, explosions } = applyChainSteps(gridRef.current, row, col);

    if (steps.length === 0) {
      onComplete(0);
      return;
    }

    const explosionsByStep = new Map<number, typeof explosions>();
    for (const e of explosions) {
      const arr = explosionsByStep.get(e.stepIndex) ?? [];
      arr.push(e);
      explosionsByStep.set(e.stepIndex, arr);
    }

    const stepDelay = 350;
    const previewMs = Math.min(80, Math.floor(stepDelay * 0.4));
    const particleDuration = Math.max(stepDelay - previewMs - 16, 20);

    steps.forEach((stepGrid, i) => {
      const stepExplosions = explosionsByStep.get(i);
      const baseTime = i * stepDelay;
      const isLast = i === steps.length - 1;

      if (stepExplosions) {
        const t1 = setTimeout(() => {
          setExplodingCells(new Set(stepExplosions.map((e) => `${e.row},${e.col}`)));
        }, baseTime);
        timersRef.current.push(t1);

        const t2 = setTimeout(() => {
          setGrid(stepGrid);
          setExplodingCells(new Set());

          const newParticles: Particle[] = stepExplosions.flatMap((explosion) =>
            explosion.toNeighbors.map(([nr, nc]) => ({
              id: `${Date.now()}-${Math.random()}`,
              fromRow: explosion.row,
              fromCol: explosion.col,
              toRow: nr,
              toCol: nc,
              duration: particleDuration,
            })),
          );
          setParticles((prev) => [...prev, ...newParticles]);
          const ids = new Set(newParticles.map((p) => p.id));
          const cleanup = setTimeout(
            () => setParticles((prev) => prev.filter((p) => !ids.has(p.id))),
            particleDuration + 50,
          );
          timersRef.current.push(cleanup);

          if (isLast) {
            gridRef.current = stepGrid;
            onComplete(explosions.length);
          }
        }, baseTime + previewMs);
        timersRef.current.push(t2);
      } else {
        const t = setTimeout(() => {
          setGrid(stepGrid);
          if (isLast) {
            gridRef.current = stepGrid;
            onComplete(explosions.length);
          }
        }, baseTime);
        timersRef.current.push(t);
      }
    });
  }

  // currentHearts / currentStars are passed explicitly so callbacks never read stale state.
  // Per drop: chain of 3+ explosions → gain floor(n/3) stars; fewer → lose that many hearts.
  function processDrops(queue: [number, number][], currentHearts: number, currentStars: number) {
    if (queue.length === 0) {
      setRound((r) => r + 1);
      setPhase(currentStars >= WIN_STARS ? 'won' : 'idle');
      return;
    }

    const [row, col] = queue[0];
    const rest = queue.slice(1);

    animateDrop(row, col, (explosionCount) => {
      let newHearts = currentHearts;
      let newStars = currentStars;

      if (explosionCount >= 3) {
        newStars = Math.min(WIN_STARS, currentStars + Math.floor(explosionCount / 3));
        setStars(newStars);
      } else if (explosionCount > 0) {
        newHearts = Math.max(0, currentHearts - explosionCount);
        setHearts(newHearts);
      }

      if (newHearts <= 0) {
        setRound((r) => r + 1);
        setPhase('gameover');
        return;
      }
      if (newStars >= WIN_STARS) {
        setRound((r) => r + 1);
        setPhase('won');
        return;
      }

      const t = setTimeout(() => processDrops(rest, newHearts, newStars), INTER_DROP_PAUSE);
      timersRef.current.push(t);
    });
  }

  function handleTileClick(row: number, col: number) {
    if (phase !== 'idle') return;
    setPhase('dropping');
    gridRef.current = grid;
    animateDrop(row, col, () => {
      clicksDoneRef.current += 1;
      setClicksDone(clicksDoneRef.current);
      if (clicksDoneRef.current >= CLICKS_PER_ROUND) {
        clicksDoneRef.current = 0;
        setClicksDone(0);
        processDrops(generateDropPositions(round), hearts, stars);
      } else {
        setPhase('idle');
      }
    });
  }

  function handleReset() {
    clearTimers();
    const initial = createInitialState().grid;
    gridRef.current = initial;
    clicksDoneRef.current = 0;
    setGrid(initial);
    setHearts(MAX_HEARTS);
    setStars(0);
    setRound(1);
    setPhase('idle');
    setClicksDone(0);
    setParticles([]);
    setExplodingCells(new Set());
  }

  const isDropping = phase === 'dropping';
  const isGameOver = phase === 'gameover';
  const isWon = phase === 'won';
  const isOver = isGameOver || isWon;

  return (
    <div className="app">
      <h1 className="title">Survival</h1>
      <p className="subtitle">
        Place 3 balls, then drops fall. Small chains cost ♥, big chains (3+) earn ★. Reach 10 ★.
      </p>

      <div className="hud">
        <span className="hud-item hud-hearts">
          {Array.from({ length: MAX_HEARTS }, (_, i) => (
            <span key={i} className={i < hearts ? 'heart heart--full' : 'heart heart--empty'}>
              ♥
            </span>
          ))}
        </span>
        <span className="hud-item hud-stars">
          {Array.from({ length: WIN_STARS }, (_, i) => (
            <span key={i} className={i < stars ? 'star star--full' : 'star star--empty'}>
              ★
            </span>
          ))}
        </span>
      </div>

      <div className="hud hud-secondary">
        <span className="hud-item">Round {round}</span>
        {!isOver && !isDropping && (
          <span className="hud-item hud-clicks">
            {Array.from({ length: CLICKS_PER_ROUND }, (_, i) => (
              <span key={i} className={i < clicksDone ? 'click-dot click-dot--done' : 'click-dot'}>
                ●
              </span>
            ))}
          </span>
        )}
        {isDropping && <span className="hud-item hud-drops">+{ballsPerRound(round)} drops…</span>}
      </div>

      {isWon && (
        <div className="win-banner">
          You win! 10 stars in {round - 1} rounds <span className="win-emoji">🌟</span>
        </div>
      )}

      {isGameOver && (
        <div className="gameover-banner">
          Game Over — {stars} star{stars !== 1 ? 's' : ''} in {round - 1} round
          {round - 1 !== 1 ? 's' : ''}
        </div>
      )}

      <Board
        grid={grid}
        onTileClick={handleTileClick}
        particles={particles}
        explodingCells={explodingCells}
        rotationPeriod={12}
        showBalls={true}
      />

      <div className="controls">
        <div className="toggle-row">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
          <button className="reset-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
