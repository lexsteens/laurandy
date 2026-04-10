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
import shutil

# ─────────────────────────────────────────────
# CONFIG — adjust these
# ─────────────────────────────────────────────

VECTORS_FILE = "unversioned/wiki-news-300d-1M.vec"              # path to your .vec file
MANUAL_GRAPH = "wordgraph-manual.json"                # hand-curated links, merged after build
OUTPUT_GRAPH = "unversioned/wordGraph.json"           # full JSON (unversioned, for inspection)
OUTPUT_GRAPH_GZ = "unversioned/wordGraph.json.gz"     # compressed JSON
DEPLOY_GRAPH_GZ = "../word-chain/server/data/wordGraph.json.gz"  # deployed copy

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


# ─────────────────────────────────────────────
# STEP 3: BUILD WORD GRAPH
# ─────────────────────────────────────────────

CHUNK_SIZE = 1000  # rows per chunk — trades memory for speed (~80MB/chunk at 20k words)

def build_word_graph(normalized_vectors, threshold=0.40):
    """
    Build the word graph using chunked matrix multiplication.

    Computes the full similarity matrix in row-chunks (chunk @ matrix.T),
    avoiding a Python loop per word. Cosine similarity is symmetric, so both
    directions are captured in one pass — no bidirectionality fix-up needed.

    Returns: dict of {word: [neighbor1, neighbor2, ...]}
    """
    print(f"\n🕸️  Building word graph...")
    print(f"   {len(normalized_vectors):,} words @ threshold {threshold}")

    words = list(normalized_vectors.keys())
    n = len(words)
    matrix = np.stack([normalized_vectors[w] for w in words])  # (n, dims)

    graph = {w: [] for w in words}

    for start in tqdm(range(0, n, CHUNK_SIZE), desc="   Processing"):
        end = min(start + CHUNK_SIZE, n)
        scores = matrix[start:end] @ matrix.T  # (chunk, n)

        for i, row in enumerate(scores):
            word_idx = start + i
            neighbor_indices = np.where(row >= threshold)[0]
            graph[words[word_idx]] = [
                words[j] for j in neighbor_indices if j != word_idx
            ]

    rejected = sum(1 for ns in graph.values() if not ns)
    graph = {w: ns for w, ns in graph.items() if ns}

    print(f"   ✅ Graph built: {len(graph):,} words with neighbors")
    print(f"   ⚠️  {rejected:,} words had no neighbors above threshold")

    neighbor_counts = [len(v) for v in graph.values()]
    print(f"   📊 Avg neighbors per word: {np.mean(neighbor_counts):.1f}")
    print(f"   📊 Min neighbors: {min(neighbor_counts)}, Max: {max(neighbor_counts)}")

    return graph


# ─────────────────────────────────────────────
# STEP 4: SAVE OUTPUT
# ─────────────────────────────────────────────

def save_graph(graph, meta, filepath):
    """Save word graph to JSON, one word per line, with _meta as the first entry."""
    print(f"\n💾 Saving word graph to {filepath}...")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('{\n')
        meta_json = json.dumps(meta, separators=(',', ':'))
        f.write(f'"_meta":{meta_json},\n')
        items = list(graph.items())
        for i, (word, neighbors) in enumerate(items):
            comma = ',' if i < len(items) - 1 else ''
            neighbors_json = json.dumps(neighbors, separators=(',', ':'))
            f.write(f'"{word}":{neighbors_json}{comma}\n')
        f.write('}')
    size_mb = os.path.getsize(filepath) / 1024 / 1024
    print(f"   ✅ Saved {len(graph):,} words ({size_mb:.1f} MB)")


def save_graph_gz(graph, meta, filepath):
    """Save word graph as gzipped JSON for word-chain runtime use."""
    print(f"\n💾 Saving compressed word graph to {filepath}...")
    data = json.dumps({"_meta": meta, **graph}, separators=(',', ':')).encode('utf-8')
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

    # Merge manual overrides
    if os.path.exists(MANUAL_GRAPH):
        print(f"\n📖 Merging manual links from {MANUAL_GRAPH}...")
        with open(MANUAL_GRAPH, "r", encoding="utf-8") as f:
            manual = json.load(f)
        added = 0
        for word, neighbors in manual.items():
            word = word.lower()
            if isinstance(neighbors, str):
                print(f"   ❌ '{word}' value must be a list, not a string. Fix {MANUAL_GRAPH}.")
                return
            for neighbor in neighbors:
                neighbor = neighbor.lower()
                graph.setdefault(word, [])
                if neighbor not in graph[word]:
                    graph[word].append(neighbor)
                    added += 1
                graph.setdefault(neighbor, [])
                if word not in graph[neighbor]:
                    graph[neighbor].append(word)
        print(f"   ✅ Added {added:,} manual links")

    meta = {
        "vectors_file": os.path.basename(VECTORS_FILE),
        "top_n_words": TOP_N_WORDS,
        "similarity_threshold": SIMILARITY_THRESHOLD,
        "word_count": len(graph),
    }

    # Step 4: Save full JSON (for local inspection)
    save_graph(graph, meta, OUTPUT_GRAPH)

    # Step 5: Save compressed version (versioned, used at runtime)
    save_graph_gz(graph, meta, OUTPUT_GRAPH_GZ)

    print("\n✅ Done!")
    shutil.copy2(OUTPUT_GRAPH_GZ, DEPLOY_GRAPH_GZ)
    print(f"   ✅ Copied to {DEPLOY_GRAPH_GZ}")

    print(f"   {OUTPUT_GRAPH} → full JSON for local inspection")
    print(f"   {OUTPUT_GRAPH_GZ} → {DEPLOY_GRAPH_GZ}")
    print(f"   Run generate_puzzles.py to generate puzzles from the graph")


if __name__ == "__main__":
    main()
