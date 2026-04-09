#!/usr/bin/env python3
"""
generate_puzzles.py

Generates puzzles from an already-built wordgraph.json.
Run build_wordgraph.py first to produce the graph.

Usage:
  python generate_puzzles.py
"""

import json
import os

from graph_io import load_graph

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────

INPUT_GRAPH = "unversioned/wordGraph.json"
OUTPUT_PUZZLES = "unversioned/puzzles.json"

PUZZLE_CHAIN_LENGTH = 4  # steps between start and end (exclusive)

PUZZLE_SEEDS = [
    ("fire", "ice"),
    ("day", "night"),
    ("sun", "moon"),
    ("cat", "dog"),
    ("hot", "cold"),
    ("sea", "mountain"),
    ("summer", "winter"),
    ("light", "dark"),
    ("city", "forest"),
    ("fast", "slow"),
    ("love", "war"),
    ("water", "fire"),
    ("earth", "sky"),
    ("dream", "reality"),
    ("old", "new"),
    ("king", "peasant"),
    ("sweet", "bitter"),
    ("loud", "quiet"),
    ("wild", "tame"),
    ("rich", "poor"),
]


# ─────────────────────────────────────────────
# PUZZLE GENERATION
# ─────────────────────────────────────────────

def find_paths(start, end, graph, chain_length=4, max_paths=5):
    """
    BFS to find valid paths from start to end of exactly chain_length steps.
    Returns: list of paths, each path is a list of words [start, ..., end]
    """
    if start not in graph or end not in graph:
        return []

    target_depth = chain_length + 1  # number of edges
    paths = []

    queue = [(start, [start])]

    while queue and len(paths) < max_paths:
        current, path = queue.pop(0)
        depth = len(path) - 1

        if depth == target_depth:
            if current == end:
                paths.append(path)
            continue

        if depth >= target_depth:
            continue

        for neighbor in graph.get(current, []):
            if neighbor in path:
                continue
            if depth == target_depth - 1 and neighbor != end:
                continue
            queue.append((neighbor, path + [neighbor]))

    return paths


def generate_puzzles(seeds, graph, chain_length=4):
    print(f"\n🎮 Generating puzzles (chain length: {chain_length})...")

    puzzles = []
    failed = []

    for start, end in seeds:
        if start not in graph:
            print(f"   ⚠️  '{start}' not in graph — skipping")
            failed.append((start, end))
            continue
        if end not in graph:
            print(f"   ⚠️  '{end}' not in graph — skipping")
            failed.append((start, end))
            continue

        paths = find_paths(start, end, graph, chain_length=chain_length, max_paths=5)

        if paths:
            puzzles.append({
                "id": len(puzzles) + 1,
                "start": start.upper(),
                "end": end.upper(),
                "steps": chain_length,
                "example_paths": [[w.upper() for w in path] for path in paths],
                "num_paths_found": len(paths),
            })
        else:
            failed.append((start, end))
            print(f"   ❌ No {chain_length}-step path: {start.upper()} → {end.upper()}")

    print(f"\n   ✅ Generated {len(puzzles)} puzzles")
    if failed:
        print(f"   ❌ Failed for {len(failed)} pairs: {failed}")

    return puzzles


def save_puzzles(puzzles, filepath):
    print(f"\n💾 Saving puzzles to {filepath}...")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(puzzles, f, indent=2)

    size_kb = os.path.getsize(filepath) / 1024
    print(f"   ✅ Saved {len(puzzles)} puzzles ({size_kb:.1f} KB)")


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

def main():
    print("=" * 50)
    print("  Word Chain — Puzzle Generator")
    print("=" * 50)

    graph = load_graph(INPUT_GRAPH)

    puzzles = generate_puzzles(PUZZLE_SEEDS, graph, chain_length=PUZZLE_CHAIN_LENGTH)

    save_puzzles(puzzles, OUTPUT_PUZZLES)

    print(f"\n✅ Done! → {OUTPUT_PUZZLES}")


if __name__ == "__main__":
    main()
