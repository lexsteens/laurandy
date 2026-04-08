// puzzles.ts — kept as a thin entry point for backwards compatibility.
// The actual puzzle data lives in src/game/levels/*.ts
// and is generated at runtime by src/game/level-generator.ts.
export { levels } from './levels/index';
export { generatePuzzle, getDayIndex } from './level-generator';
