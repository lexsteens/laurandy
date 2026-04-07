import { useState, useEffect, useRef } from 'react';
import './GameBoard.css';

const STEPS = 3;

export default function GameBoard({ puzzle, onNewPuzzle }) {
  const [inputs, setInputs] = useState(Array(STEPS).fill(''));
  const [inputStates, setInputStates] = useState(Array(STEPS).fill(null)); // null | 'valid' | 'invalid'
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'won' | 'failed'
  const [checking, setChecking] = useState(false);
  const [stepCount, setStepCount] = useState(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    setInputs(Array(STEPS).fill(''));
    setInputStates(Array(STEPS).fill(null));
    setGameState('playing');
    setStepCount(null);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }, [puzzle]);

  function handleChange(index, value) {
    const next = [...inputs];
    next[index] = value.toLowerCase().replace(/[^a-z]/g, '');
    setInputs(next);
    // Clear validation state for this input when it changes
    setInputStates((prev) => {
      const s = [...prev];
      s[index] = null;
      return s;
    });
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Enter') {
      if (index < STEPS - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        handleSubmit();
      }
    }
  }

  // Find the effective previous word in the chain for a given input index
  function prevWordFor(index) {
    for (let i = index - 1; i >= 0; i--) {
      if (inputs[i].trim()) return inputs[i].trim();
    }
    return puzzle.start;
  }

  // Find the effective next word in the chain for a given input index
  function nextWordFor(index) {
    for (let i = index + 1; i < STEPS; i++) {
      if (inputs[i].trim()) return inputs[i].trim();
    }
    return puzzle.end;
  }

  async function checkLink(from, to) {
    const res = await fetch('/api/check-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to }),
    });
    const data = await res.json();
    return data.valid;
  }

  async function handleBlur(index) {
    const word = inputs[index].trim();
    if (!word) return;

    const prev = prevWordFor(index);
    const next = nextWordFor(index);

    const [linkIn, linkOut] = await Promise.all([checkLink(prev, word), checkLink(word, next)]);

    setInputStates((s) => {
      const next = [...s];
      next[index] = linkIn && linkOut ? 'valid' : 'invalid';
      return next;
    });
  }

  async function handleSubmit() {
    if (gameState !== 'playing') return;
    const chain = [puzzle.start, ...inputs.map((w) => w.trim()).filter(Boolean), puzzle.end];
    if (chain.length < 3) return; // need at least 1 middle word

    setChecking(true);
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chain }),
      });
      const data = await res.json();

      // Map link results back to input indices
      const filledIndices = inputs.map((w, i) => ({ w: w.trim(), i })).filter((x) => x.w);
      const newStates = [...inputStates];
      filledIndices.forEach(({ i }, chainPos) => {
        // link into this word = data.links[chainPos], link out = data.links[chainPos + 1]
        const linkIn = data.links[chainPos];
        const linkOut = data.links[chainPos + 1];
        newStates[i] = linkIn.valid && linkOut.valid ? 'valid' : 'invalid';
      });
      setInputStates(newStates);

      if (data.valid) {
        setStepCount(chain.length - 2); // number of middle words used
        setGameState('won');
      } else {
        setGameState('failed');
      }
    } finally {
      setChecking(false);
    }
  }

  function handleReset() {
    setInputs(Array(STEPS).fill(''));
    setInputStates(Array(STEPS).fill(null));
    setGameState('playing');
    setStepCount(null);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }

  const anyFilled = inputs.some((w) => w.trim().length > 0);

  return (
    <div className="game-board">
      <div className="chain">
        {/* Start word */}
        <div className="chain-item">
          <div className="word-node fixed">
            <span className="word-fixed">{puzzle.start.toUpperCase()}</span>
          </div>
          <div className="link-arrow">
            <span className="arrow-line" />
            <span className="arrow-head">›</span>
          </div>
        </div>

        {/* Middle inputs */}
        {inputs.map((word, i) => (
          <div key={i} className="chain-item">
            <div className="word-node">
              <input
                ref={(el) => (inputRefs.current[i] = el)}
                className={`word-input ${inputStates[i] === 'invalid' ? 'input-invalid' : ''} ${inputStates[i] === 'valid' ? 'input-valid' : ''}`}
                type="text"
                value={word}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onBlur={() => handleBlur(i)}
                placeholder={`step ${i + 1} (optional)`}
                maxLength={20}
                disabled={gameState !== 'playing'}
                autoComplete="off"
                spellCheck="false"
              />
            </div>
            <div className="link-arrow">
              <span className="arrow-line" />
              <span className="arrow-head">›</span>
            </div>
          </div>
        ))}

        {/* End word */}
        <div className="chain-item">
          <div className="word-node fixed">
            <span className="word-fixed">{puzzle.end.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {gameState === 'won' && (
        <div className="result-banner result-won">
          Solved in {stepCount} step{stepCount !== 1 ? 's' : ''}!
        </div>
      )}

      {gameState === 'failed' && (
        <div className="result-banner result-failed">Some links are broken — try again.</div>
      )}

      <div className="actions">
        {gameState === 'playing' && (
          <>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!anyFilled || checking}
            >
              {checking ? 'Checking...' : 'Submit Chain'}
            </button>
            <button className="btn btn-ghost" onClick={handleReset}>
              Clear
            </button>
          </>
        )}

        {gameState !== 'playing' && (
          <>
            <button className="btn btn-primary" onClick={onNewPuzzle}>
              New Puzzle
            </button>
            {gameState === 'failed' && (
              <button className="btn btn-ghost" onClick={handleReset}>
                Try Again
              </button>
            )}
          </>
        )}
      </div>

      <p className="hint">Use 1–3 steps. Empty slots are skipped.</p>
    </div>
  );
}
