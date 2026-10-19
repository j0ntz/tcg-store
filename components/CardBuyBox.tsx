"use client";

import React, { useId, useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import type { CatalogCard } from "@/lib/catalog";
import { money, stockPhrase } from "@/lib/format";
import { CONDITIONS, type ConditionCode } from "@/lib/store";
import { AddedNotice } from "./AddedNotice";
import { QuantityInput } from "./QuantityInput";

interface Props {
  card: CatalogCard;
  setName: string;
  numberLabel: string;
}

export const CardBuyBox: React.FC<Props> = (props) => {
  const { card } = props;
  const cart = useCart();
  const id = useId();
  const rows = useMemo(
    () =>
      CONDITIONS.map((condition) => {
        const variant = card.variants.find((v) => v.condition === condition.code);
        return { ...condition, price: variant?.price ?? 0, quantity: variant?.quantity ?? 0 };
      }),
    [card],
  );
  const firstInStock = rows.find((r) => r.quantity > 0);
  const [selected, setSelected] = useState<ConditionCode | null>(firstInStock?.code ?? null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const current = rows.find((r) => r.code === selected) ?? null;
  const soldOut = firstInStock == null;

  const choose = (code: ConditionCode): void => {
    setSelected(code);
    setQty(1);
    setAdded(false);
  };

  const add = (): void => {
    if (current == null || current.quantity === 0) return;
    cart.add({
      kind: "card",
      slug: card.slug,
      href: `/cards/${card.slug}`,
      name: card.name,
      meta: `${props.setName} · ${props.numberLabel}`,
      condition: current.name,
      unitPrice: current.price,
      qty,
      maxQty: current.quantity,
      image: card.imageSmall,
    });
    setAdded(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <fieldset>
        <legend className="font-semibold mb-2">Condition</legend>
        <div className="flex flex-col gap-2" role="radiogroup">
          {rows.map((row) => {
            const isSelected = row.code === selected;
            const out = row.quantity === 0;
            return (
              <label key={row.code} className="row-option" data-selected={isSelected} data-disabled={out}>
                <input
                  type="radio"
                  name={`${id}-condition`}
                  value={row.code}
                  className="checkbox"
                  checked={isSelected}
                  disabled={out}
                  onChange={() => choose(row.code)}
                />
                <span className="flex flex-col min-w-0">
                  <span className="font-medium">{row.name}</span>
                  <span className={`text-xs ${out ? "text-ink-3" : "text-ink-2"}`}>{out ? "Sold out" : stockPhrase(row.quantity)}</span>
                </span>
                {out ? (
                  <span className="flex items-center">
                    <button type="button" className="btn btn-secondary h-8 px-3 text-sm" disabled title="Restock alerts are not set up yet">
                      Notify me
                    </button>
                  </span>
                ) : (
                  <span className="num font-display font-bold text-lg">{money(row.price)}</span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      {soldOut ? (
        <div className="notice">
          <p className="font-semibold">Sold out in every condition</p>
          <p className="text-sm text-ink-2">Restock alerts are not set up yet. The rest of the set is still in stock.</p>
        </div>
      ) : (
        <div className="sticky bottom-0 md:static bg-canvas py-3 md:py-0 border-t md:border-0 border-line -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex items-end gap-3">
            <div>
              <label htmlFor={`${id}-qty`} className="block text-xs text-ink-2 mb-1">
                Quantity
              </label>
              <QuantityInput id={`${id}-qty`} value={qty} max={current?.quantity ?? 1} onChange={setQty} />
            </div>
            <button type="button" className="btn btn-primary flex-1 num" onClick={add} disabled={current == null || current.quantity === 0}>
              Add to cart · {money((current?.price ?? 0) * qty)}
            </button>
          </div>
          {added ? (
            <div className="mt-2">
              <AddedNotice name={`${card.name} (${current?.name ?? ""})`} />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
