import { useGame } from './hooks/use-game';
import { Board } from './components/Board';
import { HintBar } from './components/HintBar';
import { ScoreBar } from './components/ScoreBar';
import './App.css';

export function App() {
  const { state, blanks, hint, guess, onClearFlash, onToggleKeep, newGame, setActive, prevBlank } =
    useGame();

  return (
    <div className="app">
      <h1 className="app__title">SKELETON</h1>

      <ScoreBar
        score={state.score}
        maxScore={state.maxScore}
        keepCorrect={state.keepCorrect}
        onToggleKeep={onToggleKeep}
        solved={state.solved}
      />

      <Board
        state={state}
        blanks={blanks}
        onGuess={guess}
        onClearFlash={onClearFlash}
        onSetActive={setActive}
        onPrevBlank={prevBlank}
      />

      <HintBar onHint={hint} disabled={state.solved} />

      {state.solved && (
        <div className="app__result">
          <p className="app__word">{state.target.toUpperCase()}</p>
          <p className="app__score-final">
            Score: {state.score} / {state.maxScore}
          </p>
          <button className="app__new-game" onClick={newGame}>
            New word
          </button>
        </div>
      )}

      {!state.solved && blanks.length === 0 && (
        <p className="app__hint-text">Use hints to reveal letters, then type your guesses</p>
      )}
    </div>
  );
}
