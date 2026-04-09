#!/usr/bin/env python3
"""
check_words.py

Check if two words are related in the word graph.
If no link is found, shows the cosine similarity from the vectors file.

Usage:
  python check_words.py <word1> <word2>

Example:
  python check_words.py fire heat
"""

import json
import os
import sys

import numpy as np

INPUT_GRAPH = "unversioned/wordGraph.json"
VECTORS_FILE = "unversioned/wiki-news-300d-1M.vec"
TOP_N_WORDS = 20000


def load_vector(filepath, target_words, top_n):
    """Load vectors for specific words from the .vec file."""
    found = {}
    with open(filepath, "r", encoding="utf-8") as f:
        header = f.readline()
        _, dims = map(int, header.strip().split())
        for i, line in enumerate(f):
            if i >= top_n:
                break
            parts = line.rstrip().split(" ")
            word = parts[0].lower()
            if word in target_words:
                found[word] = np.array(parts[1:], dtype=np.float32)
            if len(found) == len(target_words):
                break
    return found, dims


def cosine_similarity(vec_a, vec_b):
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(vec_b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(vec_a, vec_b) / (norm_a * norm_b))


def main():
    if len(sys.argv) != 3:
        print("Usage: python check_words.py <word1> <word2>")
        sys.exit(1)

    word1 = sys.argv[1].lower()
    word2 = sys.argv[2].lower()

    if not os.path.exists(INPUT_GRAPH):
        print(f"❌ Graph file not found: {INPUT_GRAPH}")
        print("   Run build_wordgraph.py first.")
        sys.exit(1)

    with open(INPUT_GRAPH, "r", encoding="utf-8") as f:
        graph = json.load(f)

    for w in [word1, word2]:
        if w not in graph:
            print(f"❌ '{w}' not in graph")
            sys.exit(1)
        print(f"  {w.upper()}: {len(graph[w])} links")

    ab = word2 in graph.get(word1, [])
    ba = word1 in graph.get(word2, [])

    score_str = ""
    if os.path.exists(VECTORS_FILE):
        vectors, _ = load_vector(VECTORS_FILE, {word1, word2}, TOP_N_WORDS)
        if word1 in vectors and word2 in vectors:
            score = cosine_similarity(vectors[word1], vectors[word2])
            score_str = f"  (cosine similarity: {score:.4f})"

    if not ab and not ba:
        print(f"  {word1.upper()}  ✗  {word2.upper()}{score_str}")
        sys.exit(0)

    if ab:
        print(f"  {word1.upper()} → {word2.upper()}{score_str}")
    if ba:
        print(f"  {word2.upper()} → {word1.upper()}{score_str}")


if __name__ == "__main__":
    main()
