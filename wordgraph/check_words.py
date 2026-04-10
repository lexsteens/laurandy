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

from graph_utils import load_graph, load_vectors_for_words, cosine_similarity

INPUT_GRAPH = "unversioned/wordGraph.json"
VECTORS_DIR = "unversioned"


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

    graph, meta = load_graph(INPUT_GRAPH)

    vectors_file = os.path.join(VECTORS_DIR, meta.get("vectors_file", ""))
    top_n = meta.get("top_n_words", 20000)

    for w in words:
        if w not in graph:
            print(f"❌ '{w}' not in graph")
            sys.exit(1)
        neighbors = graph[w]
        print(f"  {w.upper()} ({len(neighbors)}): {', '.join(neighbors)}")

    vectors = {}
    if vectors_file and os.path.exists(vectors_file):
        vectors, _ = load_vectors_for_words(vectors_file, set(words), top_n)
    elif not vectors_file:
        print("⚠️  No vectors_file in graph metadata — cosine similarity unavailable")

    print()
    check_chain(words, graph, vectors)
    check_chain(list(reversed(words)), graph, vectors)


if __name__ == "__main__":
    main()
