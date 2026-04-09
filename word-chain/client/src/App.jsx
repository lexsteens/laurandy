import { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen.jsx';
import { GameBoard } from './components/GameBoard.jsx';
import './App.css';

const STORAGE_KEY = 'word-chain-completed';

function loadCompleted() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveCompleted(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function App() {
  const [screen, setScreen] = useState('home');
  const [puzzles, setPuzzles] = useState([]);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [completed, setCompleted] = useState(loadCompleted);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/puzzles')
      .then((r) => r.json())
      .then((data) => {
        setPuzzles(data);
        setLoading(false);
      });
  }, []);

  function handleSelectLevel(puzzle) {
    setCurrentPuzzle(puzzle);
    setScreen('game');
  }

  function handleWin(puzzleId) {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(puzzleId);
      saveCompleted(next);
      return next;
    });
  }

  function handleHome() {
    setScreen('home');
    setCurrentPuzzle(null);
  }

  const nextPuzzle = currentPuzzle
    ? (puzzles.find((p) => p.id === currentPuzzle.id + 1) ?? null)
    : null;

  function handleNextLevel() {
    if (nextPuzzle) setCurrentPuzzle(nextPuzzle);
    else setScreen('home');
  }

  return (
    <div className={`app ${screen === 'home' ? 'app-wide' : ''}`}>
      <header className="app-header">
        <h1 className="app-title">Word Chain</h1>
        {screen === 'home' && <p className="app-subtitle">Connect the words in 3 steps</p>}
      </header>

      <main>
        {loading && <div className="status-message">Loading...</div>}
        {!loading && screen === 'home' && (
          <HomeScreen puzzles={puzzles} completed={completed} onSelectLevel={handleSelectLevel} />
        )}
        {!loading && screen === 'game' && currentPuzzle && (
          <GameBoard
            puzzle={currentPuzzle}
            onWin={handleWin}
            onHome={handleHome}
            onNextLevel={nextPuzzle ? handleNextLevel : null}
          />
        )}
      </main>
    </div>
  );
}
