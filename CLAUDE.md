# Laurandy — Game Studio

## What this is

Small browser-based puzzle games by Laurent and Andy. Each game lives in its own folder.

## Repo structure

```
/
├── CLAUDE.md            # this file
├── docs/                # shared documentation (date-prefixed)
├── word-chain/          # word association chain (built)
├── skeleton/            # alternating-letters puzzle (to build)
├── crossfire/           # compound word bridge puzzle (to build)
└── slide/               # sliding rows vertical word puzzle (to build)
```

## Architecture

**Game logic is separated from rendering.** Two layers, strict import direction.

### Folder structure (per game)

```
game-name/
├── CLAUDE.md
├── README.md
├── package.json
├── src/
│   ├── game/                # LAYER 1 — pure TypeScript, zero dependencies
│   │   ├── types.ts         # state types, action types
│   │   ├── engine.ts        # pure functions: (state, action) → newState
│   │   ├── engine.test.ts   # unit tests (no DOM, no React)
│   │   └── data.ts          # word lists, puzzle data, constants
│   └── ui/                  # LAYER 2 — React renderer
│       ├── App.tsx           # useReducer(gameReducer, initialState)
│       ├── App.css
│       ├── hooks/
│       │   └── use-game.ts  # wraps useReducer + game engine
│       └── components/
│           ├── Board.tsx
│           └── Board.css
```

### Import rules

```
game/  ←──  ui/       ✅  ui/ imports from game/
game/  ──→  ui/       ❌  game/ NEVER imports from ui/
game/  ──→  react     ❌  game/ NEVER imports React or DOM APIs
```

- `src/game/` — pure functions: `(state, action) → newState`. Testable without a browser.
- `src/ui/` — React renders state via `useReducer`. The game logic IS the reducer.
- This separation allows: unit tests, CLI debugging, JSON state dumps, swapping renderers.

**Current renderer**: React + Vite (validation prototypes).
**Future**: could add Flutter mobile, a game engine, or CLI — same game logic, different renderer.

## Conventions

### Naming

- Folder names: **lowercase kebab-case** (`word-chain`, not `Word Chain`)
- React components: **PascalCase** (`GameBoard.tsx`)
- Everything else: **kebab-case** (`game-engine.ts`, `word-list.ts`)
- Named exports only — no default exports

### Stack

- **TypeScript** for all new code
- **React + Vite** for web prototypes
- **Vitest** for testing (config at repo root)
- **No UI libraries** — plain CSS or CSS modules

### Quality

- **Prettier + ESLint** configured at repo root, enforced via husky pre-commit hook
- **Unit tests required** for game logic (`src/game/*.test.ts`)
- **`.env.template`** committed for every `.env` that is gitignored

### Git

- Commit and push often — small commits, sync frequently
- Commit messages: lowercase, imperative (`add skeleton game logic`)
- `main` must always be working — don't push broken code
- Branch-per-feature is fine; direct-to-main also fine — merge to main ASAP

### Docs

- Shared docs: `docs/` at root, prefixed with date (`2026-04-07-topic.md`)
- Game-specific docs: `<game>/docs/`
- Each game folder has a `README.md` (game-specific) and `CLAUDE.md` (build spec)

## Running

```bash
# install root tooling (prettier, eslint, husky)
npm install

# run a game
cd <game-folder>
npm install
npm run dev

# run tests (from root)
npx vitest run

# lint / format
npm run lint
npm run format
```
