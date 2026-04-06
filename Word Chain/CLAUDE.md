# Word Chain — Project Guide

## What this is

A browser-based word association game. The player sees a **start** word and an **end** word and must connect them using 1–3 intermediate words, where each consecutive pair must be a recognised free association (e.g. FIRE → HEAT → SUMMER → COLD → ICE).

Shorter solutions are rewarded — if you find a 1-step path, that's better than using all 3 slots.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite (port 5173 in dev) |
| Backend | Node.js + Express (port **3002** in dev) |
| Monorepo | npm workspaces (`client/`, `server/`) |

## Running the app

```bash
npm run dev        # starts both server and client concurrently
npm run build      # builds React into client/dist
npm run start      # runs production server (serves built client)
```

## Project structure

```
/
├── package.json              # root workspace + concurrently dev script
├── CLAUDE.md
├── server/
│   ├── index.js              # Express API
│   ├── validatePuzzles.js    # offline validation script (run after editing data)
│   └── data/
│       ├── wordGraph.json    # adjacency list of word associations (~100 words)
│       └── puzzles.json      # 20 hand-crafted puzzles (start, end, solution)
└── client/
    ├── vite.config.js        # proxies /api → localhost:3002
    └── src/
        ├── App.jsx / App.css
        ├── index.css
        ├── main.jsx
        └── components/
            ├── GameBoard.jsx  # core game UI and logic
            └── GameBoard.css
```

## API endpoints

| Method | Path | Body | Returns |
|--------|------|------|---------|
| GET | `/api/puzzle/random` | — | `{ id, start, end }` |
| GET | `/api/puzzle/:id` | — | `{ id, start, end }` |
| POST | `/api/check-link` | `{ from, to }` | `{ valid: bool }` |
| POST | `/api/validate` | `{ chain: string[] }` | `{ valid: bool, links: [{from,to,valid}] }` |

`chain` must be 3–5 words (start + 1–3 middle + end). The solution is never sent to the client.

## Word graph

`server/data/wordGraph.json` is a plain adjacency list — each key maps to an array of associated words. The graph is **bidirectional by convention** (if A lists B, B should list A), but this is not enforced at runtime; only the listed direction is valid for a link.

After editing the graph or puzzles, always run:

```bash
node server/validatePuzzles.js
```

This checks every puzzle's stored solution against the graph and reports broken links.

## Puzzles

`server/data/puzzles.json` has the shape:

```json
{ "id": 1, "start": "fire", "end": "ice", "solution": ["heat", "summer", "cold"] }
```

`solution` is the canonical path used only by `validatePuzzles.js`. Players may find shorter or different valid paths — that is intentional and encouraged.

## Key design decisions

- **Variable chain length**: players may use 1, 2, or 3 middle words. Empty input slots are filtered out before submission. The win message shows how many steps were used.
- **Real-time blur validation**: leaving an input field triggers a `/api/check-link` call against its effective neighbours in the chain (skipping empty slots).
- **Server-side graph only**: the word graph is never sent to the client. All association checks go through the API.
- **No auth, no persistence**: stateless — every session gets a random puzzle on load.
