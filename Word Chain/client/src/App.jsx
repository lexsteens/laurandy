import { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard.jsx';
import './App.css';

export default function App() {
  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchPuzzle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/puzzle/random');
      if (!res.ok) throw new Error('Failed to load puzzle');
      const data = await res.json();
      setPuzzle(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPuzzle();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Word Chain</h1>
        <p className="app-subtitle">Connect the words in 3 steps</p>
      </header>

      <main>
        {loading && <div className="status-message">Loading puzzle...</div>}
        {error && <div className="status-message error">{error}</div>}
        {puzzle && !loading && (
          <GameBoard puzzle={puzzle} onNewPuzzle={fetchPuzzle} />
        )}
      </main>
    </div>
  );
}
