import { useCallback, useEffect, useMemo, useState } from 'react';
import { initialState, move } from '../game/engine';
import { generatePuzzle, getDayIndex, randomSeed } from '../game/level-generator';
import { levels } from '../game/levels/index';
import { scoreWord } from '../game/scoring';
import type { Direction, GameState, Puzzle } from '../game/types';
import { wordList } from '../game/word-list';
import { Grid } from './components/Grid';

const STORAGE_KEY = 'sokoword-v4';
const MAX_HISTORY = 100;

interface SavedData {
  seed: number;
  levelId: number;
  history: GameState[];
}

function loadSaved(): SavedData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedData;
    if (
      typeof data.seed !== 'number' ||
      typeof data.levelId !== 'number' ||
      !Array.isArray(data.history) ||
      data.history.length === 0
    )
      return null;
    return data;
  } catch {
    return null;
  }
}

function saveToDisk(seed: number, levelId: number, history: GameState[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ seed, levelId, history }));
  } catch {
    // ignore
  }
}

function makePuzzle(levelId: number, seed: number): Puzzle {
  const level = levels.find((l) => l.id === levelId) ?? levels[0]!;
  return generatePuzzle(level, wordList, seed);
}

export function App() {
  const wordSet = useMemo(() => new Set(wordList), []);
  const dayIndex = useMemo(() => getDayIndex(), []);

  const [seed, setSeed] = useState<number>(() => loadSaved()?.seed ?? randomSeed());
  const [levelId, setLevelId] = useState<number>(
    () => loadSaved()?.levelId ?? levels[dayIndex % levels.length]!.id,
  );

  const puzzle = useMemo(() => makePuzzle(levelId, seed), [levelId, seed]);
  const level = useMemo(() => levels.find((l) => l.id === levelId) ?? levels[0]!, [levelId]);

  const [history, setHistory] = useState<GameState[]>(() => {
    const saved = loadSaved();
    if (saved && saved.seed === seed && saved.levelId === levelId) return saved.history;
    return [initialState(puzzle, wordSet)];
  });

  const current = history[history.length - 1]!;

  useEffect(() => {
    saveToDisk(seed, levelId, history);
  }, [seed, levelId, history]);

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
    const newSeed = randomSeed();
    const newLevelId = levels[dayIndex % levels.length]!.id;
    const newPuzzle = makePuzzle(newLevelId, newSeed);
    setSeed(newSeed);
    setLevelId(newLevelId);
    setHistory([initialState(newPuzzle, wordSet)]);
  }, [dayIndex, wordSet]);

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

  // Only show words currently on the grid, excluding the answer word
  const visibleWords = current.currentWords
    .filter((m) => m.word !== puzzle.answer)
    .sort((a, b) => scoreWord(b.word) - scoreWord(a.word) || b.word.length - a.word.length);

  const totalScore = current.currentWords
    .filter((m) => m.word !== puzzle.answer)
    .reduce((sum, m) => sum + scoreWord(m.word), 0);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title-group">
          <h1 className="app-title">Sokoword</h1>
          <span className="app-level-name">{level.name}</span>
        </div>
        <div className="app-meta">
          <span className="moves">Moves: {current.moves}</span>
          {totalScore > 0 && <span className="found-count">{totalScore} pts</span>}
        </div>
      </header>

      <main className="app-main">
        <Grid state={current} targetWord={puzzle.answer} />
      </main>

      {visibleWords.length > 0 && (
        <section className="found-words">
          {visibleWords.map((m) => (
            <span key={`${m.word}-${m.startPos.x}-${m.startPos.y}`} className="found-word">
              {m.word.toLowerCase()}
              <span className="found-word-score">{scoreWord(m.word)}</span>
            </span>
          ))}
        </section>
      )}

      <footer className="app-footer">
        <span className="controls">↑↓←→ move · U undo · R new puzzle</span>
      </footer>

      {current.status === 'won' && (
        <div className="win-overlay">
          <div className="win-card">
            <div className="win-emoji">🎉</div>
            <h2 className="win-title">You found it!</h2>
            <p className="win-word">{puzzle.answer.toLowerCase()}</p>
            <p className="win-score">{scoreWord(puzzle.answer)} pts</p>
            <p className="win-moves">Solved in {current.moves} moves</p>
            {visibleWords.length > 0 && (
              <p className="win-bonus">
                +{totalScore} bonus pts from {visibleWords.length} word
                {visibleWords.length !== 1 ? 's' : ''}
              </p>
            )}
            <button className="win-restart" onClick={restart}>
              Next puzzle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
