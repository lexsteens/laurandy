import { useRef, useState } from 'react';
import { createInitialState, applyChainSteps } from '../game/engine';
import type { Grid } from '../game/types';
import { Board } from './components/Board';
import type { Particle } from './components/Board';
import './App.css';

const MIN_DELAY = 60;
const MAX_DELAY = 500;
const DEFAULT_DELAY = 350;

// Rotation speed: 1 = slowest (12 s/turn), 12 = fastest (1 s/turn)
// Period (seconds) = 13 - rotationSpeed
const DEFAULT_ROTATION_SPEED = 1; // 12 s/turn

export function App() {
  const [grid, setGrid] = useState<Grid>(() => createInitialState().grid);
  const [isWon, setIsWon] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [stepDelay, setStepDelay] = useState(DEFAULT_DELAY);
  const [rotationSpeed, setRotationSpeed] = useState(DEFAULT_ROTATION_SPEED);
  const [showBalls, setShowBalls] = useState(true);
  const [explodingCells, setExplodingCells] = useState<Set<string>>(new Set());
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

    // How long to briefly show 4 balls on the exploding tile before launching particles.
    // Capped so it's always shorter than stepDelay.
    const previewMs = Math.min(80, Math.floor(stepDelay * 0.4));

    // Particles fly for the remaining window so they arrive at the next grid update.
    const particleDuration = Math.max(stepDelay - previewMs - 16, 20);

    steps.forEach((stepGrid, i) => {
      const stepExplosions = explosionsByStep.get(i);
      const baseTime = i * stepDelay;

      if (stepExplosions) {
        // Phase 1 — briefly show 4 balls on about-to-explode tiles
        const t1 = setTimeout(() => {
          setExplodingCells(new Set(stepExplosions.map((e) => `${e.row},${e.col}`)));
        }, baseTime);
        timersRef.current.push(t1);

        // Phase 2 — update grid, clear exploding state, launch particles
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

          if (i === steps.length - 1) {
            setIsAnimating(false);
            if (stepGrid.every((r) => r.every((c) => c > 0))) setIsWon(true);
          }
        }, baseTime + previewMs);
        timersRef.current.push(t2);
      } else {
        // No explosion this wave — just update the grid
        const t = setTimeout(() => {
          setGrid(stepGrid);
          if (i === steps.length - 1) {
            setIsAnimating(false);
            if (stepGrid.every((r) => r.every((c) => c > 0))) setIsWon(true);
          }
        }, baseTime);
        timersRef.current.push(t);
      }
    });
  }

  function handleReset() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setGrid(createInitialState().grid);
    setIsWon(false);
    setIsAnimating(false);
    setParticles([]);
    setExplodingCells(new Set());
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
          <button className="reset-btn" onClick={handleReset}>
            Reset
          </button>
          <button
            className={`toggle-btn${showBalls ? ' toggle-btn--active' : ''}`}
            onClick={() => setShowBalls((v) => !v)}
          >
            {showBalls ? 'Balls' : 'Numbers'}
          </button>
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
