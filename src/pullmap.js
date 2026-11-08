// Pull-result identity mapping: turns a decided rank ('S'/'A'/'B') into a real
// character / W-Engine from the hub's own roster + item data. No probabilities
// live here — callers decide the rank with src/gacha.js first, then map it.
// Pools are DERIVED from the data files, never hand-listed from memory:
// - ZZZ standard-pool S agents: S-rank, version "1.0", released 2024-07-04
//   (launch day). That yields exactly 7 names; Zhu Yuan (1.0, released
//   2024-07-24) is excluded by the date, matching her limited status.
// - ZZZ A pool: every A-rank roster entry (13). Pyrois is rank "I", excluded.
// - NTE A pool: every A-rank roster entry (6).
// - W-Engine off-banner S pool: all S W-Engines except the featured one.
//   The data does not yet separate the standard-pool S W-Engine subset, so
//   the pool is labelled honestly in the UI note (see simulators).
// Featured A-ranks are TBD until 11 Nov 2026: A pulls draw from the standard
// A pools above. When the featured A-ranks are announced, add a
// FEATURED_A map here and pass it to mapPull via ctx.
import { mapPull } from './gacha.js';
import { NTE_ROSTER, ZZZ_ROSTER, ZZZ_AGENT_IMG, NTE_CHAR_IMG } from './characters.js';
import { ZZZ_WENGINES, ZZZ_WENGINE_IMG } from './items.js';

function zzzIdentity(row) {
  const [name, rank, attr, spec] = row;
  return { name, rank, img: ZZZ_AGENT_IMG[name] || null, detail: `${attr} · ${spec}` };
}
function nteIdentity(row) {
  const [name, rank, element, arc, role] = row;
  return { name, rank, img: NTE_CHAR_IMG[name] || null, detail: `${element} · ${arc} · ${role}` };
}
function wengineIdentity(row) {
  const [name, rank, spec, baseStat, baseVal] = row;
  return { name, rank, img: ZZZ_WENGINE_IMG[name] || null, detail: `${spec} · ${baseStat} ${baseVal}` };
}

// ZZZ standard-pool S agents (derived — see header comment).
export const ZZZ_STD_S_POOL = ZZZ_ROSTER
  .filter((r) => r[1] === 'S' && r[5] === '1.0' && r[6] === '2024-07-04')
  .map(zzzIdentity);
// ZZZ A-rank agents (13).
export const ZZZ_A_POOL = ZZZ_ROSTER.filter((r) => r[1] === 'A').map(zzzIdentity);
// NTE A-rank characters (6).
export const NTE_A_POOL = NTE_ROSTER.filter((r) => r[1] === 'A').map(nteIdentity);

function findRoster(roster, name) {
  return roster.find((r) => r[0] === name) || null;
}
export function nteFeaturedIdentity(name) {
  const row = findRoster(NTE_ROSTER, name);
  return row ? nteIdentity(row) : { name, rank: 'S', img: NTE_CHAR_IMG[name] || null, detail: '' };
}
export function zzzFeaturedIdentity(name) {
  const row = findRoster(ZZZ_ROSTER, name);
  return row ? zzzIdentity(row) : { name, rank: 'S', img: ZZZ_AGENT_IMG[name] || null, detail: '' };
}

// W-Engine pools for a given featured S W-Engine name.
export function wenginePools(featuredName) {
  const s = ZZZ_WENGINES.filter((w) => w[1] === 'S' && w[0] !== featuredName).map(wengineIdentity);
  return {
    poolStdS: s,
    poolA: ZZZ_WENGINES.filter((w) => w[1] === 'A').map(wengineIdentity),
    poolB: ZZZ_WENGINES.filter((w) => w[1] === 'B').map(wengineIdentity),
  };
}

// Map one ZZZ Agent-channel pull. featuredName = banner featured S agent.
export function mapAgentPull(rank, featuredWon, featuredName, rand = Math.random) {
  return mapPull(rank, {
    featured: zzzFeaturedIdentity(featuredName),
    featuredWon,
    poolStdS: ZZZ_STD_S_POOL,
    poolA: ZZZ_A_POOL,
    poolB: [],
  }, rand);
}

// Map one ZZZ W-Engine-channel pull. featuredName = banner featured S W-Engine.
export function mapWenginePull(rank, featuredWon, featuredName, rand = Math.random) {
  const pools = wenginePools(featuredName);
  return mapPull(rank, {
    featured: wengineIdentity(
      ZZZ_WENGINES.find((w) => w[0] === featuredName)
      || [featuredName, 'S', '', '', 0],
    ),
    featuredWon,
    poolStdS: pools.poolStdS,
    poolA: pools.poolA,
    poolB: pools.poolB,
  }, rand);
}

// Map one NTE pull (no 50/50 — any S is the featured character).
export function mapNtePull(rank, featuredName, rand = Math.random) {
  return mapPull(rank, {
    featured: nteFeaturedIdentity(featuredName),
    featuredWon: true,
    poolStdS: [],
    poolA: NTE_A_POOL,
    poolB: [],
  }, rand);
}
