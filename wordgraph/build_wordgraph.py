#!/usr/bin/env python3
"""
build_wordgraph.py

Generates wordgraph.json for the Word Chain game:
  - wordgraph.json   : precomputed valid word links for runtime validation

Use generate_puzzles.py to generate puzzles from the graph.

Usage:
  pip install numpy tqdm
  python build_wordgraph.py

Requirements:
  - wiki-news-300d-1M.vec (or any FastText/GloVe .vec file)
    Download from: https://fasttext.cc/docs/en/english-vectors.html
    File: wiki-news-300d-1M.vec.zip

  For French support, also download:
    cc.fr.300.vec from https://fasttext.cc/docs/en/crawl-vectors.html

Config below — adjust paths and thresholds to taste.
"""

import gzip
import json
import numpy as np
from tqdm import tqdm  # pip install tqdm
import os

# ─────────────────────────────────────────────
# CONFIG — adjust these
# ─────────────────────────────────────────────

VECTORS_FILE = "unversioned/wiki-news-300d-1M.vec"            # path to your .vec file
OUTPUT_GRAPH = "unversioned/wordGraph.json"       # full JSON (unversioned, for inspection)
OUTPUT_GRAPH_GZ = "unversioned/wordGraph.json.gz" # compressed — copy manually to word-chain/server/data/

TOP_N_WORDS = 20000          # how many words to load (most frequent first)
SIMILARITY_THRESHOLD = 0.40  # minimum cosine similarity to consider a link valid

# ─────────────────────────────────────────────
# STEP 1: LOAD VECTORS
# ─────────────────────────────────────────────

def load_vectors(filepath, top_n=20000):
    """
    Load the top N most frequent words from a .vec file.
    Words appear in frequency order in FastText/GloVe files.
    Returns: dict of {word: numpy_array}
    """
    print(f"\n📂 Loading vectors from {filepath}...")
    print(f"   (loading top {top_n:,} words)")

    vectors = {}
    skipped = 0

    with open(filepath, 'r', encoding='utf-8') as f:
        # First line is header: "vocab_size dimensions"
        header = f.readline()
        vocab_size, dims = map(int, header.strip().split())
        print(f"   File contains {vocab_size:,} words at {dims} dimensions")

        for i, line in enumerate(f):
            if len(vectors) >= top_n:
                break

            parts = line.rstrip().split(' ')
            word = parts[0].lower()

            # Skip non-alphabetic words (numbers, punctuation, etc.)
            if not word.isalpha():
                skipped += 1
                continue

            # Skip very short words (1-2 chars) — rarely useful for word chains
            if len(word) < 3:
                skipped += 1
                continue

            try:
                vector = np.array(parts[1:], dtype=np.float32)
                if len(vector) == dims:
                    vectors[word] = vector
            except ValueError:
                skipped += 1
                continue

    print(f"   ✅ Loaded {len(vectors):,} words (skipped {skipped:,} non-alphabetic)")
    return vectors


# ─────────────────────────────────────────────
# STEP 2: COSINE SIMILARITY
# ─────────────────────────────────────────────

def normalize_vectors(vectors):
    """
    Pre-normalize all vectors to unit length.
    After normalization, dot product == cosine similarity.
    Much faster for batch computation.
    """
    print("\n🔢 Normalizing vectors...")
    normalized = {}
    for word, vec in vectors.items():
        norm = np.linalg.norm(vec)
        if norm > 0:
            normalized[word] = vec / norm
    print(f"   ✅ Normalized {len(normalized):,} vectors")
    return normalized


def batch_similarities(target_vec, all_vecs_matrix, word_list):
    """
    Compute cosine similarity between one vector and all others efficiently.
    Uses matrix multiplication — much faster than looping.
    Returns: list of (word, score) sorted by score descending
    """
    scores = all_vecs_matrix @ target_vec  # matrix multiply
    # Get top indices (argsort descending)
    top_indices = np.argsort(-scores)
    return [(word_list[i], float(scores[i])) for i in top_indices]


# ─────────────────────────────────────────────
# STEP 3: BUILD WORD GRAPH
# ─────────────────────────────────────────────

