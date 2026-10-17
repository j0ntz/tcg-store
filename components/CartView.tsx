"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/store";
import { QuantityInput } from "./QuantityInput";

export const ShippingStatus: React.FC<{ subtotal: number }> = (props) => {
  const remaining = Math.round((FREE_SHIPPING_THRESHOLD - props.subtotal) * 100) / 100;
  if (remaining <= 0) {
    return (
      <div className="notice bg-accent-soft">
        <p className="font-semibold">This order ships free with tracking</p>
        <p className="text-sm text-ink-2">Orders over {money(FREE_SHIPPING_THRESHOLD)} ship free by USPS Ground Advantage.</p>
      </div>
    );
  }
  return (
    <div className="notice">
      <p className="font-semibold num">Add {money(remaining)} more for free tracked shipping</p>
      <p className="text-sm text-ink-2">Orders over {money(FREE_SHIPPING_THRESHOLD)} ship free by USPS Ground Advantage. Under that, tracked shipping is $4.95.</p>
    </div>
  );
};

export const CartView: React.FC = () => {
  const cart = useCart();

  if (!cart.hydrated) {
    return <p className="text-ink-2">Loading your cart…</p>;
  }

  if (cart.lines.length === 0) {
    return (
      <div className="notice flex flex-col gap-3 max-w-xl">
        <p className="font-semibold">Your cart is empty</p>
        <p className="text-sm text-ink-2">Nothing is held for you yet. Singles and sealed product go in from their own pages.</p>
        <div className="flex gap-2 flex-wrap">
          <Link href="/shop" className="btn btn-primary">
            Shop singles
          </Link>
          <Link href="/sealed" className="btn btn-secondary">
            Shop sealed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px] items-start">
      <div className="flex flex-col gap-6">
        <ShippingStatus subtotal={cart.subtotal} />
        <ul className="divided border-y border-line">
          {cart.lines.map((line) => (
            <li key={line.key} className="grid grid-cols-[64px_1fr] sm:grid-cols-[64px_1fr_auto_auto] gap-x-4 gap-y-2 py-4 items-center">
              <Link href={line.href} className="well relative w-16 aspect-[5/7] block">
                {line.image != null ? <Image src={line.image} alt="" fill sizes="64px" className="object-contain p-1" /> : null}
              </Link>
              <div className="min-w-0">
                <Link href={line.href} className="font-semibold no-underline hover:text-brand">
                  {line.name}
                </Link>
                <p className="num text-xs text-ink-2">{line.meta}</p>
                <p className="text-sm">{line.condition}</p>
                <p className="num text-sm text-ink-2 sm:hidden">{money(line.unitPrice)} each</p>
              </div>
              <div className="col-start-2 sm:col-start-3 flex items-center gap-3">
                <QuantityInput id={`qty-${line.key}`} value={line.qty} max={line.maxQty} onChange={(value) => cart.setQty(line.key, value)} />
                <button type="button" className="text-sm text-ink-2 hover:text-danger underline" onClick={() => cart.remove(line.key)}>
                  Remove
                </button>
              </div>
              <p className="num font-display font-bold text-lg col-start-2 sm:col-start-4 sm:text-right">{money(line.unitPrice * line.qty)}</p>
              {line.qty >= line.maxQty ? (
                <p className="col-start-2 sm:col-span-3 text-xs text-ink-2 num">
                  {line.kind === "sealed" ? `Limit ${line.maxQty} per order.` : `Only ${line.maxQty} in stock in this condition.`}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      <aside className="notice flex flex-col gap-3 lg:sticky lg:top-4">
        <h2 className="text-lg font-bold">Summary</h2>
        <dl className="divided text-sm">
          <div className="flex justify-between py-2">
            <dt>Subtotal</dt>
            <dd className="num font-medium">{money(cart.subtotal)}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt>Shipping</dt>
            <dd className="num">{cart.subtotal >= FREE_SHIPPING_THRESHOLD ? "Free, tracked" : "From $1.25"}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt>Tax</dt>
            <dd className="text-ink-2">Calculated after your address</dd>
          </div>
        </dl>
        <Link href="/checkout" className="btn btn-primary w-full">
          Check out
        </Link>
        <p className="text-xs text-ink-2">Items are not held until checkout.</p>
      </aside>
    </div>
  );
};
