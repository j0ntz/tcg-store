#!/usr/bin/env node
// Seed data/catalog.json from the Pokémon TCG API (https://api.pokemontcg.io/v2, keyless).
//
// Pulls the six newest English sets plus 151, writes every card with condition variants
// (price and stock), and adds the hand-written sealed products below. The output is
// committed, so builds never call the API. Stock counts and arrival dates come from a
// seeded PRNG keyed on the card id, so a re-run on the same API data is a no-op diff.
//
// Usage: node scripts/seed-catalog.mjs [--out data/catalog.json]

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const API = "https://api.pokemontcg.io/v2";
const NEWEST_SET_COUNT = 6;
const EXTRA_SET_IDS = ["sv3pt5"]; // 151
// Sub-collections (the 30-card "Classic Collection" inside 30th Celebration) are not
// sets a shopper browses on their own, so anything under this size is skipped.
const MIN_SET_SIZE = 60;
// Ordered by id: ordering by number ties on reprints and the API pages unstably over ties.
const PAGE_SIZE = 100;
const MAX_ATTEMPTS = 10;
// The anchor for "added to the store" dates. Fixed so the catalog is reproducible.
const ANCHOR_DATE = Date.UTC(2026, 9, 17);
const DAY_MS = 86_400_000;

const CONDITIONS = [
  { code: "NM", name: "Near Mint", factor: 1 },
  { code: "LP", name: "Lightly Played", factor: 0.85 },
  { code: "MP", name: "Moderately Played", factor: 0.7 },
  { code: "HP", name: "Heavily Played", factor: 0.55 },
];

// Fallback Near Mint prices by rarity when the API has no TCGplayer market price.
const RARITY_FLOOR = {
  Common: 0.25,
  Uncommon: 0.35,
  Rare: 0.75,
  "Rare Holo": 1.5,
  "Double Rare": 2.5,
  "Ultra Rare": 6,
  "Illustration Rare": 12,
  "Special Illustration Rare": 45,
  "Hyper Rare": 18,
  "Mega Hyper Rare": 40,
  "Pikachu Rare": 15,
  "Futuristic Rare": 20,
  "Mega Attack Rare": 25,
  "ACE SPEC Rare": 4,
  "Shiny Rare": 8,
  "Shiny Ultra Rare": 25,
  "Mega Rare": 30,
  "Black White Rare": 80,
  Promo: 3,
};

const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const outPath = resolve(outIndex >= 0 ? args[outIndex + 1] : "data/catalog.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(path) {
  let lastError = "";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${API}${path}`, {
        signal: AbortSignal.timeout(60_000),
        headers: { accept: "application/json" },
      });
      if (res.ok) return await res.json();
      lastError = `HTTP ${res.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    const wait = Math.min(30_000, 2_000 * attempt);
    console.error(`  retry ${attempt}/${MAX_ATTEMPTS} after ${lastError} (${path}) in ${wait}ms`);
    await sleep(wait);
  }
  throw new Error(`Pokémon TCG API failed for ${path}: ${lastError}`);
}

// mulberry32: a small deterministic PRNG so stock and arrival dates are reproducible.
function hashString(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pickWeighted(random, weights) {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = random() * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll < 0) return i;
  }
  return weights.length - 1;
}

