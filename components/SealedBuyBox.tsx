"use client";

import React, { useId, useState } from "react";
import { useCart } from "@/lib/cart";
import type { SealedProduct } from "@/lib/catalog";
import { money, stockPhrase } from "@/lib/format";
import { AddedNotice } from "./AddedNotice";
import { QuantityInput } from "./QuantityInput";

interface Props {
  product: SealedProduct;
  setName: string;
  setLogo: string | null;
}

export const SealedBuyBox: React.FC<Props> = (props) => {
  const { product } = props;
  const cart = useCart();
  const id = useId();
  const max = Math.min(product.quantity, product.purchaseLimit);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const add = (): void => {
    if (max === 0) return;
    cart.add({
      kind: "sealed",
      slug: product.slug,
      href: `/sealed/${product.slug}`,
      name: product.name,
      meta: props.setName,
      condition: "Factory sealed",
      unitPrice: product.price,
      qty,
      maxQty: max,
      image: props.setLogo,
    });
    setAdded(true);
  };

  if (product.quantity === 0) {
    return (
      <div className="notice">
        <p className="font-semibold">Sold out</p>
        <p className="text-sm text-ink-2">Restock alerts are not set up yet. Other sealed product from this set may still be in stock.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-baseline gap-3 flex-wrap">
        <span className="num font-display font-bold text-xl">{money(product.price)}</span>
        <span className="text-sm text-ink-2">{stockPhrase(product.quantity)}</span>
        <span className="chip chip-active h-6 px-2 text-xs font-medium num">Limit {product.purchaseLimit} per order</span>
      </p>
      <div className="flex items-end gap-3">
        <div>
          <label htmlFor={`${id}-qty`} className="block text-xs text-ink-2 mb-1">
            Quantity
          </label>
          <QuantityInput id={`${id}-qty`} value={qty} max={max} onChange={setQty} />
        </div>
        <button type="button" className="btn btn-primary flex-1 num" onClick={add}>
          Add to cart · {money(product.price * qty)}
        </button>
      </div>
      {added ? <AddedNotice name={product.name} /> : null}
    </div>
  );
};
