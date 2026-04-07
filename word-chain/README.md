# Word Chain

Connect two words through a chain of free associations.

**Example**: FIRE → HEAT → SUMMER → COLD → ICE

## Status

Built by Laurent as the first prototype. Uses React + Express with a server-side word graph for validation.

## Running

```bash
npm install
npm run dev     # starts both server (port 3002) and client (port 5173)
```

## Notes

- This was built before the architecture conventions were established, so it uses plain JS rather than TypeScript and doesn't follow the `src/game/` + `src/ui/` separation yet.
- See `CLAUDE.md` for full technical details.
