"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/format";
import { SHIPPING_METHODS, type ShippingMethod } from "@/lib/store";

const STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
  "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

interface Fields {
  email: string;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

type FieldName = keyof Fields;

const EMPTY: Fields = { email: "", name: "", address1: "", address2: "", city: "", state: "", zip: "", phone: "" };

function validate(fields: Fields): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) errors.email = "Enter an email address like name@example.com";
  if (fields.name.trim() === "") errors.name = "Enter the name the package is addressed to";
  if (fields.address1.trim() === "") errors.address1 = "Enter a street address";
  if (fields.city.trim() === "") errors.city = "Enter a city";
  if (fields.state === "") errors.state = "Choose a state";
  if (!/^\d{5}$/.test(fields.zip.trim())) errors.zip = "Enter a 5-digit ZIP code";
  return errors;
}

interface FieldProps {
  name: FieldName;
  label: string;
  hint?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "email";
  value: string;
  error: string | undefined;
  onChange: (value: string) => void;
  onBlur: () => void;
}

const Field: React.FC<FieldProps> = (props) => {
  const id = `checkout-${props.name}`;
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {props.label}
      </label>
      <input
        id={id}
        name={props.name}
        type={props.type ?? "text"}
        autoComplete={props.autoComplete}
        inputMode={props.inputMode}
        className="input"
        value={props.value}
        aria-invalid={props.error != null}
        aria-describedby={props.error != null ? errorId : undefined}
        onChange={(event) => props.onChange(event.target.value)}
        onBlur={props.onBlur}
      />
      {props.error != null ? (
        <p id={errorId} className="text-sm text-danger">
          {props.error}
        </p>
      ) : props.hint != null ? (
        <p className="text-xs text-ink-2">{props.hint}</p>
      ) : null}
    </div>
  );
};

const Step: React.FC<{ n: number; title: string; children: React.ReactNode }> = (props) => (
  <section aria-labelledby={`step-${props.n}`} className="flex flex-col gap-4">
    <h2 id={`step-${props.n}`} className="text-lg font-bold flex items-center gap-3">
      <span className="num inline-flex w-7 h-7 items-center justify-center rounded-full bg-brand text-brand-ink text-sm">{props.n}</span>
      {props.title}
    </h2>
    {props.children}
  </section>
);

