import type { HistoryEntry } from '../../game/engine';
import './History.css';

type HistoryProps = {
  entries: HistoryEntry[];
};

export function History({ entries }: HistoryProps) {
  if (entries.length === 0) return null;

  return (
    <div className="history">
      <h3 className="history__title">History</h3>
      <div className="history__list">
        {entries.map((entry, i) => (
          <div key={i} className="history__entry">
            <div className="history__word">
              {entry.tiles.map((tile, j) => (
                <span key={j} className={`history__letter history__letter--${tile.source}`}>
                  {tile.letter.toUpperCase()}
                </span>
              ))}
            </div>
            <div className="history__stats">
              <span className="history__score">
                {entry.score}/{entry.maxScore}
              </span>
              {entry.wrongAttempts > 0 && (
                <span className="history__wrong">{entry.wrongAttempts} wrong</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
