import { useMemo } from 'react';
import type { GameState } from '../../game/types';
import './Grid.css';

interface Props {
  state: GameState;
  targetWord: string;
}

type CellHighlight = 'target' | 'word' | null;

export function Grid({ state, targetWord }: Props) {
  const { grid, currentWords } = state;

  // Build a map: "x,y" → highlight type for all cells in currently-formed words
  const highlightMap = useMemo(() => {
    const map = new Map<string, CellHighlight>();
    for (const match of currentWords) {
      const isTarget = match.word === targetWord;
      for (let i = 0; i < match.word.length; i++) {
        const cx = match.direction === 'h' ? match.startPos.x + i : match.startPos.x;
        const cy = match.direction === 'v' ? match.startPos.y + i : match.startPos.y;
        const key = `${cx},${cy}`;
        // Target highlight wins over regular word highlight
        if (isTarget || map.get(key) !== 'target') {
          map.set(key, isTarget ? 'target' : 'word');
        }
      }
    }
    return map;
  }, [currentWords, targetWord]);

  return (
    <div className="grid" style={{ '--cols': grid[0]?.length ?? 0 } as React.CSSProperties}>
      {grid.map((row, y) =>
        row.map((cell, x) => {
          const highlight = highlightMap.get(`${x},${y}`) ?? null;

          let className = 'cell';
          if (cell.type === 'wall') {
            className += ' cell--wall';
          } else if (cell.letter !== null) {
            className += ' cell--letter';
            if (highlight === 'target') className += ' cell--target-word';
            else if (highlight === 'word') className += ' cell--found-word';
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
