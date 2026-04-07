import { useGame } from './hooks/use-game';
import { Board } from './components/Board';
import { HintBar } from './components/HintBar';
import { ScoreBar } from './components/ScoreBar';
import { History } from './components/History';
import './App.css';

export function App() {
  const {
    state,
    blanks,
    hint,
    guess,
    onClearFlash,
    onToggleKeep,
    onTogglePenalize,
    onEnterFreeLetter,
    onCancelFreeLetter,
    onUseFreeLetter,
    newGame,
    setActive,
    prevBlank,
  } = useGame();

  return (
    <div className="app">
      <h1 className="app__title">SKELETON</h1>
      {!state.solved && (
        <p className="app__subtitle">Guess this {state.target.length}-letter word</p>
      )}

      <ScoreBar
        score={state.score}
        maxScore={state.maxScore}
        keepCorrect={state.keepCorrect}
        penalizeWrong={state.penalizeWrong}
        onToggleKeep={onToggleKeep}
        onTogglePenalize={onTogglePenalize}
        solved={state.solved}
      />

      {state.freeLetterMode && (
        <p className="app__free-prompt">
          Pick a letter to reveal for free!{' '}
          <button className="app__free-cancel" onClick={onCancelFreeLetter}>
            Cancel
          </button>
        </p>
      )}

      <Board
        state={state}
        onGuess={guess}
        onClearFlash={onClearFlash}
        onSetActive={setActive}
        onPrevBlank={prevBlank}
        onUseFreeLetter={onUseFreeLetter}
      />

      <HintBar
        onHint={hint}
        disabled={state.solved || state.freeLetterMode}
        freeLetterUsed={state.freeLetterUsed}
        freeLetterMode={state.freeLetterMode}
        onEnterFreeLetter={onEnterFreeLetter}
      />

      {state.solved ? (
        <div className="app__result">
          <p className="app__word">{state.target.toUpperCase()}</p>
          <p className="app__score-final">
            Score: {state.score} / {state.maxScore}
          </p>
          <button className="app__new-game" onClick={newGame}>
            New word
          </button>
        </div>
      ) : (
        <div className="app__skip">
          <button className="app__skip-btn" onClick={newGame}>
            Skip — new word
          </button>
        </div>
      )}

      {!state.solved && blanks.length === 0 && (
        <p className="app__hint-text">Use hints to reveal letters, then type your guesses</p>
      )}

      <History entries={state.history} />
    </div>
  );
}
