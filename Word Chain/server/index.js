const express = require('express');
const cors = require('cors');
const path = require('path');

const wordGraph = require('./data/wordGraph.json');
const puzzles = require('./data/puzzles.json');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Serve React build in production
app.use(express.static(path.join(__dirname, '../client/dist')));

function isLinked(wordA, wordB) {
  const a = wordA.toLowerCase().trim();
  const b = wordB.toLowerCase().trim();
  const neighbors = wordGraph[a];
  return Array.isArray(neighbors) && neighbors.includes(b);
}

// GET /api/puzzle/random
app.get('/api/puzzle/random', (req, res) => {
  const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
  res.json({ id: puzzle.id, start: puzzle.start, end: puzzle.end });
});

// GET /api/puzzle/:id
app.get('/api/puzzle/:id', (req, res) => {
  const puzzle = puzzles.find(p => p.id === parseInt(req.params.id));
  if (!puzzle) return res.status(404).json({ error: 'Puzzle not found' });
  res.json({ id: puzzle.id, start: puzzle.start, end: puzzle.end });
});

// POST /api/check-link
// Body: { from: string, to: string }
app.post('/api/check-link', (req, res) => {
  const { from, to } = req.body;
  if (!from || !to) return res.status(400).json({ error: 'Missing from or to' });
  res.json({ valid: isLinked(from, to) });
});

// POST /api/validate
// Body: { chain: [word0, word1, word2, word3, word4] }  (5 words total)
app.post('/api/validate', (req, res) => {
  const { chain } = req.body;
  if (!Array.isArray(chain) || chain.length < 3 || chain.length > 5) {
    return res.status(400).json({ error: 'Chain must contain between 3 and 5 words' });
  }

  const results = [];
  for (let i = 0; i < chain.length - 1; i++) {
    results.push({
      from: chain[i],
      to: chain[i + 1],
      valid: isLinked(chain[i], chain[i + 1]),
    });
  }

  const allValid = results.every(r => r.valid);
  res.json({ valid: allValid, links: results });
});

// Fallback to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
