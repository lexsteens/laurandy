import type { HintType } from '../../game/engine';
import './HintBar.css';

type HintBarProps = {
  onHint: (hint: HintType) => void;
  disabled: boolean;
  freeLetterUsed: boolean;
  freeLetterMode: boolean;
  onEnterFreeLetter: () => void;
};

const hints: { type: HintType; label: string }[] = [
  { type: 'first', label: 'First' },
  { type: 'last', label: 'Last' },
  { type: 'vowels', label: 'Vowels' },
  { type: 'even', label: 'Even' },
  { type: 'odd', label: 'Odd' },
];

export function HintBar({
  onHint,
  disabled,
  freeLetterUsed,
  freeLetterMode,
  onEnterFreeLetter,
}: HintBarProps) {
  return (
    <div className="hint-bar">
      <span className="hint-bar__label">Hints:</span>
      <button
        className={`hint-btn hint-btn--free ${freeLetterUsed ? 'hint-btn--used' : ''} ${freeLetterMode ? 'hint-btn--active' : ''}`}
        onClick={onEnterFreeLetter}
        disabled={disabled || freeLetterUsed}
      >
        {freeLetterUsed ? '1 free ✓' : '1 free'}
      </button>
      {hints.map((h) => (
        <button
          key={h.type}
          className="hint-btn"
          onClick={() => onHint(h.type)}
          disabled={disabled}
        >
          {h.label}
        </button>
      ))}
    </div>
  );
}
