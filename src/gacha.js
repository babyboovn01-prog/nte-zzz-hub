// Gacha math for the NTE + ZZZ hub.
// Sources (checked 8 Nov 2026):
// - NTE: community model, NO official Hotta/Perfect World rate sheet found.
//   S base 0.99% pulls 1-70, 19.59% flat pulls 71-89, hard pity 90,
//   no 50/50 on limited character banner, pity carries across limited boards.
//   See nte-data-v15.md §8. Mark rates as UNVERIFIED in UI copy.
// - ZZZ Agent channel: in-game Signal Search Details (HoYoverse).
//   Agent S 0.6% base / 1.6% consolidated, hard pity 90, 50/50.
//   Soft pity community-measured: ramp from pull 74, +6%/pull (GachaPity model;
//   sources differ 74 vs 75). See zzz-data-v33.md §4.
// - ZZZ W-Engine channel: in-game Signal Search Details (HoYoverse).
//   W-Engine S 1.0% base / 2.0% consolidated, hard pity 80, featured 75/25
//   (lose once and the next S W-Engine is guaranteed featured).
//   Soft pity: community estimates place its start at pull 64-65, but no
//   verified per-pull ramp step has been published, so zzzWengineRate() uses
//   the official 1.0% base rate until hard pity 80 and does NOT invent a
//   ramp. That slightly understates the true rate in the 64-79 window; the
//   worst case (160 pulls) is exact regardless of the ramp.

export const NTE = {
  game: 'Neverness to Everness',
  costPerPull: 160, // Annulith
  currency: 'Annulith',
  sBaseRate: 0.0099,
  softPityStart: 70, // soft pity from pull 71
  softPityRate: 0.1959, // flat pulls 71-89
  hardPity: 90,
  hasFiftyFifty: false,
  aGuaranteeEvery: 10,
};

export const ZZZ = {
  game: 'Zenless Zone Zero',
  costPerPull: 160, // Polychrome
  currency: 'Polychrome',
  sBaseRate: 0.006,
  softPityStart: 73, // ramp from pull 74
  softPityStep: 0.06, // +6 percentage points per pull (GachaPity model)
  hardPity: 90,
  hasFiftyFifty: true,
  aGuaranteeEvery: 10,
};

// ZZZ W-Engine channel (Signal Search, "W-Engine" banner).
export const ZZZ_WENGINE = {
  game: 'Zenless Zone Zero',
  channel: 'W-Engine',
  costPerPull: 160, // Polychrome
  currency: 'Polychrome',
  sBaseRate: 0.01, // official base rate
  sConsolidatedRate: 0.02, // official published consolidated rate
  softPityStart: 64, // community-estimated start (64-65); no verified ramp step
  hardPity: 80,
  featuredChance: 0.75, // 75/25: featured vs off-banner S W-Engine
  aGuaranteeEvery: 10,
};

export function ntePullRate(pity) {
  // pity = pulls since last S (0-based). Returns per-pull S probability.
  if (pity >= NTE.hardPity - 1) return 1;
  if (pity >= NTE.softPityStart) return NTE.softPityRate;
  return NTE.sBaseRate;
}

export function zzzPullRate(pity) {
  if (pity >= ZZZ.hardPity - 1) return 1;
  if (pity >= ZZZ.softPityStart) {
    // pull 74 -> 6.6%, 75 -> 12.6%, ... capped at 100% before hard pity
    return Math.min(1, 0.006 + (pity - ZZZ.softPityStart + 1) * ZZZ.softPityStep);
  }
  return ZZZ.sBaseRate;
}

export function zzzWengineRate(pity) {
  // Per-pull S W-Engine probability. Hard pity 80 guarantees an S W-Engine.
  // No ramp step is invented for the community-estimated soft-pity window
  // (pulls 64-79): the official 1.0% base rate is used throughout, which
  // slightly understates the true rate there. Worst case is unaffected.
  if (pity >= ZZZ_WENGINE.hardPity - 1) return 1;
  return ZZZ_WENGINE.sBaseRate;
}

// Single pull. Returns 'S' | 'A' | 'B'. A-guarantee handled by caller via pityA.
// pityA = pulls since last A-rank or higher. If 9 pulls in a row were below
// A-rank, the next pull is forced to A or higher (the advertised 10-pull
// A floor). In this model every non-S pull is an A-rank — B-ranks are not
// modelled, so the floor is satisfied by construction and the pityA check
// below keeps the guarantee explicit and testable. Callers must track pityA
// across pulls in a session and reset it on any S or A pull.
export function pullOnce(game, pityS, rand = Math.random, pityA = 0) {
  const rate = game === 'NTE' ? ntePullRate(pityS) : zzzPullRate(pityS);
  if (rand() < rate) return 'S';
  if (pityA >= 9) return 'A'; // A-guarantee floor: 10th pull cannot be below A
  return 'A';
}

export function worstCaseCost(game, target = 'featured') {
  // ZZZ featured W-Engine worst case: lose the 75/25 once = 160 pulls.
  if (game === 'ZZZ' && target === 'wengine') {
    return { pulls: 160, cost: 160 * ZZZ.costPerPull, currency: 'Polychrome' };
  }
  // ZZZ featured worst case: lose 50/50 once = 180 pulls. NTE: no 50/50 = 90.
  const pulls = game === 'ZZZ' && target === 'featured' ? 180 : 90;
  const cfg = game === 'NTE' ? NTE : ZZZ;
  return { pulls, cost: pulls * cfg.costPerPull, currency: cfg.currency };
}

// Map a decided pull rank to a concrete identity (real character / W-Engine).
// This changes NO probability: callers first decide the rank with pullOnce()
// (or the W-Engine rate), then map it here. Uniform pick inside a pool, using
// the passed rand() so the mapping is seedable/testable like the math.
// ctx: { featured: {name, rank, img, detail} | null, featuredWon: bool,
//        poolStdS: [identity], poolA: [identity], poolB: [identity] }
// identity: { name, rank, img (URL string or null), detail (e.g. "Fire · Anomaly") }
// Returns { name, rank, featured, offBanner, img, detail }.
export function mapPull(rank, ctx, rand = Math.random) {
  const pick = (pool) => pool[Math.floor(rand() * pool.length)];
  if (rank === 'S') {
    if (ctx.featuredWon && ctx.featured) {
      return { ...ctx.featured, featured: true, offBanner: false };
    }
    const hit = ctx.poolStdS && ctx.poolStdS.length ? pick(ctx.poolStdS) : null;
    if (hit) return { ...hit, featured: false, offBanner: true };
    if (ctx.featured) return { ...ctx.featured, featured: true, offBanner: false };
    return { name: 'S-rank pull', rank: 'S', featured: false, offBanner: false, img: null, detail: '' };
  }
  if (rank === 'B') {
    const pool = ctx.poolB && ctx.poolB.length ? ctx.poolB : ctx.poolA;
    const hit = pool && pool.length ? pick(pool) : null;
    if (hit) return { ...hit, featured: false, offBanner: false };
    return { name: 'B-rank pull', rank: 'B', featured: false, offBanner: false, img: null, detail: '' };
  }
  // 'A' (and any other non-S rank in this model).
  const hit = ctx.poolA && ctx.poolA.length ? pick(ctx.poolA) : null;
  if (hit) return { ...hit, featured: false, offBanner: false };
  return { name: 'A-rank pull', rank: 'A', featured: false, offBanner: false, img: null, detail: '' };
}