export const CheckoutForm: React.FC = () => {
  const cart = useCart();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [method, setMethod] = useState<ShippingMethod["id"]>("tracked");

  const errors = useMemo(() => validate(fields), [fields]);
  const shown = (name: FieldName): string | undefined => (touched[name] === true ? errors[name] : undefined);
  const set = (name: FieldName) => (value: string) => setFields((prev) => ({ ...prev, [name]: value }));
  const blur = (name: FieldName) => () => setTouched((prev) => ({ ...prev, [name]: true }));

  const options = useMemo(
    () => SHIPPING_METHODS.map((m) => ({ method: m, price: m.priceFor(cart.subtotal) })),
    [cart.subtotal],
  );
  const chosen = options.find((o) => o.method.id === method && o.price != null) ?? options[0];
  const shipping = chosen.price ?? 0;
  const total = Math.round((cart.subtotal + shipping) * 100) / 100;

  if (!cart.hydrated) return <p className="text-ink-2">Loading your cart…</p>;

  if (cart.lines.length === 0) {
    return (
      <div className="notice flex flex-col gap-3 max-w-xl">
        <p className="font-semibold">There is nothing to check out</p>
        <p className="text-sm text-ink-2">Your cart is empty.</p>
        <div>
          <Link href="/shop" className="btn btn-primary">
            Shop singles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      className="grid gap-10 lg:grid-cols-[1fr_360px] items-start"
      noValidate
      onSubmit={(event) => {
        // Place order is disabled until payments exist; this guards keyboard submits in the meantime.
        event.preventDefault();
        setTouched({ email: true, name: true, address1: true, city: true, state: true, zip: true });
      }}
    >
      <div className="flex flex-col gap-10">
        <Step n={1} title="Contact">
          <Field name="email" label="Email" type="email" autoComplete="email" inputMode="email" hint="Your receipt and tracking go here." value={fields.email} error={shown("email")} onChange={set("email")} onBlur={blur("email")} />
        </Step>

        <Step n={2} title="Shipping address">
          <Field name="name" label="Full name" autoComplete="name" value={fields.name} error={shown("name")} onChange={set("name")} onBlur={blur("name")} />
          <Field name="address1" label="Address" autoComplete="address-line1" value={fields.address1} error={shown("address1")} onChange={set("address1")} onBlur={blur("address1")} />
          <Field name="address2" label="Apartment, suite (optional)" autoComplete="address-line2" value={fields.address2} error={undefined} onChange={set("address2")} onBlur={blur("address2")} />
          <div className="grid gap-4 sm:grid-cols-[1fr_120px_140px]">
            <Field name="city" label="City" autoComplete="address-level2" value={fields.city} error={shown("city")} onChange={set("city")} onBlur={blur("city")} />
            <div className="flex flex-col gap-1">
              <label htmlFor="checkout-state" className="text-sm font-medium">
                State
              </label>
              <select
                id="checkout-state"
                name="state"
                autoComplete="address-level1"
                className="input"
                value={fields.state}
                aria-invalid={shown("state") != null}
                aria-describedby={shown("state") != null ? "checkout-state-error" : undefined}
                onChange={(event) => set("state")(event.target.value)}
                onBlur={blur("state")}
              >
                <option value="">Choose</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {shown("state") != null ? (
                <p id="checkout-state-error" className="text-sm text-danger">
                  {shown("state")}
                </p>
              ) : null}
            </div>
            <Field name="zip" label="ZIP code" autoComplete="postal-code" inputMode="numeric" value={fields.zip} error={shown("zip")} onChange={set("zip")} onBlur={blur("zip")} />
          </div>
          <Field name="phone" label="Phone (optional)" type="tel" autoComplete="tel" inputMode="tel" hint="Only used if the carrier needs to reach you." value={fields.phone} error={undefined} onChange={set("phone")} onBlur={blur("phone")} />
          <p className="text-sm text-ink-2">We ship to the United States only for now.</p>
        </Step>

        <Step n={3} title="Shipping method">
          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Shipping method">
            {options.map(({ method: m, price }) => {
              const unavailable = price == null;
              const selected = chosen.method.id === m.id;
              return (
                <label key={m.id} className="row-option" data-selected={selected} data-disabled={unavailable}>
                  <input type="radio" name="shipping" value={m.id} className="checkbox" checked={selected} disabled={unavailable} onChange={() => setMethod(m.id)} />
                  <span className="flex flex-col min-w-0">
                    <span className="font-medium">{m.name}</span>
                    <span className="text-xs text-ink-2">{unavailable ? m.unavailableReason : m.detail}</span>
                  </span>
                  <span className="num font-medium">{unavailable ? "" : price === 0 ? "Free" : money(price)}</span>
                </label>
              );
            })}
          </div>
        </Step>

        <Step n={4} title="Payment">
          <div className="notice border border-dashed border-line flex flex-col gap-1" aria-label="Payment placeholder">
            <p className="font-semibold">Payment is not connected yet</p>
            <p className="text-sm text-ink-2">
              This is where the card form will go. No card details are collected on this page, and no order can be placed yet.
            </p>
          </div>
        </Step>
      </div>

      <aside className="notice flex flex-col gap-4 lg:sticky lg:top-4">
        <h2 className="text-lg font-bold">Order summary</h2>
        <ul className="divided">
          {cart.lines.map((line) => (
            <li key={line.key} className="flex items-center gap-3 py-2">
              <span className="well relative w-10 aspect-[5/7] shrink-0">
                {line.image != null ? <Image src={line.image} alt="" fill sizes="40px" className="object-contain p-0.5" /> : null}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-medium truncate">{line.name}</span>
                <span className="block text-xs text-ink-2 num">
                  {line.condition === "" ? `Qty ${line.qty}` : `${line.condition} · Qty ${line.qty}`}
                </span>
              </span>
              <span className="num font-medium">{money(line.unitPrice * line.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="divided text-sm border-t border-line">
          <div className="flex justify-between py-2">
            <dt>Subtotal</dt>
            <dd className="num">{money(cart.subtotal)}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt>Shipping</dt>
            <dd className="num">{shipping === 0 ? "Free, tracked" : money(shipping)}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt>Tax</dt>
            <dd className="text-ink-2">Calculated after your address</dd>
          </div>
          <div className="flex justify-between py-2 font-semibold">
            <dt>Total</dt>
            <dd className="num">{money(total)}</dd>
          </div>
        </dl>
        <button type="submit" className="btn btn-primary w-full num" disabled aria-describedby="place-order-note">
          Place order · {money(total)}
        </button>
        <p id="place-order-note" className="text-sm text-ink-2">
          Payments are not connected yet, so orders cannot be placed. Your cart stays saved on this device.
        </p>
      </aside>
    </form>
  );
};
