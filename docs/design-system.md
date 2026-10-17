# Design system

The design contract for this site. `app/globals.css` is the token source of truth; this document
says what the tokens mean and how they combine. The hard rules in
`docs/research/anti-slop-ui.md` apply on top of everything here; where this document is silent,
that list decides.

## Identity

A card shop, not a gallery. The product image is the biggest thing on every tile, the chrome is
quiet, and every number (price, stock, card number) is set in tabular figures so columns line up.
The mood is a card table: a deep green felt as the one brand color and a foil amber as the one
accent. No serif, no editorial layouts, no gradients.

The store name is a placeholder. It lives in one constant, `STORE_NAME` in `lib/store.ts`, and
nowhere else.

## Typography

Two typefaces, both loaded through `next/font/google` and exposed as CSS variables.

| Role | Family | Variable | Weights used |
|---|---|---|---|
| Display (headings, prices, the wordmark) | Bricolage Grotesque | `--font-display` | 500, 700, 800 |
| Body (everything else) | IBM Plex Sans | `--font-sans` | 400, 500, 600 |

Scale, ratio 1.25 from a 16px base. Use the steps, never an in-between size.

| Token | Size | Used for |
|---|---|---|
| `--text-xs` | 0.8rem | meta lines (set · number), table labels, footer |
| `--text-sm` | 0.9rem | secondary copy, chips, form hints |
| `--text-base` | 1rem | body, inputs, buttons |
| `--text-lg` | 1.25rem | tile prices, section labels, h3 |
| `--text-xl` | 1.5625rem | h2, the product price on a detail page |
| `--text-2xl` | 1.953rem | h1 on inner pages |
| `--text-3xl` | 2.441rem | the home hero h1 |

Hierarchy comes from weight and spacing before size: a section heading is `--text-lg` at 700, a
product name on a tile is `--text-base` at 600 in the body face. Headings get `text-wrap: balance`.
Numbers get `font-variant-numeric: tabular-nums` through the `.num` utility. No all-caps kickers,
no letter-spaced labels.

## Color

