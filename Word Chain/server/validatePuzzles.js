const wordGraph = require('./data/wordGraph.json');
const puzzles = require('./data/puzzles.json');

function isLinked(a, b) {
  return Array.isArray(wordGraph[a]) && wordGraph[a].includes(b);
}

let allOk = true;

for (const puzzle of puzzles) {
  const chain = [puzzle.start, ...puzzle.solution, puzzle.end];
  const broken = [];

  for (let i = 0; i < chain.length - 1; i++) {
    const from = chain[i];
    const to = chain[i + 1];
    if (!isLinked(from, to)) {
      broken.push(`  ${from} → ${to}  ✗`);
    }
  }

  if (broken.length > 0) {
    allOk = false;
    console.log(`Puzzle ${puzzle.id}: ${puzzle.start} → ... → ${puzzle.end}`);
    console.log(`  Chain: ${chain.join(' → ')}`);
    broken.forEach(b => console.log(b));
    console.log();
  }
}

if (allOk) {
  console.log('All puzzles valid!');
}