function slugify(text) {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function money(value) {
  return Math.round(value * 100) / 100;
}

function marketPrice(card) {
  const prices = card.tcgplayer?.prices;
  if (prices == null) return null;
  // Prefer the printing a shopper means by default; fall back to whatever has a market value.
  const order = ["normal", "holofoil", "reverseHolofoil", "1stEditionHolofoil", "1stEditionNormal", "unlimitedHolofoil"];
  for (const key of [...order, ...Object.keys(prices)]) {
    const entry = prices[key];
    if (entry != null && typeof entry.market === "number" && entry.market > 0) return entry.market;
  }
  return null;
}

function buildVariants(card, nearMint) {
  const random = rng(hashString(`stock:${card.id}`));
  const wholeCardSoldOut = random() < 0.05;
  return CONDITIONS.map((condition) => {
    const price = money(Math.max(0.25, nearMint * condition.factor));
    let quantity = 0;
    if (!wholeCardSoldOut) {
      if (condition.code === "NM") quantity = pickWeighted(random, [14, 20, 20, 16, 10, 10, 6, 4]);
      if (condition.code === "LP") quantity = pickWeighted(random, [50, 25, 15, 10]);
      if (condition.code === "MP") quantity = pickWeighted(random, [72, 18, 10]);
      if (condition.code === "HP") quantity = pickWeighted(random, [86, 14]);
    }
    return { condition: condition.code, price, quantity };
  });
}

function addedAt(cardId) {
  const random = rng(hashString(`added:${cardId}`));
  const daysAgo = Math.floor(random() * 45);
  return new Date(ANCHOR_DATE - daysAgo * DAY_MS).toISOString().slice(0, 10);
}

// The API mixes display names ("Ultra Rare") with raw enum values ("MEGA_ATTACK_RARE").
function prettyRarity(rarity) {
  if (rarity == null) return "Unlisted";
  if (!/^[A-Z_]+$/.test(rarity)) return rarity;
  return rarity.toLowerCase().split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function normalizeCard(raw, set) {
  const market = marketPrice(raw);
  const nearMint = market ?? RARITY_FLOOR[prettyRarity(raw.rarity)] ?? 1;
  const number = String(raw.number);
  return {
    id: raw.id,
    slug: `${slugify(raw.name)}-${set.id}-${slugify(number)}`,
    name: raw.name,
    setId: set.id,
    number,
    printedTotal: set.printedTotal,
    rarity: prettyRarity(raw.rarity),
    supertype: raw.supertype,
    subtypes: raw.subtypes ?? [],
    types: raw.types ?? [],
    hp: raw.hp ?? null,
    artist: raw.artist ?? null,
    imageSmall: raw.images.small,
    imageLarge: raw.images.large,
    marketPrice: market == null ? null : money(market),
    marketUpdatedAt: raw.tcgplayer?.updatedAt?.replaceAll("/", "-") ?? null,
    addedAt: addedAt(raw.id),
    variants: buildVariants(raw, nearMint),
  };
}

async function fetchSets() {
  const { data } = await getJson(
    "/sets?orderBy=-releaseDate&pageSize=40&select=id,name,series,releaseDate,total,printedTotal,images",
  );
  const newest = data.filter((s) => s.total >= MIN_SET_SIZE && !EXTRA_SET_IDS.includes(s.id)).slice(0, NEWEST_SET_COUNT);
  const extras = [];
  for (const id of EXTRA_SET_IDS) {
    const found = data.find((s) => s.id === id);
    extras.push(found ?? (await getJson(`/sets/${id}`)).data);
  }
  return [...newest, ...extras].map((s) => ({
    id: s.id,
    slug: slugify(s.name),
    name: s.name,
    series: s.series,
    releaseDate: s.releaseDate.replaceAll("/", "-"),
    total: s.total,
    printedTotal: s.printedTotal ?? s.total,
    logo: s.images.logo,
    symbol: s.images.symbol,
  }));
}

async function fetchCards(set) {
  const select = "id,name,number,rarity,supertype,subtypes,types,hp,artist,images,tcgplayer";
  const cards = [];
  for (let page = 1; ; page++) {
    const body = await getJson(`/cards?q=set.id:${set.id}&page=${page}&pageSize=${PAGE_SIZE}&orderBy=id&select=${select}`);
    cards.push(...body.data);
    console.error(`  ${set.name}: ${cards.length}/${body.totalCount}`);
    if (cards.length >= body.totalCount || body.data.length === 0) break;
  }
  // Paging a flaky API by number can hand back the same card twice; keep the first copy.
  const seen = new Set();
  return cards.filter((c) => {
    if (seen.has(c.id) || c.images?.small == null || c.images?.large == null) return false;
    seen.add(c.id);
    return true;
  });
}

// Sealed products are hand-written. setId must be one of the seeded sets; the UI shows the set
// logo as the product image because the API has no sealed product photography.
function sealedProducts(sets) {
  const bySlug = new Map(sets.map((s) => [s.slug, s]));
  const need = (slug) => {
    const set = bySlug.get(slug);
    if (set == null) throw new Error(`sealed product references unknown set ${slug}`);
    return set;
  };
  const packs = (set, count) => `${count} ${set.name} booster packs`;
  const etbContents = (set, promo) => [
    packs(set, 9),
    `1 full-art foil promo card featuring ${promo}`,
    "65 card sleeves",
    "45 Pokémon TCG Energy cards",
    "A player's guide to the set",
    "6 damage-counter dice and 1 coin-flip die",
    "2 acrylic condition markers",
    "A collector's box with 4 dividers",
  ];
  const bundleContents = (set) => [packs(set, 6)];
  const boxContents = (set) => [packs(set, 36), "Each pack holds 10 cards"];
  const packContents = (set) => [`1 ${set.name} booster pack`, "10 cards per pack"];
  const items = [
    ["pitch-black", "etb", "Elite Trainer Box", 54.99, 11, 2, (s) => etbContents(s, "Zoroark")],
    ["pitch-black", "bundle", "Booster Bundle", 29.99, 24, 4, bundleContents],
    ["pitch-black", "box", "Booster Box", 164.99, 3, 1, boxContents],
    ["pitch-black", "pack", "Booster Pack", 4.99, 80, 10, packContents],
    ["chaos-rising", "etb", "Elite Trainer Box", 52.99, 0, 2, (s) => etbContents(s, "Mega Gengar")],
    ["chaos-rising", "bundle", "Booster Bundle", 27.99, 18, 4, bundleContents],
    ["chaos-rising", "box", "Booster Box", 159.99, 2, 1, boxContents],
    ["perfect-order", "etb", "Elite Trainer Box", 49.99, 6, 2, (s) => etbContents(s, "Mega Metagross")],
    ["perfect-order", "bundle", "Booster Bundle", 26.99, 14, 4, bundleContents],
    ["perfect-order", "pack", "Booster Pack", 4.49, 60, 10, packContents],
    ["ascended-heroes", "etb", "Elite Trainer Box", 59.99, 4, 2, (s) => etbContents(s, "Mega Lucario")],
    ["ascended-heroes", "bundle", "Booster Bundle", 34.99, 9, 4, bundleContents],
    ["phantasmal-flames", "etb", "Elite Trainer Box", 47.99, 7, 2, (s) => etbContents(s, "Mega Charizard X")],
    ["phantasmal-flames", "box", "Booster Box", 149.99, 1, 1, boxContents],
    ["30th-celebration", "etb", "Elite Trainer Box", 64.99, 5, 2, (s) => etbContents(s, "Pikachu")],
    ["30th-celebration", "pack", "Booster Pack", 5.49, 40, 10, packContents],
    ["151", "etb", "Elite Trainer Box", 89.99, 3, 2, (s) => etbContents(s, "Snorlax")],
    ["151", "bundle", "Booster Bundle", 49.99, 8, 4, bundleContents],
  ];
  return items.map(([setSlug, kind, label, price, quantity, purchaseLimit, contents]) => {
    const set = need(setSlug);
    const name = `${set.name} ${label}`;
    return {
      id: `sealed-${set.id}-${kind}`,
      slug: `${set.slug}-${slugify(label)}`,
      name,
      setId: set.id,
      kind,
      price,
      quantity,
      purchaseLimit,
      contents: contents(set),
      releaseDate: set.releaseDate,
      addedAt: addedAt(`sealed-${set.id}-${kind}`),
    };
  });
}

async function main() {
  console.error("Fetching sets…");
  const sets = await fetchSets();
  console.error(sets.map((s) => `  ${s.id} ${s.name} (${s.releaseDate})`).join("\n"));
  const cards = [];
  for (const set of sets) {
    console.error(`Fetching cards for ${set.name}…`);
    const raw = await fetchCards(set);
    cards.push(...raw.map((c) => normalizeCard(c, set)));
  }
  // Two different cards can share a name and printed number (reprints inside one set), so a
  // colliding slug gets the API id appended to stay unique.
  const slugs = new Set();
  for (const card of cards) {
    if (slugs.has(card.slug)) card.slug = `${card.slug}-${slugify(card.id)}`;
    if (slugs.has(card.slug)) throw new Error(`duplicate card slug ${card.slug}`);
    slugs.add(card.slug);
  }
  const catalog = {
    generatedAt: new Date().toISOString().slice(0, 10),
    source: API,
    sets: sets.map((set) => ({ ...set, singlesCount: cards.filter((c) => c.setId === set.id).length })),
    cards,
    sealed: sealedProducts(sets),
  };
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(catalog, null, 1) + "\n");
  console.error(`Wrote ${outPath}: ${sets.length} sets, ${cards.length} cards, ${catalog.sealed.length} sealed products`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
