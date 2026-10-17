"use client";

import React, { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

export interface CartLine {
  key: string;
  kind: "card" | "sealed";
  slug: string;
  href: string;
  name: string;
  meta: string;
  // "Near Mint" for singles, "Factory sealed" for sealed product.
  condition: string;
  unitPrice: number;
  qty: number;
  // The most the shopper can buy: stock, or the purchase limit when that is lower.
  maxQty: number;
  image: string | null;
}

export type NewLine = Omit<CartLine, "key">;

interface CartContextValue {
  hydrated: boolean;
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: NewLine) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "tcg-store.cart.v1";

const CartContext = createContext<CartContextValue | null>(null);

export function lineKey(line: Pick<CartLine, "kind" | "slug" | "condition">): string {
  return `${line.kind}:${line.slug}:${line.condition}`;
}

function isLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.key === "string" && typeof v.slug === "string" && typeof v.qty === "number" && typeof v.unitPrice === "number" && typeof v.maxQty === "number";
}

// The cart is an external store: localStorage is the source of truth, with an in-memory copy for
// browsers that block storage. Components subscribe through useSyncExternalStore, so the server
// render and the first client render agree (no cart), and the stored cart appears right after.
const listeners = new Set<() => void>();
let memory: string | null = null;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent): void => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? memory;
  } catch (error: unknown) {
    console.warn("Cart storage is not readable", error);
    return memory;
  }
}

function getServerSnapshot(): undefined {
  return undefined;
}

function parse(raw: string | null | undefined): CartLine[] {
  if (raw == null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isLine) : [];
  } catch (error: unknown) {
    console.warn("Cart could not be parsed", error);
    return [];
  }
}

function write(lines: CartLine[]): void {
  const raw = JSON.stringify(lines);
  memory = raw;
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch (error: unknown) {
    console.warn("Cart could not be saved", error);
  }
  for (const listener of listeners) listener();
}

function update(fn: (prev: CartLine[]) => CartLine[]): void {
  write(fn(parse(getSnapshot())));
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = raw !== undefined;
  const lines = useMemo(() => parse(raw), [raw]);

  const add = useCallback((line: NewLine): void => {
    const key = lineKey(line);
    update((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing == null) return [...prev, { ...line, key, qty: Math.min(line.qty, line.maxQty) }];
      const qty = Math.min(existing.qty + line.qty, line.maxQty);
      return prev.map((l) => (l.key === key ? { ...line, key, qty } : l));
    });
  }, []);

  const setQty = useCallback((key: string, qty: number): void => {
    update((prev) => prev.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(qty, l.maxQty)) } : l)));
  }, []);

  const remove = useCallback((key: string): void => update((prev) => prev.filter((l) => l.key !== key)), []);
  const clear = useCallback((): void => update(() => []), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, l) => sum + l.qty, 0);
    const subtotal = Math.round(lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0) * 100) / 100;
    return { hydrated, lines, count, subtotal, add, setQty, remove, clear };
  }, [hydrated, lines, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{props.children}</CartContext.Provider>;
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (ctx == null) throw new Error("useCart needs a CartProvider above it");
  return ctx;
}
