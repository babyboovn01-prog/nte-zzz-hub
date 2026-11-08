// Gacha math for the NTE + ZZZ hub.
// Sources (checked 8 Nov 2026):
// - NTE: community model, NO official Hotta/Perfect World rate sheet found.
//   S base 0.99% pulls 1-70, 19.59% flat pulls 71-89, hard pity 90,
//   no 50/50 on limited character banner, pity carries across limited boards.
//   See nte-data-v15.md §8. Mark rates as UNVERIFIED in UI copy.
// - ZZZ: in-game Signal Search Details (HoYoverse).
//   Agent S 0.6% base / 1.6% consolidated, hard pity 90, 50/50.
//   Soft pity community-measured: ramp from pull 74, +6%/pull (sources differ 74 vs 75).
//   See zzz-data-v33.md §4.

export const NTE = {
  game: 'Neverness to Everness',
  costPerPull: 160, // Annulith
  currency: 'Annulith',
  sBaseRate: 0.0099,
  softPityStart: 70, // after 70 pulls without S
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

// Single pull. Returns 'S' | 'A' | 'B'. A-guarantee handled by caller via pityA.
export function pullOnce(game, pityS, rand = Math.random) {
  const rate = game === 'NTE' ? ntePullRate(pityS) : zzzPullRate(pityS);
  return rand() < rate ? 'S' : 'A';
}

export function worstCaseCost(game, target = 'featured') {
  // ZZZ featured worst case: lose 50/50 once = 180 pulls. NTE: no 50/50 = 90.
  const pulls = game === 'ZZZ' && target === 'featured' ? 180 : 90;
  const cfg = game === 'NTE' ? NTE : ZZZ;
  return { pulls, cost: pulls * cfg.costPerPull, currency: cfg.currency };
}
