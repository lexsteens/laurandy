import './ScoreBar.css';

type ScoreBarProps = {
  score: number;
  maxScore: number;
  keepCorrect: boolean;
  onToggleKeep: () => void;
  solved: boolean;
};

export function ScoreBar({ score, maxScore, keepCorrect, onToggleKeep, solved }: ScoreBarProps) {
  return (
    <div className="score-bar">
      <div className="score-bar__score">
        <span className="score-bar__value">{score}</span>
        <span className="score-bar__max">/ {maxScore}</span>
      </div>
      <label className="score-bar__toggle">
        <input type="checkbox" checked={keepCorrect} onChange={onToggleKeep} disabled={solved} />
        <span className="score-bar__toggle-label">
          Keep correct letters {keepCorrect ? '(−1 pt each)' : '(free)'}
        </span>
      </label>
    </div>
  );
}
