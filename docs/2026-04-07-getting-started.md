# Getting Started

_For Laurent (or anyone new to the repo)._

## 1. Install Node via nvm

### If you're on WSL (Linux under Windows) — recommended

```bash
# install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# restart your terminal, then:
nvm install 22
nvm use 22

# verify
node -v   # should show v22.x
npm -v    # should show 10.x
```

nvm is automatically added to your `~/.bashrc` or `~/.zshrc` by the install script.

### If you're on Windows (no WSL)

nvm-sh doesn't work on native Windows. Use **nvm-windows** instead:

1. Download the installer from https://github.com/coreybutler/nvm-windows/releases (pick `nvm-setup.exe`)
2. Run the installer
3. Open a **new** terminal (cmd or PowerShell), then:

```powershell
nvm install 22
nvm use 22

# verify
node -v
npm -v
```

**Recommendation**: use WSL if possible. It avoids path/shell issues with Node tooling on Windows, and the git hooks work without changes.

## 2. Clone and set up the repo

```bash
git clone <repo-url>
cd laurandy
npm install            # installs tooling + sets up git hooks automatically
```

That's it. Prettier, ESLint, and husky pre-commit hooks are now active. Every time you commit, your code is auto-formatted and linted — no config needed.

## 3. Run a game

```bash
cd word-chain          # or skeleton, crossfire, slide
npm install
npm run dev
```

## 4. What the tooling does for you

| Tool         | What it does                           | When it runs                         |
| ------------ | -------------------------------------- | ------------------------------------ |
| **Prettier** | Auto-formats code, JSON, markdown, CSS | On every commit (automatic)          |
| **ESLint**   | Catches bugs and enforces code style   | On every commit (automatic)          |
| **Husky**    | Runs the above before each commit      | On `git commit` (automatic)          |
| **Vitest**   | Runs unit tests                        | Manually: `npx vitest run` from root |

You don't need to configure any of these. Just code and commit.

## 5. Project structure

```
laurandy/
├── CLAUDE.md            # conventions + architecture (read this!)
├── docs/                # shared documentation
├── word-chain/          # word association game (built)
├── skeleton/            # alternating-letters puzzle (to build)
├── crossfire/           # compound word bridge puzzle (to build)
└── slide/               # sliding rows puzzle (to build)
```

Each game folder has:

- `README.md` — what the game is + how to run it
- `CLAUDE.md` — full build spec (for AI agents and devs)
