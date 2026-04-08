import type { GameState } from '../../game/types';
import './Grid.css';

interface Props {
  state: GameState;
}

export function Grid({ state }: Props) {
  const { grid } = state;

  return (
    <div className="grid" style={{ '--cols': grid[0]?.length ?? 0 } as React.CSSProperties}>
      {grid.map((row, y) =>
        row.map((cell, x) => {
          let className = 'cell';

          if (cell.type === 'wall') {
            className += ' cell--wall';
          } else if (cell.locked) {
            className += ' cell--locked';
          } else if (cell.letter !== null && cell.target !== null) {
            // Wrong letter sitting on a target
            className += ' cell--floor cell--wrong-on-target';
          } else if (cell.letter !== null) {
            className += ' cell--floor cell--letter';
          } else if (cell.target !== null) {
            className += ' cell--floor cell--target';
          } else {
            className += ' cell--floor';
          }

          let content: React.ReactNode = null;

          if (cell.hasPlayer) {
            content = <span className="player">@</span>;
          } else if (cell.locked) {
            content = <span className="letter-char">{cell.letter}</span>;
          } else if (cell.letter !== null) {
            content = <span className="letter-char">{cell.letter}</span>;
          } else if (cell.target !== null) {
            content = <span className="target-index">{cell.target.index + 1}</span>;
          }

          return (
            <div key={`${y}-${x}`} className={className}>
              {content}
            </div>
          );
        }),
      )}
    </div>
  );
}
