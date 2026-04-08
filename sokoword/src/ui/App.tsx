import { useCallback, useEffect, useMemo, useState } from 'react';
import { initialState, move } from '../game/engine';
import { getDailyPuzzle } from '../game/puzzles';
import type { Direction, GameState } from '../game/types';
import { wordList } from '../game/word-list';
import { Grid } from './components/Grid';

const STORAGE_KEY = 'sokoword-v2';
const MAX_HISTORY = 100;

interface SavedData {
  date: string;
  puzzleId: number;
  history: GameState[];
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadSaved(puzzleId: number, wordSet: Set<string>): GameState[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedData;
    if (data.date !== todayStr() || data.puzzleId !== puzzleId) return null;
    // Re-validate the saved history is non-empty and has correct shape
    if (!Array.isArray(data.history) || data.history.length === 0) return null;
    // The stored states already have currentWords computed; trust them.
    void wordSet;
    return data.history;
  } catch {
    return null;
  }
}

function saveToDisk(puzzleId: number, history: GameState[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayStr(), puzzleId, history }));
  } catch {
    // ignore
  }
}

export function App() {
  const { puzzle, index: puzzleIndex } = getDailyPuzzle();
  const wordSet = useMemo(() => new Set(wordList), []);

  const [history, setHistory] = useState<GameState[]>(() => {
    return loadSaved(puzzle.id, wordSet) ?? [initialState(puzzle, wordSet)];
  });

  const current = history[history.length - 1]!;

  useEffect(() => {
    saveToDisk(puzzle.id, history);
  }, [puzzle.id, history]);

  const applyMove = useCallback(
    (dir: Direction) => {
      const next = move(current, dir, wordSet, puzzle.answer);
      if (!next) return;
      setHistory((h) => [...h.slice(-(MAX_HISTORY - 1)), next]);
    },
    [current, wordSet, puzzle.answer],
  );

  const undo = useCallback(() => {
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  }, []);

  const restart = useCallback(() => {
    setHistory([initialState(puzzle, wordSet)]);
  }, [puzzle, wordSet]);

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

  // Words found on the grid right now, excluding the answer (don't spoil it)
  const visibleFoundWords = current.allFoundWords
    .filter((w) => w !== puzzle.answer)
    .sort((a, b) => b.length - a.length || a.localeCompare(b));

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Sokoword #{puzzleIndex + 1}</h1>
        <div className="app-meta">
          <span className="moves">Moves: {current.moves}</span>
          {current.allFoundWords.length > 0 && (
            <span className="found-count">
              {current.allFoundWords.length} word{current.allFoundWords.length !== 1 ? 's' : ''}{' '}
              found
            </span>
          )}
        </div>
      </header>

      <main className="app-main">
        <Grid state={current} targetWord={puzzle.answer} />
      </main>

      {visibleFoundWords.length > 0 && (
        <section className="found-words">
          {visibleFoundWords.map((w) => (
            <span key={w} className="found-word">
              {w.toLowerCase()}
            </span>
          ))}
        </section>
      )}

      <footer className="app-footer">
        <span className="controls">↑↓←→ move · U undo · R restart</span>
      </footer>

      {current.status === 'won' && (
        <div className="win-overlay">
          <div className="win-card">
            <div className="win-emoji">🎉</div>
            <h2 className="win-title">You found it!</h2>
            <p className="win-word">{puzzle.answer.toLowerCase()}</p>
            <p className="win-moves">Solved in {current.moves} moves</p>
            {visibleFoundWords.length > 0 && (
              <p className="win-bonus">
                +{visibleFoundWords.length} bonus word{visibleFoundWords.length !== 1 ? 's' : ''}
              </p>
            )}
            <button className="win-restart" onClick={restart}>
              Play again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
