type Props = {
  foundWords: string[];
};

function getMedal(count: number): string {
  if (count >= 3) return '🥇';
  if (count === 2) return '🥈';
  if (count === 1) return '🥉';
  return '';
}

export function FoundWords({ foundWords }: Props) {
  if (foundWords.length === 0) return null;

  return (
    <div className="found-words">
      <div className="found-words__header">
        <span className="found-words__medal">{getMedal(foundWords.length)}</span>
        <span className="found-words__count">
          {foundWords.length} word{foundWords.length !== 1 ? 's' : ''} found
        </span>
      </div>
      <ul className="found-words__list">
        {foundWords.map((word) => (
          <li key={word} className="found-words__item">
            {word.toUpperCase()}
          </li>
        ))}
      </ul>
    </div>
  );
}
