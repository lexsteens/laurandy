import './ScoreBar.css';

type ScoreBarProps = {
  score: number;
  maxScore: number;
  keepCorrect: boolean;
  penalizeWrong: boolean;
  onToggleKeep: () => void;
  onTogglePenalize: () => void;
  solved: boolean;
};

export function ScoreBar({
  score,
  maxScore,
  keepCorrect,
  penalizeWrong,
  onToggleKeep,
  onTogglePenalize,
  solved,
}: ScoreBarProps) {
  return (
    <div className="score-bar">
      <div className="score-bar__score">
        <span className="score-bar__value">{score}</span>
        <span className="score-bar__max">/ {maxScore}</span>
      </div>
      <div className="score-bar__toggles">
        <label className="score-bar__toggle">
          <input type="checkbox" checked={keepCorrect} onChange={onToggleKeep} disabled={solved} />
          <span className="score-bar__toggle-label">
            Keep correct {keepCorrect ? '(−1 pt)' : '(free)'}
          </span>
        </label>
        <label className="score-bar__toggle">
          <input
            type="checkbox"
            checked={penalizeWrong}
            onChange={onTogglePenalize}
            disabled={solved}
          />
          <span className="score-bar__toggle-label">
            Penalize wrong {penalizeWrong ? '(−1 pt)' : '(free)'}
          </span>
        </label>
      </div>
    </div>
  );
}