OKLCH tokens, one dominant color and one accent. Both themes define the same token names, so
components never branch on theme.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--canvas` | oklch(0.98 0.006 85) | oklch(0.17 0.008 80) | page background |
| `--surface` | oklch(1 0 0) | oklch(0.21 0.008 80) | tiles, inputs, sheets |
| `--surface-2` | oklch(0.955 0.008 85) | oklch(0.26 0.01 80) | image wells, hover rows, disabled fill |
| `--line` | oklch(0.88 0.012 85) | oklch(0.32 0.012 80) | dividers and borders |
| `--ink` | oklch(0.22 0.015 80) | oklch(0.93 0.008 85) | text |
| `--ink-2` | oklch(0.45 0.015 80) | oklch(0.72 0.01 85) | secondary text |
| `--ink-3` | oklch(0.58 0.012 80) | oklch(0.58 0.01 85) | meta text, sold out |
| `--brand` | oklch(0.42 0.10 150) | oklch(0.78 0.12 150) | the dominant color |
| `--brand-ink` | oklch(0.99 0 0) | oklch(0.17 0.03 150) | text on `--brand` |
| `--brand-soft` | oklch(0.94 0.03 150) | oklch(0.26 0.04 150) | brand tint for selected rows |
| `--accent` | oklch(0.72 0.15 75) | oklch(0.80 0.15 80) | the one accent |
| `--accent-soft` | oklch(0.95 0.05 85) | oklch(0.30 0.05 80) | accent tint |
| `--danger` | oklch(0.52 0.19 27) | oklch(0.74 0.16 27) | form errors only |

The dominant color `--brand` carries the wordmark, links, primary buttons, the selected
condition row, and the header's cart count. It is the only saturated color on most screens.

The accent `--accent` appears in at most these five places and nowhere else:

1. the focus ring (`:focus-visible`)
2. active filter chips on the shop page
3. the free-shipping status line in the cart
4. the purchase-limit badge on sealed products
5. the "New" marker on new arrivals

Sold out is a text state (`--ink-3`, the word "Sold out"), never a red. Red is reserved for form
validation.

Banned by the hard rules and therefore absent: purple, indigo, violet, gradients, glows, colored
shadows, cyan on dark, pure black text.

## Spacing and layout

Base unit 4px; Tailwind's default spacing scale is that unit. Rhythm inside a tile is 4/8/12,
between sections 48 on phones and 64 on desktop. Hierarchy comes from spacing and 1px dividers
(`--line`), never from nested boxes: a tile is one bordered surface with content laid out by gaps,
a details table is rows separated by dividers.

The one layout primitive is the **tile grid**: a responsive grid of equal tiles, 2 columns at
phone width, 3 at 640px, 4 at 960px, 6 for set and sealed rows at 1200px. Cards, sealed products,
and sets all use it. Lists of facts (condition rows, card details, cart lines, order summary) use
the **row list**: label left, value right, divider between rows.

Page container: max 1200px, 16px gutters at phone width, 24px from 640px. Every page lays out at
390px with no horizontal scroll.

## Radius

A scale of three values. One radius everywhere is a tell; a thick colored edge on one side is the
worst tell and is banned.

| Token | Value | Used on |
|---|---|---|
| `--radius-sm` | 4px | buttons, inputs, select, checkboxes |
| `--radius-lg` | 12px | tiles, image wells, the filter sheet, notices |
| `--radius-full` | 9999px | chips, count badges |

## Components

- **Button**: primary (`--brand` fill, `--brand-ink` text), secondary (`--line` border, `--ink`
  text), both 40px tall, `--radius-sm`, 600 weight. Disabled: `--surface-2` fill, `--ink-3` text,
  `cursor: not-allowed`, and the reason stated in text next to it, never only a greyed button.
- **Input**: 40px, `--surface` fill, 1px `--line` border, `--radius-sm`. Error: `--danger`
  border and a message under the field that starts with what to do ("Enter a 5-digit ZIP code").
  Labels are always visible; placeholders are never labels.
- **Tile**: image well (`--surface-2`, `--radius-lg`, card aspect 5:7) on top, then name (600),
  meta line (`--text-xs`, `--ink-2`), price line (display face, `--text-lg`, 700) with the stock
  phrase after it in `--ink-2`. The whole tile is the link. No add-to-cart on a single's tile; a
  single needs a condition first.
- **Chip**: `--radius-full`, `--text-sm`, 1px `--line` border. Active chips use `--accent-soft`
  fill and carry a remove control.
- **Condition row**: a radio row in the row list. Selected: `--brand-soft` fill and a `--brand`
  border. Sold out: `--ink-3` text and a disabled "Notify me" button in place of the price.
- **Notice**: `--surface-2` fill, `--radius-lg`, `--ink` text. Used for the shipping promise, the
  payments-not-connected notice, and empty states.
- **Header**: the promise bar (`--text-xs`, `--surface-2`), then wordmark, nav, search, cart.
  Home replaces the header search with the hero search. Checkout drops nav and search.
- **Footer**: nav, then the trademark notice at `--text-xs` in `--ink-2`.

## States

Designed before the happy path, in this order: empty (no results, empty cart, nothing in a set),
sold out (a card whose every condition is 0), error (bad ZIP, unknown slug), then the full page.
Every empty state names the way out as a link. Real catalog data only; no placeholders in copy.

## Motion

Only on interaction: 150ms ease-out on `background-color`, `border-color`, `color`, and `opacity`
for buttons, rows, and tiles. The filter sheet slides in over 200ms. Nothing animates on page
load. `prefers-reduced-motion: reduce` removes every transition. No `transition: all`.

## Themes

The site follows the system setting. `prefers-color-scheme: dark` swaps the token values; a
`data-theme="light"` or `data-theme="dark"` attribute on `<html>` overrides it (used by screenshot
tooling and reserved for a future toggle). Card images sit on `--surface-2` wells in both themes,
so the artwork never fights the background.

## Review loop

Before any UI ships: render, screenshot at 390 and 1440 in both themes, compare against the
tokens and the banned-pattern list, fix, re-screenshot. Zero critical anti-slop findings is the
merge gate.
