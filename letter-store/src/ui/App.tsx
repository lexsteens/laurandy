import { useCallback, useEffect, useMemo, useState } from 'react';
import { initialState, move } from '../game/engine';
import { generatePuzzle, randomSeed } from '../game/level-generator';
import { levels } from '../game/levels/index';
import { scoreWord } from '../game/scoring';
import type { Direction, GameState, Puzzle } from '../game/types';
import { wordList } from '../game/word-list';
import { Grid } from './components/Grid';
import { HomeScreen } from './components/HomeScreen';

const STORAGE_KEY = 'letter-store-v4';
const MAX_HISTORY = 100;

type Screen = 'home' | 'game';

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

  // Restore saved game on mount, otherwise start at home
  const saved = useMemo(() => loadSaved(), []);

  const [screen, setScreen] = useState<Screen>(saved ? 'game' : 'home');
  const [proposedSeed, setProposedSeed] = useState<number>(saved?.seed ?? randomSeed());

  const [seed, setSeed] = useState<number>(saved?.seed ?? randomSeed());
  const [levelId, setLevelId] = useState<number>(saved?.levelId ?? levels[0]!.id);

  const puzzle = useMemo(() => makePuzzle(levelId, seed), [levelId, seed]);
  const level = useMemo(() => levels.find((l) => l.id === levelId) ?? levels[0]!, [levelId]);

  const [history, setHistory] = useState<GameState[]>(() => {
    if (saved) return saved.history;
    return [initialState(makePuzzle(levels[0]!.id, seed), wordSet)];
  });

  const current = history[history.length - 1]!;

  useEffect(() => {
    if (screen === 'game') saveToDisk(seed, levelId, history);
  }, [screen, seed, levelId, history]);

  const startGame = useCallback(
    (newLevelId: number, newSeed: number) => {
      const newPuzzle = makePuzzle(newLevelId, newSeed);
      setSeed(newSeed);
      setLevelId(newLevelId);
      setHistory([initialState(newPuzzle, wordSet)]);
      setScreen('game');
    },
    [wordSet],
  );

  const goHome = useCallback(() => {
    setScreen('home');
    setProposedSeed(randomSeed());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

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

  useEffect(() => {
    if (screen !== 'game') return;

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
        default:
          return;
      }
      e.preventDefault();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, applyMove, undo]);

  if (screen === 'home') {
    return <HomeScreen levels={levels} initialSeed={proposedSeed} onStart={startGame} />;
  }

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
          <button className="app-home-btn" onClick={goHome} title="Back to home">
            ⌂
          </button>
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
        <span className="controls">↑↓←→ move · U undo · seed {seed}</span>
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
            <button className="win-restart" onClick={goHome}>
              Back to home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
