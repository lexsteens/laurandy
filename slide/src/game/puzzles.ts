// Each puzzle: rows are real words, offset=0 spells the hint word vertically.
// Center letter of a word at offset 0 = word[Math.floor(word.length / 2)]
// All row words here are 5-letter so center is always index 2.

export type Puzzle = {
  rows: string[];
  hint: string; // the intended target word, visible after give-up
};

export const puzzles: Puzzle[] = [
  // 4-row puzzles (4-letter vertical word)
  {
    // cargo[2]=r, chain[2]=a, print[2]=i, sandy[2]=n → RAIN
    rows: ['cargo', 'chain', 'print', 'sandy'],
    hint: 'rain',
  },
  {
    // magic[2]=g, color[2]=l, proof[2]=o, power[2]=w → GLOW
    rows: ['magic', 'color', 'proof', 'power'],
    hint: 'glow',
  },
  {
    // basin[2]=s, plane[2]=a, money[2]=n, order[2]=d → SAND
    rows: ['basin', 'plane', 'money', 'order'],
    hint: 'sand',
  },
  {
    // gifts[2]=f, being[2]=i, tardy[2]=r, creek[2]=e → FIRE
    rows: ['gifts', 'being', 'tardy', 'creek'],
    hint: 'fire',
  },
  {
    // amber[2]=b, fully[2]=l, touch[2]=u, steer[2]=e → BLUE
    rows: ['amber', 'fully', 'touch', 'steer'],
    hint: 'blue',
  },
  {
    // rogue[2]=g, phony[2]=o, atlas[2]=l, elder[2]=d → GOLD
    rows: ['rogue', 'phony', 'atlas', 'elder'],
    hint: 'gold',
  },

  // 5-row puzzles (5-letter vertical word)
  {
    // rapid[2]=p, belly[2]=l, blade[2]=a, bench[2]=n, water[2]=t → PLANT
    rows: ['rapid', 'belly', 'blade', 'bench', 'water'],
    hint: 'plant',
  },
  {
    // nasty[2]=s, enter[2]=t, stone[2]=o, arrow[2]=r, homer[2]=m → STORM
    rows: ['nasty', 'enter', 'stone', 'arrow', 'homer'],
    hint: 'storm',
  },
  {
    // lofty[2]=f, tulip[2]=l, bloom[2]=o, proof[2]=o, elder[2]=d → FLOOD
    rows: ['lofty', 'tulip', 'bloom', 'proof', 'elder'],
    hint: 'flood',
  },
  {
    // ember[2]=b, early[2]=r, slate[2]=a, novel[2]=v, speed[2]=e → BRAVE
    rows: ['ember', 'early', 'slate', 'novel', 'speed'],
    hint: 'brave',
  },
  {
    // vocal[2]=c, folly[2]=l, chore[2]=o, pecan[2]=c, poker[2]=k → CLOCK
    rows: ['vocal', 'folly', 'chore', 'pecan', 'poker'],
    hint: 'clock',
  },
  {
    // manor[2]=n, gripe[2]=i, magic[2]=g, other[2]=h, outer[2]=t → NIGHT
    rows: ['manor', 'gripe', 'magic', 'other', 'outer'],
    hint: 'night',
  },
  {
    // uncle[2]=c, ethos[2]=h, drive[2]=i, filmy[2]=l, belly[2]=l → CHILL
    rows: ['uncle', 'ethos', 'drive', 'filmy', 'belly'],
    hint: 'chill',
  },
  {
    // laser[2]=s, tower[2]=w, quilt[2]=i, hefty[2]=f, enter[2]=t → SWIFT
    rows: ['laser', 'tower', 'quilt', 'hefty', 'enter'],
    hint: 'swift',
  },
  {
    // decor[2]=c, march[2]=r, exist[2]=i, pasta[2]=s, empty[2]=p → CRISP
    rows: ['decor', 'march', 'exist', 'pasta', 'empty'],
    hint: 'crisp',
  },
  {
    // gifts[2]=f, virus[2]=r, ivory[2]=o, bison[2]=s, water[2]=t → FROST
    rows: ['gifts', 'virus', 'ivory', 'bison', 'water'],
    hint: 'frost',
  },
  {
    // posit[2]=s, rapid[2]=p, naive[2]=i, funny[2]=n, breed[2]=e → SPINE
    rows: ['posit', 'rapid', 'naive', 'funny', 'breed'],
    hint: 'spine',
  },
  {
    // video[2]=d, turbo[2]=r, snide[2]=i, tango[2]=n, maker[2]=k → DRINK
    rows: ['video', 'turbo', 'snide', 'tango', 'maker'],
    hint: 'drink',
  },
  {
    // voter[2]=t, scrap[2]=r, franc[2]=a, onion[2]=i, canoe[2]=n → TRAIN
    rows: ['voter', 'scrap', 'franc', 'onion', 'canoe'],
    hint: 'train',
  },
  {
    // logic[2]=g, color[2]=l, troop[2]=o, album[2]=b, steel[2]=e → GLOBE
    rows: ['logic', 'color', 'troop', 'album', 'steel'],
    hint: 'globe',
  },
];
