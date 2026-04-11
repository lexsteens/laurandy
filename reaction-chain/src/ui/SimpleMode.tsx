import { useRef, useState } from 'react';
import { createInitialState, applyChainSteps } from '../game/engine';
import type { Grid } from '../game/types';
import { Board } from './components/Board';
import type { Particle } from './components/Board';
import { ThemeToggle } from './theme';
import './App.css';

const MIN_DELAY = 60;
const MAX_DELAY = 500;
const DEFAULT_DELAY = 350;
const DEFAULT_ROTATION_SPEED = 1;

export function SimpleMode({ onBack }: { onBack: () => void }) {
  const [grid, setGrid] = useState<Grid>(() => createInitialState().grid);
  const [isWon, setIsWon] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [explodingCells, setExplodingCells] = useState<Set<string>>(new Set());
  const [stepDelay, setStepDelay] = useState(DEFAULT_DELAY);
  const [rotationSpeed, setRotationSpeed] = useState(DEFAULT_ROTATION_SPEED);
  const [showBalls, setShowBalls] = useState(true);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const gridRef = useRef<Grid>(createInitialState().grid);

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function animateDrop(row: number, col: number, onComplete: () => void) {
    const { steps, explosions } = applyChainSteps(gridRef.current, row, col);

    if (steps.length === 0) {
      onComplete();
      return;
    }

    const explosionsByStep = new Map<number, typeof explosions>();
    for (const e of explosions) {
      const arr = explosionsByStep.get(e.stepIndex) ?? [];
      arr.push(e);
      explosionsByStep.set(e.stepIndex, arr);
    }

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
            onComplete();
          }
        }, baseTime + previewMs);
        timersRef.current.push(t2);
      } else {
        const t = setTimeout(() => {
          setGrid(stepGrid);
          if (isLast) {
            gridRef.current = stepGrid;
            onComplete();
          }
        }, baseTime);
        timersRef.current.push(t);
      }
    });
  }

  function handleTileClick(row: number, col: number) {
    if (isAnimating || isWon) return;
    setIsAnimating(true);
    gridRef.current = grid;
    animateDrop(row, col, () => {
      setIsAnimating(false);
      if (gridRef.current.every((r) => r.every((c) => c > 0))) setIsWon(true);
    });
  }

  function handleReset() {
    clearTimers();
    const initial = createInitialState().grid;
    gridRef.current = initial;
    setGrid(initial);
    setIsWon(false);
    setIsAnimating(false);
    setParticles([]);
    setExplodingCells(new Set());
  }

  return (
    <div className="app">
      <h1 className="title">Classic</h1>
      <p className="subtitle">Click tiles to trigger chain reactions. Fill every tile to win.</p>

      {isWon && (
        <div className="win-banner">
          You win! <span className="win-emoji">🎉</span>
        </div>
      )}

      <Board
        grid={grid}
        onTileClick={handleTileClick}
        particles={particles}
        explodingCells={explodingCells}
        rotationPeriod={13 - rotationSpeed}
        showBalls={showBalls}
      />

      <div className="controls">
        <div className="toggle-row">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
          <button className="reset-btn" onClick={handleReset}>
            Reset
          </button>
          <button
            className={`toggle-btn${showBalls ? ' toggle-btn--active' : ''}`}
            onClick={() => setShowBalls((v) => !v)}
          >
            {showBalls ? 'Balls' : 'Numbers'}
          </button>
          <ThemeToggle />
        </div>
        <div className="sliders-row">
          <div className="slider-group">
            <label className="speed-label">
              <span>Slow</span>
              <input
                type="range"
                min={MIN_DELAY}
                max={MAX_DELAY}
                value={stepDelay}
                onChange={(e) => setStepDelay(Number(e.target.value))}
                className="speed-slider"
              />
              <span>Fast</span>
            </label>
            <span className="speed-value">{stepDelay}ms</span>
          </div>
          <div className="slider-group">
            <label className="speed-label">
              <span>Slow</span>
              <input
                type="range"
                min={1}
                max={12}
                value={rotationSpeed}
                onChange={(e) => setRotationSpeed(Number(e.target.value))}
                className="speed-slider"
              />
              <span>Fast</span>
            </label>
            <span className="speed-value">{13 - rotationSpeed}s/turn</span>
          </div>
        </div>
      </div>
    </div>
  );
}
