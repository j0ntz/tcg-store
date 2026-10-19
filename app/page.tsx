import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { CardTile, SealedTile, SetTile, TileGrid } from "@/components/Tiles";
import { newArrivals, sealed, sets } from "@/lib/catalog";
import { STORE_NAME } from "@/lib/store";

export const metadata: Metadata = {
  title: { absolute: `${STORE_NAME} · Pokémon singles and sealed product` },
  description: "Pokémon TCG singles from the newest sets in every condition, plus sealed boxes and bundles. Free tracked shipping over $75.",
};

const PROMISES = [
  {
    title: "Packed to survive the mail",
    body: "Penny sleeve, toploader, and team bag inside a bubble mailer. Orders over $250 ship with signature confirmation.",
  },
  {
    title: "Conditions you can check",
    body: "Every single lists its condition next to the price: Near Mint, Lightly Played, Moderately Played, or Heavily Played.",
  },
  {
    title: "14-day returns",
    body: "If a card arrives in worse shape than its listing, send it back for a full refund.",
  },
];

export default function HomePage() {
  const arrivals = newArrivals(8);
  const sealedRow = sealed.filter((p) => p.quantity > 0).slice(0, 6);
  return (
    <div className="container flex flex-col gap-12 md:gap-16 py-8 md:py-12">
      <section className="flex flex-col gap-5 max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">Pokémon singles, graded by hand and priced by condition.</h1>
        <form action="/shop" method="get" role="search" className="flex gap-2">
          <label htmlFor="hero-q" className="sr-only">
            Search singles
          </label>
          <input id="hero-q" name="q" type="search" className="input" placeholder="Search by card name, number, or set" autoComplete="off" />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
        <p className="text-sm text-ink-2">
          Free tracked shipping on orders over $75. Ships in 1 business day. Every single sleeved and toploaded.
        </p>
      </section>

      <section>
        <SectionHeading title="New arrivals" href="/shop" linkLabel="Shop all singles" />
        <TileGrid>
          {arrivals.map((card, index) => (
            <CardTile key={card.id} card={card} isNew phoneHidden={index >= 4} />
          ))}
        </TileGrid>
      </section>

      <section>
        <SectionHeading title="Shop by set" href="/sets" linkLabel="All sets" />
        <TileGrid wide>
          {sets.map((set) => (
            <SetTile key={set.id} set={set} />
          ))}
        </TileGrid>
      </section>

      <section>
        <SectionHeading title="Sealed product" href="/sealed" linkLabel="Shop sealed" />
        <TileGrid wide>
          {sealedRow.map((product) => (
            <SealedTile key={product.id} product={product} />
          ))}
        </TileGrid>
      </section>

      <section className="border-t border-line pt-8">
        <h2 className="text-lg font-bold mb-4">How orders ship</h2>
        <dl className="grid gap-6 md:grid-cols-3">
          {PROMISES.map((promise) => (
            <div key={promise.title} className="flex flex-col gap-1">
              <dt className="font-semibold">{promise.title}</dt>
              <dd className="text-sm text-ink-2">{promise.body}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm mt-6">
          <Link href="/sealed" className="text-brand font-medium">
            Sealed product
          </Link>{" "}
          ships boxed with padding and is limited per order.
        </p>
      </section>
    </div>
  );
}
