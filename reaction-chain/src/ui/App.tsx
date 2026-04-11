import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { SimpleMode } from './SimpleMode';
import { SurvivalMode } from './SurvivalMode';
import { ThemeToggle } from './theme';
import './App.css';

type Screen = 'home' | 'simple' | 'survival';

function ShareOverlay({ onClose }: { onClose: () => void }) {
  const [src, setSrc] = useState('');
  const [copied, setCopied] = useState(false);
  const url =
    (typeof __LAN_ORIGIN__ === 'string' ? __LAN_ORIGIN__ : null) ?? window.location.origin;

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: { dark: '#e2e8f0', light: '#0f1729' },
    }).then(setSrc);
  }, [url]);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-card" onClick={(e) => e.stopPropagation()}>
        <button className="overlay-close" onClick={onClose}>
          ✕
        </button>
        {src && <img src={src} alt="QR code" className="qr-img" />}
        <span className="overlay-url">{url}</span>
        <button className="share-btn" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}

export function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [sharing, setSharing] = useState(false);

  if (screen === 'simple') return <SimpleMode onBack={() => setScreen('home')} />;
  if (screen === 'survival') return <SurvivalMode onBack={() => setScreen('home')} />;

  return (
    <div className="home">
      {sharing && <ShareOverlay onClose={() => setSharing(false)} />}

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

      <div className="home-actions">
        <ThemeToggle />
        <button className="share-btn" onClick={() => setSharing(true)} aria-label="Share">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="14" cy="4" r="2.2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="14" cy="14" r="2.2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="4" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.5" />
            <line
              x1="11.9"
              y1="5.1"
              x2="6.1"
              y2="7.9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="6.1"
              y1="10.1"
              x2="11.9"
              y2="12.9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
