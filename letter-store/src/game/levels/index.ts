import type { Level } from '../types';

interface LevelModule {
  name: string;
  level: Level;
}

// Auto-detect all level-*.ts files in this directory.
// Sorted by level id so ordering is stable regardless of file discovery order.
const modules = import.meta.glob<LevelModule>('./level-*.ts', { eager: true });

export const levels: Level[] = Object.values(modules)
  .map((m) => m.level)
  .sort((a, b) => a.id - b.id);
