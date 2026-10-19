<!-- orch -->
# Agent run report: Scaffold the store MVP: catalog, card and sealed pages, cart, checkout shell

**Live preview: [tcg-store-git-jon-task-1-jontz.vercel.app](https://tcg-store-git-jon-task-1-jontz.vercel.app)**  |  **PR: [j0ntz/tcg-store#2](https://github.com/j0ntz/tcg-store/pull/2)**

| field | value |
|---|---|
| Task | [j0ntz/tcg-store#1](https://github.com/j0ntz/tcg-store/issues/1) |
| PR | [j0ntz/tcg-store#2](https://github.com/j0ntz/tcg-store/pull/2) |
| Preview | [tcg-store-git-jon-task-1-jontz.vercel.app](https://tcg-store-git-jon-task-1-jontz.vercel.app) |
| Branch | jon/task-1 |
| Verified | pass |
| Date | 2026-10-17 |

## Summary

The branch turns the create-next-app shell into a shoppable Pokémon singles and sealed store: a committed catalog of 1159 cards across 7 sets plus 18 sealed products, home, shop, card, sealed, sets, cart and checkout pages, a localStorage cart with a header count, and a checkout form that validates and stops before payment. The verify run passed against the preview at head 59a46ee, every acceptance flow from the issue was exercised live, and the cold review of the diff found nothing that needs a code change.

## What changed

- `scripts/seed-catalog.mjs` pulls six newest English sets plus 151 from the Pokémon TCG API and writes `data/catalog.json` with four condition variants per card, deterministic stock (115 cards sold out in every condition), and 18 hand-written sealed products with purchase limits and contents.
- `docs/design-system.md` and the tokens in `app/globals.css` (OKLCH light and dark, system default with a `data-theme` override, element defaults in a base layer and components in a components layer so that utilities win). `docs/research/anti-slop-ui.md` carries the copied hard rules.
- Pages: `/`, `/shop` (URL-driven search, set, rarity, type, condition, price, stock, sort and page; sheet on phones), `/cards/[slug]`, `/sealed`, `/sealed/[slug]`, `/sets`, `/cart`, `/checkout`, not-found, sitemap and robots. Card and sealed pages carry per-page titles, descriptions and Open Graph images.
- `lib/cart.tsx` keeps the cart in localStorage through `useSyncExternalStore`, caps quantity at variant stock or the sealed purchase limit, and feeds the header count.
- `components/CheckoutForm.tsx` validates email, address and a 5-digit ZIP, offers three shipping methods, shows the payment placeholder and keeps Place order disabled with the notice.
- `next.config.ts` adds `remotePatterns` for the two image hosts and turns off the Turbopack build cache so that preview CSS compiles from source.

## Test evidence

- `verify-run.sh` result: pass against [tcg-store-git-jon-task-1-jontz.vercel.app](https://tcg-store-git-jon-task-1-jontz.vercel.app) (HEAD_SHA 59a46ee, HTTP 200, 390-wide layout reports no horizontal overflow).
- Screenshots committed under `docs/screenshots/`, one desktop and one mobile (~390px) capture from the verify run:
  - Desktop: [verify-home-desktop.jpg](https://github.com/j0ntz/tcg-store/blob/jon/task-1/docs/screenshots/verify-home-desktop.jpg)
  - Mobile: [verify-home-mobile.jpg](https://github.com/j0ntz/tcg-store/blob/jon/task-1/docs/screenshots/verify-home-mobile.jpg)
- The builder's captures of every page at 1200 and 390, with light and dark home and card pages, are the `d-*` and `m-*` files in the same folder, for example [d-shop.jpg](https://github.com/j0ntz/tcg-store/blob/jon/task-1/docs/screenshots/d-shop.jpg), [m-shop-sheet.jpg](https://github.com/j0ntz/tcg-store/blob/jon/task-1/docs/screenshots/m-shop-sheet.jpg), [d-home-dark.jpg](https://github.com/j0ntz/tcg-store/blob/jon/task-1/docs/screenshots/d-home-dark.jpg), [m-card-dark.jpg](https://github.com/j0ntz/tcg-store/blob/jon/task-1/docs/screenshots/m-card-dark.jpg) and [m-checkout-errors.jpg](https://github.com/j0ntz/tcg-store/blob/jon/task-1/docs/screenshots/m-checkout-errors.jpg).
- Acceptance flows driven in headless Chrome against the preview:
  - Home search for "charizard" lands on `/shop?q=charizard` with 8 cards.
  - Ticking the 151 set narrows 1044 cards to 187 at `/shop?set=151`; adding Illustration Rare narrows to 11 at `/shop?set=151&rarity=Illustration+Rare`.
  - On a card page, choosing Lightly Played and adding to cart stores that condition in `tcg-store.cart.v1` and the header count reads 1; the count survives a reload.
  - `/cart` shows the line with its condition, a quantity select capped at the 2 in stock, and the free tracked shipping line for a subtotal over $75.
  - `/checkout` flags ZIP `1234` with "Enter a 5-digit ZIP code", shows "Payment is not connected yet", and Place order is disabled with the notice.
  - Unknown card and sealed slugs return 404; an empty search shows "No cards match" with Include sold out and Clear the search links; the sitemap lists 1188 URLs.
- Mobile captures at 390 wide of `/shop`, a card page and `/cart` report no horizontal overflow, and the home first screen at 390 shows the same promise bar, nav, cart count, hero and search as desktop.

## Decisions (defaults taken)

- Open wireframe questions were taken on the simpler side by the builder, as listed in the PR body: stock set images instead of exact-copy photos, no market-price reference line, no preorders or cart holds, US shipping only, no sign-in, graded cards, express pay, restock form or order-confirmed page. All are reversible follow-ups.
- The Classic Collection mini set (`me55c`, 13 cards) is excluded from the seed by a minimum set size. Reversible by lowering `MIN_SET_SIZE`.
- 822 of 1159 cards had no TCGplayer market price in the API. Those are priced from rarity floors, reversible by re-running the seed when prices appear.

## Notes and follow-ups

- Payments (Stripe or Square) and accounts are out of scope by the issue and remain follow-up tasks. Notify me on sold-out rows is a disabled placeholder for the same reason.
- Large scrydex card images can time out on a cold `next/image` fetch, which leaves an empty well until the next request. No config knob exists for that timeout; a follow-up could pre-warm or proxy the images.
- The route page files use Next.js default-export functions rather than the `React.FC` component form. The framework requires default exports there, and the rest of the component tree follows the repo standard.
