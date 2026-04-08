import { useCallback, useEffect, useState } from 'react';
import { initialState, move } from '../game/engine';
import { getDailyPuzzle } from '../game/puzzles';
import type { Direction, GameState } from '../game/types';
import { Grid } from './components/Grid';

const STORAGE_KEY = 'sokoword-v1';
const MAX_HISTORY = 100;

interface SavedData {
  date: string;
  puzzleId: number;
  history: GameState[];
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadSaved(puzzleId: number): GameState[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedData;
    if (data.date !== todayStr() || data.puzzleId !== puzzleId) return null;
    return data.history;
  } catch {
    return null;
  }
}

function saveToDisk(puzzleId: number, history: GameState[]): void {
  try {
    const data: SavedData = { date: todayStr(), puzzleId, history };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function App() {
  const { puzzle, index: puzzleIndex } = getDailyPuzzle();

  const [history, setHistory] = useState<GameState[]>(() => {
    return loadSaved(puzzle.id) ?? [initialState(puzzle)];
  });

  const current = history[history.length - 1]!;

  useEffect(() => {
    saveToDisk(puzzle.id, history);
  }, [puzzle.id, history]);

  const applyMove = useCallback(
    (dir: Direction) => {
      const next = move(current, dir);
      if (!next) return;
      setHistory((h) => [...h.slice(-(MAX_HISTORY - 1)), next]);
    },
    [current],
  );

  const undo = useCallback(() => {
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  }, []);

  const restart = useCallback(() => {
    setHistory([initialState(puzzle)]);
  }, [puzzle]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowUp':
          applyMove('up');
          break;
        case 'ArrowDown':
          applyMove('down');
          break;
        case 'ArrowLeft':
          applyMove('left');
          break;
        case 'ArrowRight':
          applyMove('right');
          break;
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) undo();
          break;
        case 'u':
        case 'U':
          undo();
          break;
        case 'r':
        case 'R':
          restart();
          break;
        default:
          return;
      }
      e.preventDefault();
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [applyMove, undo, restart]);

  // Build word progress: show locked letters, blank for the rest
  const wordProgress = Array.from({ length: current.totalTargets }, (_, i) => {
    for (let y = 0; y < current.grid.length; y++) {
      for (let x = 0; x < (current.grid[y]?.length ?? 0); x++) {
        const cell = current.grid[y]?.[x];
        if (cell?.locked && cell.target?.index === i) return cell.letter!;
      }
    }
    return null;
  });

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Sokoword #{puzzleIndex + 1}</h1>
        <div className="word-progress">
          {wordProgress.map((letter, i) => (
            <span key={i} className={`word-slot ${letter ? 'word-slot--locked' : ''}`}>
              {letter ?? '_'}
            </span>
          ))}
        </div>
      </header>

      <main className="app-main">
        <Grid state={current} />
      </main>

      <footer className="app-footer">
        <span className="moves">Moves: {current.moves}</span>
        <span className="controls">↑↓←→ move · U undo · R restart</span>
      </footer>

      {current.status === 'won' && (
        <div className="win-overlay">
          <div className="win-card">
            <div className="win-emoji">🎉</div>
            <h2 className="win-title">You found it!</h2>
            <p className="win-word">{puzzle.answer}</p>
            <p className="win-moves">Solved in {current.moves} moves</p>
            <p className="win-share">
              🔠 Sokoword #{puzzleIndex + 1}
              <br />
              {puzzle.answer} in {current.moves} moves
            </p>
            <button className="win-restart" onClick={restart}>
              Play again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
