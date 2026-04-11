import type { Grid } from '../../game/types';
import './Board.css';

type Props = {
  grid: Grid;
  onTileClick: (row: number, col: number) => void;
};

const FONT_SIZES = ['0px', '14px', '22px', '34px'];
const BG_COLORS = ['#111827', '#1e3a5f', '#7c3aed', '#dc2626'];

export function Board({ grid, onTileClick }: Props) {
  return (
    <div className="board">
      {grid.map((row, r) =>
        row.map((value, c) => (
          <button
            key={`${r}-${c}`}
            className="tile"
            style={{
              backgroundColor: BG_COLORS[value],
              fontSize: FONT_SIZES[value],
            }}
            onClick={() => onTileClick(r, c)}
            aria-label={`tile ${r},${c} value ${value}`}
          >
            {value > 0 ? value : ''}
          </button>
        )),
      )}
    </div>
  );
}
