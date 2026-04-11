import { useRef, useState } from 'react';
import { createInitialState, applyChainSteps } from '../game/engine';
import type { Grid } from '../game/types';
import { Board } from './components/Board';
import './App.css';

const STEP_DELAY_MS = 80;

export function App() {
  const [grid, setGrid] = useState<Grid>(() => createInitialState().grid);
  const [isWon, setIsWon] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function handleTileClick(row: number, col: number) {
    if (isAnimating || isWon) return;

    const steps = applyChainSteps(grid, row, col);

    setIsAnimating(true);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    steps.forEach((stepGrid, i) => {
      const t = setTimeout(
        () => {
          setGrid(stepGrid);
          if (i === steps.length - 1) {
            setIsAnimating(false);
            if (stepGrid.every((r) => r.every((c) => c > 0))) setIsWon(true);
          }
        },
        (i + 1) * STEP_DELAY_MS,
      );
      timersRef.current.push(t);
    });
  }

  function handleReset() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setGrid(createInitialState().grid);
    setIsWon(false);
    setIsAnimating(false);
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

      <Board grid={grid} onTileClick={handleTileClick} />

      <button className="reset-btn" onClick={handleReset}>
        Reset
      </button>
    </div>
  );
}
