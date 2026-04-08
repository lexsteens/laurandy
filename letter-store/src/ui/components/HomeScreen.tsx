import { useState } from 'react';
import type { Level } from '../../game/types';

interface HomeScreenProps {
  levels: Level[];
  initialSeed: number;
  onStart: (levelId: number, seed: number) => void;
}

export function HomeScreen({ levels, initialSeed, onStart }: HomeScreenProps) {
  const [seedInput, setSeedInput] = useState(String(initialSeed));

  const parsedSeed = parseInt(seedInput, 10);
  const seedValid = Number.isInteger(parsedSeed) && parsedSeed > 0;

  return (
    <div className="home">
      <div className="home-header">
        <h1 className="home-title">Letter Store</h1>
        <p className="home-tagline">Push letters. Spell the word.</p>
      </div>

      <div className="home-seed-row">
        <label className="home-seed-label" htmlFor="seed-input">
          Seed
        </label>
        <input
          id="seed-input"
          className={`home-seed-input${seedValid ? '' : ' home-seed-input--invalid'}`}
          type="number"
          min={1}
          value={seedInput}
          onChange={(e) => setSeedInput(e.target.value)}
        />
      </div>

      <div className="home-levels">
        {levels.map((level) => (
          <button
            key={level.id}
            className="home-level-card"
            disabled={!seedValid}
            onClick={() => onStart(level.id, parsedSeed)}
          >
            <span className="home-level-number">Level {level.id}</span>
            <span className="home-level-name">{level.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
