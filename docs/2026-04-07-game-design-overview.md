# Game Design Overview — Laurent's Initial Research

*Captured from Laurent's conversation with Claude, Apr 5–6 2026.*

## Context

Laurent and Andy are building small casual puzzle games together — for fun, for learning, and to eventually earn passive income. Laurent kicked off the project by researching game ideas, market competition, tech stack, and monetization with Claude.

---

## Decisions Made

- **Genre**: Casual puzzle / word games (not hyper-casual, not RPG)
- **Content strategy**: LLM-generated puzzles, batch-processed offline (not real-time in-app)
- **Platform strategy**: React web prototypes first to validate whether the mechanic is fun. Flutter mobile later to monetize if a game proves itself.
- **Backend (future)**: Supabase — has both a JS SDK (React) and Dart SDK (Flutter), so one backend serves both platforms
- **Prototype framing**: each React app is a stripped-down validation prototype — no auth, no monetization, no mobile-specific code, no streak tracking. The only job is to answer "is this fun?"
- **3 games selected for prototyping**: Skeleton, Crossfire, Slide

---

## Games Selected

| Game | Mechanic | Competition | Complexity |
|------|----------|-------------|------------|
| **Skeleton** | Every-other-letter is revealed (e.g. `_A_E_T`), guess the full word | Very low | Easy |
| **Crossfire** | Find the hidden word bridging two compound words (e.g. `FIRE ___ SHOP` → WORK) | Very low | Medium |
| **Slide** | Slide horizontal word-rows left/right to align a vertical word in the center column | Very low | Medium |

### Skeleton
- Proven letter-based mechanic, no dominant player in the space
- Simple to build and test
- Recommended as the first game to build (warmup)

### Crossfire
- Compound word bridge — 8 validated example puzzles provided
- Puzzle quality is critical — generate and validate 20–30 puzzles before building the UI
- Medium complexity

### Slide
- Most original concept, highest "wow" factor
- Laurent refined the design: no pre-designated key letter index, dictionary-based validation, multiple valid vertical words with medal scoring (🥉🥈🥇)
- Arrow buttons are the primary input, mouse drag secondary
- Most complex to build, but most satisfying interaction

---

## Games & Ideas Considered but Not Selected

| Idea | Why Not |
|------|---------|
| Hyper-casual / Arcade | Oversaturated market, UA costs killed solo dev profitability |
| RPG / Strategy | Huge content pipeline, long dev cycles, players expect constant updates |
| French Wordle clone | Already 5–6 clones (Motle by Larousse, LeMOT, etc.) |
| Word Association Chain | Built as first prototype (`Word Chain/`), but Laurent pivoted to letter-based mechanics for the next games |
| Daily Logic Grid | Solid concept, not selected |
| Trivia with confidence slider | Not selected |
| Riddle of the Day | Not selected |
| Odd One Out | Not selected |
| The Witness (metaphorical clues) | 100% LLM-generated, very original, but Laurent preferred simpler letter-guessing |
| Temperature / Semantle-like | Already exists in English |
| Ghost Letters | Low competition, interesting mechanic, but passed over |
| Unscramble Under Pressure | Unscramble genre is saturated |
| Impostor (find the fake word) | Good option, low competition, but not selected |

---

## Open Questions

- **Build order**: Skeleton first is recommended, but not locked in
- **Bilingual launch**: English + French discussed but not decided. The game engine is language-agnostic — only puzzle content changes. French market has almost no original-mechanic word games
- **Monetization model**: deferred to post-validation. Options on the table: freemium, daily free + premium history, hint system (ads/coins), subscription
- **Word Chain validation approach**: LLM judge vs word embeddings (Word2Vec/GloVe) vs curated graph — not resolved, deferred since Word Chain was deprioritized relative to the 3 new games

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Prototype frontend | React 18 + Vite | Fast iteration, no app store friction, web-first validation |
| Mobile (future) | Flutter | Native IAP, AdMob, push notifications, App Store discoverability |
| Backend (future) | Supabase | Works for both React and Flutter, free tier |
| Puzzle generation | Anthropic / OpenAI API | Offline batch generation, programmatic validation |
| Generation pipeline | Python script | Orchestrates LLM prompt → JSON → validator → puzzle store |

---

## Monetization Strategy (Future)

Deferred until a game is validated as fun. Key data points from Laurent's research:

- **Ad revenue**: casual word games earn ~$0.01–$0.05 per daily active user per day
  - 10,000 DAU = $100–$500/day = **$3k–$15k/month**
- **Subscriptions**: if 2–5% of users pay $3–$5/month, with 50k downloads → $500–$2,500/month recurring
- **IAP and AdMob work much better in native apps** — primary reason to go Flutter eventually

### Realistic income tiers
| Tier | Revenue | What it takes |
|------|---------|---------------|
| Flop (most common) | $0–$500 total | No marketing, buried in App Store |
| Modest hit | $500–$5k/month | Few thousand DAU, decent retention |
| Living wage | $5k–$15k/month | 50k–200k downloads, strong retention + marketing |
| Breakout | $15k–$100k+/month | Viral moment, press, or App Store feature |

Realistic timeline: 6–18 months to first meaningful revenue. Most solo devs release 2–3 games before one hits.

---

## Key Insights

- **Daily streak mechanics drive everything** — DAU is the #1 revenue lever
- **Web-first is proven for word games**: 82% of NYT Wordle traffic is web. 14.5M daily players, mostly in browsers
- **Shareable result cards are the primary viral growth loop** — screenshots on Twitter/WhatsApp drive organic discovery
- **Competitor weaknesses to exploit**: too many ads, poor English quality, buggy streaks, aggressive paywalls
- **LLM content generation is a structural advantage** — infinite puzzles at near-zero marginal cost, no content team needed
- **French market opportunity**: original mechanics (not clones) have almost no competition in French. 300M+ French speakers worldwide
- **Wordle was acquired by NYT for $1–9M** in Jan 2022 — the precedent for web-first puzzle games

---

## How to Proceed

1. **Build Skeleton first** — simplest, good warmup, fast to validate
2. **Then Crossfire** — generate 20–30 puzzles first, validate quality, then build UI
3. **Then Slide** — most complex but highest wow factor
4. **Test with real users** — does the mechanic feel fun? Is it shareable?
5. **Pick the winner** → consider bilingual (EN + FR) launch → build Flutter mobile version
6. **Marketing**: TikTok/Reddit presence before launch, daily puzzle mechanic, shareable result cards
