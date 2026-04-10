"""
graph_utils.py

Shared utilities for loading and querying the word graph.
"""

import json
import os
import sys

import numpy as np


DEFAULT_GRAPH = "unversioned/wordGraph.json"


def load_graph(filepath=DEFAULT_GRAPH):
    """
    Load the word graph from a JSON file.
    Returns (graph, meta) where meta contains build-time configuration.
    Exits with an error if the file is not found.
    """
    if not os.path.exists(filepath):
        print(f"❌ Graph file not found: {filepath}")
        print("   Run build_wordgraph.py first.")
        sys.exit(1)

    print(f"📂 Loading graph from {filepath}...")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    meta = data.pop("_meta", {})
    graph = data
    print(f"   ✅ Loaded {len(graph):,} words")
    return graph, meta


def load_vectors_for_words(vectors_file, target_words, top_n):
    """
    Load vectors for specific words from a .vec file.
    Scans the full top_n valid words (same logic as build_wordgraph) to ensure
    the same vector is used as during graph construction.
    Returns (dict of {word: np.array}, dims).
    """
    found = {}
    loaded = 0
    with open(vectors_file, "r", encoding="utf-8") as f:
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
