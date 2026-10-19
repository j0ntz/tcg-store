import catalogJson from "@/data/catalog.json";
import type { ConditionCode } from "./store";
import { CONDITIONS } from "./store";

export interface CatalogSet {
  id: string;
  slug: string;
  name: string;
  series: string;
  releaseDate: string;
  total: number;
  printedTotal: number;
  logo: string;
  symbol: string;
  singlesCount: number;
}

export interface Variant {
  condition: ConditionCode;
  price: number;
  quantity: number;
}

export interface CatalogCard {
  id: string;
  slug: string;
  name: string;
  setId: string;
  number: string;
  printedTotal: number;
  rarity: string;
  supertype: string;
  subtypes: string[];
  types: string[];
  hp: string | null;
  artist: string | null;
  imageSmall: string;
  imageLarge: string;
  marketPrice: number | null;
  marketUpdatedAt: string | null;
  addedAt: string;
  variants: Variant[];
}

export interface SealedProduct {
  id: string;
  slug: string;
  name: string;
  setId: string;
  kind: string;
  price: number;
  quantity: number;
  purchaseLimit: number;
  contents: string[];
  releaseDate: string;
  addedAt: string;
}

interface Catalog {
  generatedAt: string;
  source: string;
  sets: CatalogSet[];
  cards: CatalogCard[];
  sealed: SealedProduct[];
}

// The JSON is typed loosely by TypeScript's import inference; the seed script guarantees this shape.
const catalog = catalogJson as unknown as Catalog;

const setById = new Map(catalog.sets.map((s) => [s.id, s]));
const setBySlug = new Map(catalog.sets.map((s) => [s.slug, s]));
const cardBySlug = new Map(catalog.cards.map((c) => [c.slug, c]));
const sealedBySlug = new Map(catalog.sealed.map((p) => [p.slug, p]));

export const sets: CatalogSet[] = catalog.sets;
export const cards: CatalogCard[] = catalog.cards;
export const sealed: SealedProduct[] = catalog.sealed;
export const generatedAt = catalog.generatedAt;

export function getSet(id: string): CatalogSet | undefined {
  return setById.get(id);
}

export function getSetBySlug(slug: string): CatalogSet | undefined {
  return setBySlug.get(slug);
}

export function getCard(slug: string): CatalogCard | undefined {
  return cardBySlug.get(slug);
}

export function getSealed(slug: string): SealedProduct | undefined {
  return sealedBySlug.get(slug);
}

export function inStockVariants(card: CatalogCard): Variant[] {
  return card.variants.filter((v) => v.quantity > 0);
}

// The tile price is the cheapest condition still in stock; null means the whole card is sold out.
export function cheapestInStock(card: CatalogCard): Variant | null {
  const available = inStockVariants(card);
  if (available.length === 0) return null;
  return available.reduce((best, v) => (v.price < best.price ? v : best));
}

export function totalStock(card: CatalogCard): number {
  return card.variants.reduce((sum, v) => sum + v.quantity, 0);
}

export function cardNumberLabel(card: CatalogCard): string {
  return `${card.number}/${card.printedTotal}`;
}

export function newArrivals(limit: number): CatalogCard[] {
  return cards
    .filter((c) => cheapestInStock(c) != null)
    .sort((a, b) => (a.addedAt < b.addedAt ? 1 : a.addedAt > b.addedAt ? -1 : a.id.localeCompare(b.id)))
    .slice(0, limit);
}

