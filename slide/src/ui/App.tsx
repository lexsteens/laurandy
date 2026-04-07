import { useCallback, useEffect, useReducer, useState } from 'react';
import {
  checkForNewWord,
  clearNewWord,
  createGame,
  slideRow,
  type GameState,
} from '../game/engine';
import { wordList as wordArray } from '../game/word-list';
import { puzzles } from '../game/puzzles';
import { Board } from './components/Board';
import { FoundWords } from './components/FoundWords';
import './App.css';

const wordSet = new Set(wordArray);

type Action =
  | { type: 'SLIDE'; rowIndex: number; direction: -1 | 1 }
  | { type: 'CLEAR_NEW_WORD' }
  | { type: 'INIT'; words: string[] };

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'INIT':
      return createGame(action.words);
    case 'SLIDE': {
      const slid = slideRow(state, action.rowIndex, action.direction);
      return checkForNewWord(slid, wordSet);
    }
    case 'CLEAR_NEW_WORD':
      return clearNewWord(state);
    default:
      return state;
  }
}

export function App() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [hintRevealed, setHintRevealed] = useState(false);

  const puzzle = puzzles[puzzleIndex % puzzles.length];

  const [gameState, dispatch] = useReducer(gameReducer, puzzle.rows, createGame);

  // Reset game state when puzzle changes
  useEffect(() => {
    dispatch({ type: 'INIT', words: puzzle.rows });
    setHintRevealed(false);
  }, [puzzleIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear newWord flash after 800ms
  useEffect(() => {
    if (gameState.newWord === null) return;
    const timer = setTimeout(() => {
      dispatch({ type: 'CLEAR_NEW_WORD' });
    }, 800);
    return () => clearTimeout(timer);
  }, [gameState.newWord]);

  const handleSlide = useCallback((rowIndex: number, direction: -1 | 1) => {
    dispatch({ type: 'SLIDE', rowIndex, direction });
  }, []);

  const handleNext = useCallback(() => {
    setPuzzleIndex((i) => i + 1);
  }, []);

  const handleGiveUp = useCallback(() => {
    setHintRevealed(true);
  }, []);

  const puzzleNumber = (puzzleIndex % puzzles.length) + 1;

  return (
    <div className="app">
      <h1 className="app__title">SLIDE</h1>
      <p className="app__subtitle">Slide rows until the center column spells a word</p>

      <div className="app__meta">
        <span className="app__puzzle-count">
          Puzzle {puzzleNumber} / {puzzles.length}
        </span>
        {gameState.newWord && (
          <span className="app__found-flash">✓ {gameState.newWord.toUpperCase()}</span>
        )}
      </div>

      <Board state={gameState} onSlide={handleSlide} />

      <FoundWords foundWords={gameState.foundWords} />

      {hintRevealed && (
        <p className="app__hint">
          One solution: <strong>{puzzle.hint.toUpperCase()}</strong>
        </p>
      )}

      <div className="app__actions">
        {!hintRevealed && (
          <button className="app__btn app__btn--ghost" onClick={handleGiveUp}>
            Give up
          </button>
        )}
        <button className="app__btn app__btn--primary" onClick={handleNext}>
          Next puzzle →
        </button>
      </div>
    </div>
  );
}
