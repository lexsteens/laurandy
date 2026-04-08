import { useMemo } from 'react';
import type { GameState } from '../../game/types';
import './Grid.css';

interface Props {
  state: GameState;
}

export function Grid({ state }: Props) {
  const { grid, currentWords } = state;

  // Build a set: "x,y" for all cells in currently-formed words
  const highlightSet = useMemo(() => {
    const set = new Set<string>();
    for (const match of currentWords) {
      for (let i = 0; i < match.word.length; i++) {
        const cx = match.direction === 'h' ? match.startPos.x + i : match.startPos.x;
        const cy = match.direction === 'v' ? match.startPos.y + i : match.startPos.y;
        set.add(`${cx},${cy}`);
      }
    }
    return set;
  }, [currentWords]);

  return (
    <div className="grid" style={{ '--cols': grid[0]?.length ?? 0 } as React.CSSProperties}>
      {grid.map((row, y) =>
        row.map((cell, x) => {
          const highlighted = highlightSet.has(`${x},${y}`);

          let className = 'cell';
          if (cell.type === 'wall') {
            className += ' cell--wall';
          } else if (cell.letter !== null) {
            className += ' cell--letter';
            if (highlighted) className += ' cell--found-word';
          } else {
            className += ' cell--floor';
          }

          let content: React.ReactNode = null;
          if (cell.hasPlayer) {
            content = <span className="player">@</span>;
          } else if (cell.letter !== null) {
            content = <span className="letter-char">{cell.letter}</span>;
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