export function cardsInSet(setId: string, exceptSlug: string, limit: number): CatalogCard[] {
  return cards.filter((c) => c.setId === setId && c.slug !== exceptSlug && cheapestInStock(c) != null).slice(0, limit);
}

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "name", label: "Name, A to Z" },
  { value: "number", label: "Set and number" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export interface ShopQuery {
  q: string;
  set: string[];
  rarity: string[];
  type: string[];
  cond: ConditionCode[];
  min: number | null;
  max: number | null;
  instock: boolean;
  sort: SortValue;
  page: number;
}

export const PAGE_SIZE = 24;

export const RARITIES: string[] = (() => {
  const counts = new Map<string, number>();
  for (const c of cards) counts.set(c.rarity, (counts.get(c.rarity) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([r]) => r);
})();

export const TYPES: string[] = (() => {
  const all = new Set<string>();
  for (const c of cards) for (const t of c.types) all.add(t);
  return [...all].sort();
})();

type SearchParamsLike = Record<string, string | string[] | undefined>;

function list(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  const raw = Array.isArray(value) ? value : [value];
  return raw.flatMap((v) => v.split(",")).map((v) => v.trim()).filter((v) => v !== "");
}

function first(value: string | string[] | undefined): string {
  if (value == null) return "";
  return Array.isArray(value) ? (value[0] ?? "") : value;
}

function price(value: string): number | null {
  if (value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

const CONDITION_CODES = new Set<string>(CONDITIONS.map((c) => c.code));
const SORT_VALUES = new Set<string>(SORT_OPTIONS.map((o) => o.value));

export function parseShopQuery(params: SearchParamsLike): ShopQuery {
  const sort = first(params.sort);
  const page = Number.parseInt(first(params.page), 10);
  return {
    q: first(params.q).trim(),
    set: list(params.set).filter((s) => setBySlug.has(s)),
    rarity: list(params.rarity).filter((r) => RARITIES.includes(r)),
    type: list(params.type).filter((t) => TYPES.includes(t)),
    cond: list(params.cond).filter((c): c is ConditionCode => CONDITION_CODES.has(c)),
    min: price(first(params.min)),
    max: price(first(params.max)),
    instock: first(params.instock) !== "0",
    sort: SORT_VALUES.has(sort) ? (sort as SortValue) : "newest",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

const DEFAULT_QUERY: ShopQuery = {
  q: "",
  set: [],
  rarity: [],
  type: [],
  cond: [],
  min: null,
  max: null,
  instock: true,
  sort: "newest",
  page: 1,
};

export function shopHref(query: Partial<ShopQuery>): string {
  const q: ShopQuery = { ...DEFAULT_QUERY, ...query };
  const p = new URLSearchParams();
  if (q.q !== "") p.set("q", q.q);
  for (const s of q.set) p.append("set", s);
  for (const r of q.rarity) p.append("rarity", r);
  for (const t of q.type) p.append("type", t);
  for (const c of q.cond) p.append("cond", c);
  if (q.min != null) p.set("min", String(q.min));
  if (q.max != null) p.set("max", String(q.max));
  if (!q.instock) p.set("instock", "0");
  if (q.sort !== "newest") p.set("sort", q.sort);
  if (q.page > 1) p.set("page", String(q.page));
  const s = p.toString();
  return s === "" ? "/shop" : `/shop?${s}`;
}

export function activeFilterCount(q: ShopQuery): number {
  return q.set.length + q.rarity.length + q.type.length + q.cond.length + (q.min != null ? 1 : 0) + (q.max != null ? 1 : 0) + (q.instock ? 0 : 1);
}

function normalize(text: string): string {
  return text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function matchesText(card: CatalogCard, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const set = setById.get(card.setId);
  const haystack = normalize(`${card.name} ${card.number} ${card.rarity} ${card.types.join(" ")} ${set?.name ?? ""} ${card.artist ?? ""}`);
  return terms.every((t) => haystack.includes(t));
}

function priceForFilter(card: CatalogCard, q: ShopQuery): number | null {
  const pool = q.cond.length > 0 ? card.variants.filter((v) => q.cond.includes(v.condition)) : card.variants;
  const considered = q.instock ? pool.filter((v) => v.quantity > 0) : pool;
  if (considered.length === 0) return null;
  return Math.min(...considered.map((v) => v.price));
}

export interface ShopResult {
  items: CatalogCard[];
  total: number;
  page: number;
  pageCount: number;
}

export function searchCards(q: ShopQuery): ShopResult {
  const terms = normalize(q.q).split(/\s+/).filter((t) => t !== "");
  const setIds = new Set(q.set.map((slug) => setBySlug.get(slug)?.id));
  const rarities = new Set(q.rarity);
  const types = new Set(q.type);
  const scored: Array<{ card: CatalogCard; price: number }> = [];
  for (const card of cards) {
    if (setIds.size > 0 && !setIds.has(card.setId)) continue;
    if (rarities.size > 0 && !rarities.has(card.rarity)) continue;
    if (types.size > 0 && !card.types.some((t) => types.has(t))) continue;
    if (!matchesText(card, terms)) continue;
    const p = priceForFilter(card, q);
    if (p == null) {
      // No variant satisfies the condition and stock filters.
      if (q.instock || q.cond.length > 0) continue;
      scored.push({ card, price: Number.POSITIVE_INFINITY });
      continue;
    }
    if (q.min != null && p < q.min) continue;
    if (q.max != null && p > q.max) continue;
    scored.push({ card, price: p });
  }
  const setOrder = new Map(sets.map((s, i) => [s.id, i]));
  const byNumber = (a: CatalogCard, b: CatalogCard): number => {
    const so = (setOrder.get(a.setId) ?? 0) - (setOrder.get(b.setId) ?? 0);
    if (so !== 0) return so;
    const an = Number.parseInt(a.number, 10);
    const bn = Number.parseInt(b.number, 10);
    if (Number.isFinite(an) && Number.isFinite(bn) && an !== bn) return an - bn;
    return a.number.localeCompare(b.number);
  };
  scored.sort((a, b) => {
    switch (q.sort) {
      case "price-asc":
        return a.price - b.price || byNumber(a.card, b.card);
      case "price-desc":
        return b.price - a.price || byNumber(a.card, b.card);
      case "name":
        return a.card.name.localeCompare(b.card.name) || byNumber(a.card, b.card);
      case "number":
        return byNumber(a.card, b.card);
      default:
        return b.card.addedAt.localeCompare(a.card.addedAt) || byNumber(a.card, b.card);
    }
  });
  const total = scored.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(q.page, pageCount);
  const start = (page - 1) * PAGE_SIZE;
  return { items: scored.slice(start, start + PAGE_SIZE).map((s) => s.card), total, page, pageCount };
}
