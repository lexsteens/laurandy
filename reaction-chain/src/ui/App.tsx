import { useRef, useState } from 'react';
import { createInitialState, applyChainSteps } from '../game/engine';
import type { Grid } from '../game/types';
import { Board } from './components/Board';
import type { Particle } from './components/Board';
import './App.css';

const MIN_DELAY = 60;
const MAX_DELAY = 500;
const DEFAULT_DELAY = 200;

export function App() {
  const [grid, setGrid] = useState<Grid>(() => createInitialState().grid);
  const [isWon, setIsWon] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [stepDelay, setStepDelay] = useState(DEFAULT_DELAY);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function handleTileClick(row: number, col: number) {
    if (isAnimating || isWon) return;

    const { steps, explosions } = applyChainSteps(grid, row, col);

    // Group explosions by step — multiple cells can explode in the same wave
    const explosionsByStep = new Map<number, typeof explosions>();
    for (const e of explosions) {
      const arr = explosionsByStep.get(e.stepIndex) ?? [];
      arr.push(e);
      explosionsByStep.set(e.stepIndex, arr);
    }

    setIsAnimating(true);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Particle travel time is slightly less than stepDelay so the ball arrives just
    // before React finishes rendering the next grid update (~1 frame early).
    const particleDuration = Math.max(stepDelay - 16, 30);

    steps.forEach((stepGrid, i) => {
      const t = setTimeout(() => {
        setGrid(stepGrid);

        const stepExplosions = explosionsByStep.get(i);
        if (stepExplosions) {
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
        }

        if (i === steps.length - 1) {
          setIsAnimating(false);
          if (stepGrid.every((r) => r.every((c) => c > 0))) setIsWon(true);
        }
      }, i * stepDelay);
      timersRef.current.push(t);
    });
  }

  function handleReset() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setGrid(createInitialState().grid);
    setIsWon(false);
    setIsAnimating(false);
    setParticles([]);
  }

  return (
    <div className="app">
      <h1 className="title">Reaction Chain</h1>
      <p className="subtitle">Fill every tile to win</p>

      {isWon && (
        <div className="win-banner">
          You win! <span className="win-emoji">🎉</span>
        </div>
      )}

      <Board grid={grid} onTileClick={handleTileClick} particles={particles} />

      <div className="controls">
        <button className="reset-btn" onClick={handleReset}>
          Reset
        </button>
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
    </div>
  );
}
