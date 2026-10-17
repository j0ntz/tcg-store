"use client";

import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useId, useState } from "react";
import { SORT_OPTIONS, activeFilterCount, shopHref, type CatalogSet, type ShopQuery, type SortValue } from "@/lib/catalog";
import { CONDITIONS, type ConditionCode } from "@/lib/store";

interface Props {
  query: ShopQuery;
  sets: CatalogSet[];
  rarities: string[];
  types: string[];
  total: number;
}

function toggle<T>(list: T[], value: T, on: boolean): T[] {
  if (on) return list.includes(value) ? list : [...list, value];
  return list.filter((v) => v !== value);
}

// Filters live in the URL. Every change pushes a new /shop URL, and the form still submits as a
// plain GET without JavaScript because every control carries the matching query name.
export const ShopControls: React.FC<Props> = (props) => {
  const { query, total } = props;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState(query.min == null ? "" : String(query.min));
  const [max, setMax] = useState(query.max == null ? "" : String(query.max));
  // The price inputs are free text until applied; a new URL range (chip removed, back button)
  // resets them during render, the React-sanctioned way to derive state from props.
  const [seenRange, setSeenRange] = useState<[number | null, number | null]>([query.min, query.max]);
  if (seenRange[0] !== query.min || seenRange[1] !== query.max) {
    setSeenRange([query.min, query.max]);
    setMin(query.min == null ? "" : String(query.min));
    setMax(query.max == null ? "" : String(query.max));
  }
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const push = useCallback(
    (next: Partial<ShopQuery>): void => {
      router.push(shopHref({ ...query, ...next, page: 1 }));
    },
    [router, query],
  );

  const applyPrice = useCallback((): void => {
    const parse = (v: string): number | null => {
      const n = Number(v);
      return v.trim() !== "" && Number.isFinite(n) && n >= 0 ? n : null;
    };
    const nextMin = parse(min);
    const nextMax = parse(max);
    if (nextMin === query.min && nextMax === query.max) return;
    push({ min: nextMin, max: nextMax });
  }, [push, min, max, query.min, query.max]);

  const activeCount = activeFilterCount(query);

  // The panel is mounted twice on phones (desktop aside and the sheet), so each copy scopes its
  // input ids to keep every id unique while the sheet is open.
  const panel = (scope: string): React.ReactNode => (
    <form
      action="/shop"
      method="get"
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        applyPrice();
        setOpen(false);
      }}
    >
      {query.q !== "" ? <input type="hidden" name="q" value={query.q} /> : null}
      {query.sort !== "newest" ? <input type="hidden" name="sort" value={query.sort} /> : null}
      {query.instock ? null : <input type="hidden" name="instock" value="0" />}

      <fieldset>
        <legend className="font-semibold mb-2">Set</legend>
        <div className="flex flex-col gap-1.5">
          {props.sets.map((set) => (
            <label key={set.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="set"
                value={set.slug}
                className="checkbox"
                checked={query.set.includes(set.slug)}
                onChange={(event) => push({ set: toggle(query.set, set.slug, event.target.checked) })}
              />
              {set.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-semibold mb-2">Rarity</legend>
        <div className="flex flex-col gap-1.5">
          {props.rarities.map((rarity) => (
            <label key={rarity} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="rarity"
                value={rarity}
                className="checkbox"
                checked={query.rarity.includes(rarity)}
                onChange={(event) => push({ rarity: toggle(query.rarity, rarity, event.target.checked) })}
              />
              {rarity}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-semibold mb-2">Stock</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="checkbox"
            checked={query.instock}
            onChange={(event) => push({ instock: event.target.checked })}
          />
          In stock only
        </label>
      </fieldset>

      <fieldset>
        <legend className="font-semibold mb-2">Condition</legend>
        <div className="flex flex-col gap-1.5">
          {CONDITIONS.map((condition) => (
            <label key={condition.code} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="cond"
                value={condition.code}
                className="checkbox"
                checked={query.cond.includes(condition.code)}
                onChange={(event) => push({ cond: toggle<ConditionCode>(query.cond, condition.code, event.target.checked) })}
              />
              {condition.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-semibold mb-2">Price</legend>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor={`${id}-${scope}-min`} className="block text-xs text-ink-2 mb-1">
              Min
            </label>
            <input
              id={`${id}-${scope}-min`}
              name="min"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              className="input num"
              value={min}
              onChange={(event) => setMin(event.target.value)}
              onBlur={applyPrice}
            />
          </div>
          <div className="flex-1">
            <label htmlFor={`${id}-${scope}-max`} className="block text-xs text-ink-2 mb-1">
              Max
            </label>
            <input
              id={`${id}-${scope}-max`}
              name="max"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              className="input num"
              value={max}
              onChange={(event) => setMax(event.target.value)}
              onBlur={applyPrice}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Apply
          </button>
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-semibold mb-2">Type</legend>
        <div className="flex flex-wrap gap-1.5">
          {props.types.map((type) => {
            const on = query.type.includes(type);
            return (
              <label key={type} className={`chip cursor-pointer ${on ? "chip-active" : ""}`}>
                <input
                  type="checkbox"
                  name="type"
                  value={type}
                  className="sr-only"
                  checked={on}
                  onChange={(event) => push({ type: toggle(query.type, type, event.target.checked) })}
                />
                {type}
              </label>
            );
          })}
        </div>
      </fieldset>
    </form>
  );

  return (
    <>
      <div className="flex items-center gap-3">
        <button type="button" className="btn btn-secondary md:hidden" aria-expanded={open} onClick={() => setOpen(true)}>
          Filters
          {activeCount > 0 ? (
            <span className="num inline-flex min-w-5 h-5 px-1 items-center justify-center rounded-full bg-accent-soft text-xs">
              {activeCount}
            </span>
          ) : null}
        </button>
        <label htmlFor={`${id}-sort`} className="text-sm text-ink-2 ml-auto">
          Sort
        </label>
        <select
          id={`${id}-sort`}
          name="sort"
          className="input w-auto"
          value={query.sort}
          onChange={(event) => push({ sort: event.target.value as SortValue })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <aside className="hidden md:block" aria-label="Filters">
        {panel("desktop")}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close filters" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] flex flex-col bg-surface rounded-t-[var(--radius-lg)]">
            <div className="flex items-center justify-between px-4 h-14 border-b border-line">
              <span className="font-semibold">Filters</span>
              <button type="button" className="text-sm font-medium" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-4">{panel("sheet")}</div>
            <div className="px-4 py-3 border-t border-line bg-surface">
              <button type="button" className="btn btn-primary w-full num" onClick={() => setOpen(false)}>
                Show {total} {total === 1 ? "result" : "results"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
