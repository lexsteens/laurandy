import { useState } from 'react';
import { SimpleMode } from './SimpleMode';
import { SurvivalMode } from './SurvivalMode';
import './App.css';

type Screen = 'home' | 'simple' | 'survival';

export function App() {
  const [screen, setScreen] = useState<Screen>('home');

  if (screen === 'simple') return <SimpleMode onBack={() => setScreen('home')} />;
  if (screen === 'survival') return <SurvivalMode onBack={() => setScreen('home')} />;

  return (
    <div className="home">
      <h1 className="title">Reaction Chain</h1>
      <p className="subtitle">Choose a mode</p>

      <div className="mode-grid">
        <button className="mode-card" onClick={() => setScreen('simple')}>
          <span className="mode-card__name">Classic</span>
          <span className="mode-card__play">Play →</span>
        </button>

        <button className="mode-card mode-card--survival" onClick={() => setScreen('survival')}>
          <span className="mode-card__name">Survival</span>
          <span className="mode-card__play">Play →</span>
        </button>
      </div>
    </div>
  );
}
