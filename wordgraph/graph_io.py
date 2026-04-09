"""
graph_io.py

Shared I/O utilities for the word graph.
"""

import json
import os
import sys


DEFAULT_GRAPH = "unversioned/wordGraph.json"


def load_graph(filepath=DEFAULT_GRAPH):
    """Load the word graph from a JSON file. Exits with an error if not found."""
    if not os.path.exists(filepath):
        print(f"❌ Graph file not found: {filepath}")
        print("   Run build_wordgraph.py first.")
        sys.exit(1)

    print(f"📂 Loading graph from {filepath}...")
    with open(filepath, "r", encoding="utf-8") as f:
        graph = json.load(f)
    print(f"   ✅ Loaded {len(graph):,} words")
    return graph
