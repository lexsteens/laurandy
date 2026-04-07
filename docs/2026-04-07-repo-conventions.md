# Repo Conventions

_2026-04-07_

## Naming

- Folder names: lowercase kebab-case (`word-chain`, `skeleton`)
- React components: PascalCase (`GameBoard.tsx`)
- Other files: kebab-case (`game-engine.ts`, `word-list.ts`)
- Named exports only — no default exports

## Stack

- TypeScript for all new code
- React + Vite for web prototypes
- Vitest for testing (root config)
- No UI libraries — plain CSS or CSS modules

## Architecture

- `src/game/` — pure TypeScript, no framework dependencies
- `src/ui/` — React, renders state via `useReducer`
- Unit tests required for game logic

## Quality

- Prettier + ESLint at repo root
- Husky pre-commit hook runs lint-staged (auto-formats and lints)
- `.env.template` committed for every `.env` that is gitignored

## Git

- Commit and push often — sync frequently
- Commit messages: lowercase, imperative
- `main` must always work
- Branch-per-feature is fine; direct-to-main also fine — merge ASAP

## Docs

- Shared: `docs/` at root, date-prefixed
- Per-game: `<game>/docs/`
- Each game has `README.md` + `CLAUDE.md`
