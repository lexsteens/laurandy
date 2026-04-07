# Architecture Decisions

_2026-04-07_

## Game Logic / Rendering Separation

**Decision**: game logic is pure TypeScript with zero framework dependencies. Rendering is a separate layer that reads state and dispatches actions.

**Why**:

- We can unit test game logic without a browser
- We can swap renderers (React, Flutter, CLI, JSON dump) without touching game code
- AI coding agents can write and verify game logic without needing to render anything
- Debugging is simpler — print state as JSON at any point

**How it works**:

```
src/game/engine.ts     →  pure functions: (state, action) → newState
src/ui/App.tsx          →  useReducer(gameReducer, initialState)
```

The game module exports types and pure functions. React (or any renderer) calls these functions and renders the resulting state. The game logic IS the reducer.

Example flow:

```
User clicks "submit" → UI dispatches submitGuess(state, "PARENT")
                      → game logic returns new state with guess result
                      → React re-renders from new state
```

## Current Renderer: React

React is the renderer for validation prototypes. Chosen because:

- Fast to build, no app store friction
- Good for testing whether mechanics are fun
- Both Andy and Laurent can work with it

React is explicitly a **detail**, not a commitment. The game logic doesn't know React exists.

## Future Renderer Options

If a game validates as fun, these are on the table:

- **Flutter** — for native mobile (App Store/Play Store, IAP, push notifications)
- **Game engine** (Phaser, PixiJS) — if we need animations, physics, or richer visuals
- **CLI** — for debugging, automated testing, or just for fun

All would consume the same `src/game/` module. Only the rendering layer changes.

## State Management

**Decision**: `useReducer` in React, not Redux or other state libraries.

**Why**:

- Our games have one screen with one state object — Redux is overhead
- `useReducer` is literally the pattern we need: dispatch action → reducer returns new state
- The game's pure functions ARE the reducer
- If we later need shared state (multiplayer, cross-component), `useReducer` + React context scales without adding a library

## No Game Engine (For Now)

**Decision**: no Phaser, PixiJS, or similar for the prototypes.

**Why**: our games are turn-based puzzles, not real-time simulations. They don't need physics, sprite sheets, or frame loops. A game engine would add complexity and learning curve for no benefit at this stage.

## Conventions Doc

See root `CLAUDE.md` for full repo conventions (naming, stack, quality, git workflow).
