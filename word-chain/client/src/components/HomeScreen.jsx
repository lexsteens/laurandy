import './HomeScreen.css';

export function HomeScreen({ puzzles, completed, onSelectLevel }) {
  function isUnlocked(puzzle) {
    if (puzzle.id === 1) return true;
    return completed.has(puzzle.id - 1);
  }

  function isCompleted(puzzle) {
    return completed.has(puzzle.id);
  }

  return (
    <div className="home-screen">
      <div className="levels-grid">
        {puzzles.map((puzzle) => {
          const unlocked = isUnlocked(puzzle);
          const done = isCompleted(puzzle);
          return (
            <button
              key={puzzle.id}
              className={`level-btn ${done ? 'level-done' : ''} ${!unlocked ? 'level-locked' : ''}`}
              onClick={() => onSelectLevel(puzzle)}
              disabled={!unlocked}
            >
              <span className="level-number">{puzzle.id}</span>
              {unlocked ? (
                <span className="level-words">
                  {puzzle.start} → {puzzle.end}
                </span>
              ) : (
                <span className="level-lock">🔒</span>
              )}
              {done && <span className="level-check">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
