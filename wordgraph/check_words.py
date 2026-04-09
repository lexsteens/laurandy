#!/usr/bin/env python3
"""
check_words.py

Check if a chain of words is linked in the word graph.
Shows cosine similarity for each consecutive pair, forward and reverse.

Usage:
  python check_words.py <word1> <word2> [word3 ...]

Example:
  python check_words.py fire heat cold ice
"""

import os
import sys

import numpy as np

from graph_io import load_graph

INPUT_GRAPH = "unversioned/wordGraph.json"
VECTORS_FILE = "unversioned/wiki-news-300d-1M.vec"
TOP_N_WORDS = 20000


def load_vector(filepath, target_words, top_n):
    """Load vectors for specific words from the .vec file.
    Scans the full top_n valid words (same logic as build_wordgraph) to ensure
    the same vector is used as during graph construction."""
    found = {}
    loaded = 0
    with open(filepath, "r", encoding="utf-8") as f:
        header = f.readline()
        _, dims = map(int, header.strip().split())
        for line in f:
            if loaded >= top_n:
                break
            parts = line.rstrip().split(" ")
            word = parts[0].lower()
            if not word.isalpha() or len(word) < 3:
                continue
            loaded += 1
            if word in target_words:
                found[word] = np.array(parts[1:], dtype=np.float32)
    return found, dims


def cosine_similarity(vec_a, vec_b):
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(vec_b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(vec_a, vec_b) / (norm_a * norm_b))


def check_chain(words, graph, vectors):
    """Print each link in the chain with its cosine similarity."""
    parts = [words[0].upper()]
    for a, b in zip(words, words[1:]):
        linked = b in graph.get(a, []) or a in graph.get(b, [])
        arrow = "→" if linked else "✗"
        score_str = ""
        if a in vectors and b in vectors:
            score = cosine_similarity(vectors[a], vectors[b])
            score_str = f" ({score:.4f})"
        parts.append(f" {arrow}{score_str} {b.upper()}")
    print("".join(parts))


def main():
    if len(sys.argv) < 3:
        print("Usage: python check_words.py <word1> <word2> [word3 ...]")
        sys.exit(1)

    words = [w.lower() for w in sys.argv[1:]]

    graph = load_graph(INPUT_GRAPH)

    for w in words:
        if w not in graph:
            print(f"❌ '{w}' not in graph")
            sys.exit(1)
        print(f"  {w.upper()}: {len(graph[w])} links")

    vectors = {}
    if os.path.exists(VECTORS_FILE):
        vectors, _ = load_vector(VECTORS_FILE, set(words), TOP_N_WORDS)

    print()
    check_chain(words, graph, vectors)
    check_chain(list(reversed(words)), graph, vectors)


if __name__ == "__main__":
    main()