def build_word_graph(normalized_vectors, threshold=0.40):
    """
    For each word, find all neighbors above the threshold.
    Returns: dict of {word: [neighbor1, neighbor2, ...]}

    Neighbors are stored as a list (no scores) to keep JSON small.
    The presence in the list means "valid link".
    """
    print(f"\n🕸️  Building word graph...")
    print(f"   {len(normalized_vectors):,} words @ threshold {threshold}")

    words = list(normalized_vectors.keys())
    # Stack all vectors into a matrix for fast batch computation
    matrix = np.stack([normalized_vectors[w] for w in words])  # shape: (vocab, dims)

    graph = {}
    rejected_count = 0

    for i, word in enumerate(tqdm(words, desc="   Processing")):
        target_vec = normalized_vectors[word]

        # Batch cosine similarity against all words
        all_scores = batch_similarities(target_vec, matrix, words)

        # Filter: skip self, apply threshold
        neighbors = []
        for other_word, score in all_scores:
            if other_word == word:
                continue
            if score < threshold:
                break  # sorted descending, so we can stop early
            neighbors.append(other_word)

        if neighbors:
            graph[word] = neighbors
        else:
            rejected_count += 1

    print(f"   ✅ Graph built: {len(graph):,} words with neighbors")
    print(f"   ⚠️  {rejected_count:,} words had no neighbors above threshold")

    # Make all links bidirectional
    for word, neighbors in list(graph.items()):
        for neighbor in neighbors:
            if neighbor in graph and word not in graph[neighbor]:
                graph[neighbor].append(word)

    # Stats
    neighbor_counts = [len(v) for v in graph.values()]
    print(f"   📊 Avg neighbors per word: {np.mean(neighbor_counts):.1f}")
    print(f"   📊 Min neighbors: {min(neighbor_counts)}, Max: {max(neighbor_counts)}")

    return graph


# ─────────────────────────────────────────────
# STEP 4: SAVE OUTPUT
# ─────────────────────────────────────────────

def save_graph(graph, filepath):
    """Save word graph to JSON, one word per line."""
    print(f"\n💾 Saving word graph to {filepath}...")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('{\n')
        items = list(graph.items())
        for i, (word, neighbors) in enumerate(items):
            comma = ',' if i < len(items) - 1 else ''
            neighbors_json = json.dumps(neighbors, separators=(',', ':'))
            f.write(f'"{word}":{neighbors_json}{comma}\n')
        f.write('}')

    size_mb = os.path.getsize(filepath) / 1024 / 1024
    print(f"   ✅ Saved {len(graph):,} words ({size_mb:.1f} MB)")


def save_graph_gz(graph, filepath):
    """Save word graph as gzipped JSON for versioning and runtime use."""
    print(f"\n💾 Saving compressed word graph to {filepath}...")
    data = json.dumps(graph, separators=(',', ':')).encode('utf-8')
    with gzip.open(filepath, 'wb', compresslevel=9) as f:
        f.write(data)

    size_mb = os.path.getsize(filepath) / 1024 / 1024
    print(f"   ✅ Saved {len(graph):,} words ({size_mb:.1f} MB compressed)")


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

def main():
    print("=" * 50)
    print("  Word Chain — Build Script")
    print("=" * 50)

    # Check file exists
    if not os.path.exists(VECTORS_FILE):
        print(f"\n❌ Vectors file not found: {VECTORS_FILE}")
        print("   Download from: https://fasttext.cc/docs/en/english-vectors.html")
        print("   File: wiki-news-300d-1M.vec.zip")
        return

    # Step 1: Load vectors
    vectors = load_vectors(VECTORS_FILE, top_n=TOP_N_WORDS)

    # Step 2: Normalize
    normalized = normalize_vectors(vectors)

    # Step 3: Build graph
    graph = build_word_graph(
        normalized,
        threshold=SIMILARITY_THRESHOLD
    )

    # Step 4: Save full JSON (for local inspection)
    save_graph(graph, OUTPUT_GRAPH)

    # Step 5: Save compressed version (versioned, used at runtime)
    save_graph_gz(graph, OUTPUT_GRAPH_GZ)

    print("\n✅ Done!")
    print(f"   {OUTPUT_GRAPH} → full JSON for local inspection")
    print(f"   {OUTPUT_GRAPH_GZ} → copy to word-chain/server/data/ to deploy")
    print(f"   Run generate_puzzles.py to generate puzzles from the graph")


if __name__ == "__main__":
    main()
